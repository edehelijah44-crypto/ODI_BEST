import { Router, type IRouter } from "express";
import { db, platformConnectionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

const DEMO_USER_ID = 1;

// OAuth state store (in production, use Redis or DB)
const oauthStateStore = new Map<string, { platform: string; timestamp: number }>();

function getCallbackUrl(platform: string): string {
  const domain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:8080";
  return `https://${domain}/api/oauth/${platform}/callback`;
}

function isConfigured(keys: string[]): boolean {
  return keys.every(k => !!process.env[k]);
}

const PLATFORM_CONFIG: Record<string, {
  envKeys: string[];
  buildAuthUrl: (state: string, callbackUrl: string) => string;
  exchangeCode: (code: string, callbackUrl: string) => Promise<{ accessToken: string; refreshToken?: string; accountName: string; accountId: string; followers: number }>;
}> = {
  facebook: {
    envKeys: ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"],
    buildAuthUrl: (state, callbackUrl) => {
      const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID!,
        redirect_uri: callbackUrl,
        scope: "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish",
        state,
        response_type: "code",
      });
      return `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
    },
    exchangeCode: async (code, callbackUrl) => {
      const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?` +
        new URLSearchParams({ client_id: process.env.FACEBOOK_APP_ID!, client_secret: process.env.FACEBOOK_APP_SECRET!, code, redirect_uri: callbackUrl }));
      const tokenData = await tokenRes.json() as any;
      const accessToken = tokenData.access_token;
      const meRes = await fetch(`https://graph.facebook.com/me?fields=id,name,followers_count&access_token=${accessToken}`);
      const me = await meRes.json() as any;
      return { accessToken, accountName: me.name || "My Facebook", accountId: me.id || "fb_user", followers: me.followers_count || 0 };
    },
  },
  instagram: {
    envKeys: ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"],
    buildAuthUrl: (state, callbackUrl) => {
      const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID!,
        redirect_uri: callbackUrl,
        scope: "instagram_basic,instagram_content_publish,instagram_manage_insights",
        state,
        response_type: "code",
      });
      return `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
    },
    exchangeCode: async (code, callbackUrl) => {
      const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?` +
        new URLSearchParams({ client_id: process.env.FACEBOOK_APP_ID!, client_secret: process.env.FACEBOOK_APP_SECRET!, code, redirect_uri: callbackUrl }));
      const tokenData = await tokenRes.json() as any;
      const accessToken = tokenData.access_token;
      const meRes = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${accessToken}`);
      const me = await meRes.json() as any;
      return { accessToken, accountName: `@${(me.name || "instagram").toLowerCase().replace(/\s/g, "")}`, accountId: me.id || "ig_user", followers: 0 };
    },
  },
  youtube: {
    envKeys: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    buildAuthUrl: (state, callbackUrl) => {
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: callbackUrl,
        scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
        state,
        response_type: "code",
        access_type: "offline",
        prompt: "consent",
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    },
    exchangeCode: async (code, callbackUrl) => {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: callbackUrl, grant_type: "authorization_code" }),
      });
      const tokenData = await tokenRes.json() as any;
      const channelRes = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const channelData = await channelRes.json() as any;
      const channel = channelData.items?.[0];
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        accountName: channel?.snippet?.title || "My YouTube Channel",
        accountId: channel?.id || "yt_user",
        followers: parseInt(channel?.statistics?.subscriberCount || "0"),
      };
    },
  },
  twitter: {
    envKeys: ["TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"],
    buildAuthUrl: (state, callbackUrl) => {
      const codeVerifier = crypto.randomBytes(32).toString("base64url");
      const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
      oauthStateStore.set(state, { platform: "twitter", timestamp: Date.now() });
      // Store verifier alongside state
      oauthStateStore.set(`${state}_verifier`, { platform: codeVerifier, timestamp: Date.now() });
      const params = new URLSearchParams({
        client_id: process.env.TWITTER_CLIENT_ID!,
        redirect_uri: callbackUrl,
        scope: "tweet.write tweet.read users.read offline.access",
        state,
        response_type: "code",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });
      return `https://twitter.com/i/oauth2/authorize?${params}`;
    },
    exchangeCode: async (code, callbackUrl) => {
      const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({ code, redirect_uri: callbackUrl, grant_type: "authorization_code", code_verifier: "placeholder" }),
      });
      const tokenData = await tokenRes.json() as any;
      const meRes = await fetch("https://api.twitter.com/2/users/me?user.fields=public_metrics", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const me = await meRes.json() as any;
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        accountName: `@${me.data?.username || "twitteruser"}`,
        accountId: me.data?.id || "tw_user",
        followers: me.data?.public_metrics?.followers_count || 0,
      };
    },
  },
  tiktok: {
    envKeys: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
    buildAuthUrl: (state, callbackUrl) => {
      const params = new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        redirect_uri: callbackUrl,
        scope: "user.info.basic,video.publish,video.upload",
        state,
        response_type: "code",
      });
      return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
    },
    exchangeCode: async (code, callbackUrl) => {
      const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_key: process.env.TIKTOK_CLIENT_KEY!, client_secret: process.env.TIKTOK_CLIENT_SECRET!, code, grant_type: "authorization_code", redirect_uri: callbackUrl }),
      });
      const tokenData = await tokenRes.json() as any;
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        accountName: `@${tokenData.open_id?.slice(0, 10) || "tiktokuser"}`,
        accountId: tokenData.open_id || "tt_user",
        followers: 0,
      };
    },
  },
};

// GET /api/oauth/:platform/status — check if credentials are configured
router.get("/:platform/status", (req, res) => {
  const { platform } = req.params;
  const config = PLATFORM_CONFIG[platform];
  if (!config) return res.status(404).json({ error: "Unknown platform" });
  const configured = isConfigured(config.envKeys);
  return res.json({ platform, configured, requiredKeys: config.envKeys });
});

// GET /api/oauth/:platform/connect — start OAuth flow (opens in popup)
router.get("/:platform/connect", (req, res) => {
  const { platform } = req.params;
  const config = PLATFORM_CONFIG[platform];
  if (!config) return res.status(404).send("Unknown platform");

  if (!isConfigured(config.envKeys)) {
    return res.status(200).send(`
      <!DOCTYPE html><html><head><title>Setup Required</title>
      <style>body{font-family:system-ui;background:#0f0f1a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px;text-align:center;padding:20px}
      h2{font-size:20px;margin:0}p{color:#888;font-size:14px;max-width:320px;line-height:1.6}
      .keys{background:#1a1a2e;border:1px solid #333;border-radius:8px;padding:12px;font-family:monospace;font-size:13px;color:#a78bfa;text-align:left;width:100%;max-width:340px}
      button{background:#7c3aed;color:#fff;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px}</style></head>
      <body>
        <h2>🔑 API Keys Required</h2>
        <p>To connect <strong>${platform}</strong>, add these keys to your Replit Secrets:</p>
        <div class="keys">${config.envKeys.map(k => `${k}`).join("<br>")}</div>
        <p style="font-size:12px">Get your keys from the ${platform} Developer Portal, then add them in Replit → Secrets tab.</p>
        <button onclick="window.close()">Close</button>
      </body></html>
    `);
  }

  const state = crypto.randomBytes(16).toString("hex");
  oauthStateStore.set(state, { platform, timestamp: Date.now() });

  const callbackUrl = getCallbackUrl(platform);
  const authUrl = config.buildAuthUrl(state, callbackUrl);
  return res.redirect(authUrl);
});

// GET /api/oauth/:platform/callback — handle OAuth callback
router.get("/:platform/callback", async (req, res) => {
  const { platform } = req.params;
  const { code, state, error } = req.query as Record<string, string>;

  const successHtml = (name: string) => `
    <!DOCTYPE html><html><head><title>Connected!</title>
    <style>body{font-family:system-ui;background:#0f0f1a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px;text-align:center}
    .check{font-size:48px}.h2{font-size:22px;font-weight:700;margin:0}.p{color:#888;font-size:14px}</style></head>
    <body>
      <div class="check">✅</div>
      <h2>${name} connected!</h2>
      <p style="color:#888;font-size:14px">You can close this window.</p>
      <script>
        setTimeout(() => {
          window.opener?.postMessage({ type: 'OAUTH_SUCCESS', platform: '${platform}' }, '*');
          window.close();
        }, 1200);
      </script>
    </body></html>`;

  const errorHtml = (msg: string) => `
    <!DOCTYPE html><html><head><title>Error</title>
    <style>body{font-family:system-ui;background:#0f0f1a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:12px;text-align:center;padding:20px}
    h2{font-size:20px;margin:0;color:#f87171}p{color:#888;font-size:14px}button{background:#7c3aed;color:#fff;border:none;padding:10px 24px;border-radius:8px;cursor:pointer}</style></head>
    <body>
      <h2>❌ Connection Failed</h2>
      <p>${msg}</p>
      <button onclick="window.close()">Close</button>
      <script>setTimeout(()=>{ window.opener?.postMessage({type:'OAUTH_ERROR',platform:'${platform}',error:'${msg}'},'*'); },500);</script>
    </body></html>`;

  if (error) return res.send(errorHtml(`Authorization denied: ${error}`));

  const stateData = oauthStateStore.get(state);
  if (!stateData || stateData.platform !== platform) {
    return res.send(errorHtml("Invalid or expired session. Please try again."));
  }
  oauthStateStore.delete(state);

  const config = PLATFORM_CONFIG[platform];
  if (!config) return res.send(errorHtml("Unknown platform"));

  try {
    const callbackUrl = getCallbackUrl(platform);
    const { accessToken, refreshToken, accountName, accountId, followers } = await config.exchangeCode(code, callbackUrl);

    // Check for existing account
    const existing = await db.select().from(platformConnectionsTable)
      .where(and(
        eq(platformConnectionsTable.userId, DEMO_USER_ID),
        eq(platformConnectionsTable.platform, platform),
        eq(platformConnectionsTable.accountId, accountId),
      )).limit(1);

    if (existing.length > 0) {
      await db.update(platformConnectionsTable)
        .set({ connected: true, accessToken, refreshToken: refreshToken || null, accountName })
        .where(eq(platformConnectionsTable.id, existing[0].id));
    } else {
      await db.insert(platformConnectionsTable).values({
        userId: DEMO_USER_ID,
        platform,
        accountName,
        accountId,
        connected: true,
        accessToken,
        refreshToken: refreshToken || null,
        followers,
      });
    }

    return res.send(successHtml(accountName));
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return res.send(errorHtml("Could not complete connection. Please try again."));
  }
});

export default router;
