import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlatforms, useDisconnectPlatform } from "@/hooks/use-app-api";
import { formatNumber } from "@/lib/utils";
import {
  CheckCircle2, Loader2, Users, Trash2, Plus,
  ShieldCheck, Key, ExternalLink, Wifi, AlertCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// ─── Platform definitions ────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook",
    emoji: "f",
    gradient: "from-[#1877F2] to-[#0d5fc4]",
    border: "border-[#1877F2]/30",
    glow: "shadow-[0_0_32px_rgba(24,119,242,0.18)]",
    textColor: "text-[#4d9ef7]",
    description: "Pages, groups & personal profiles",
    keysNeeded: ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"],
    devUrl: "https://developers.facebook.com/apps",
  },
  {
    id: "youtube",
    name: "YouTube",
    emoji: "▶",
    gradient: "from-[#FF0000] to-[#b50000]",
    border: "border-[#FF0000]/30",
    glow: "shadow-[0_0_32px_rgba(255,0,0,0.15)]",
    textColor: "text-[#ff5555]",
    description: "Channels, Shorts & live streams",
    keysNeeded: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    devUrl: "https://console.cloud.google.com/apis/credentials",
  },
  {
    id: "tiktok",
    name: "TikTok",
    emoji: "♪",
    gradient: "from-[#ff0050] via-[#010101] to-[#00f2ea]",
    border: "border-white/15",
    glow: "shadow-[0_0_32px_rgba(255,0,80,0.12)]",
    textColor: "text-[#ff0050]",
    description: "Videos, Stories & TikTok LIVE",
    keysNeeded: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
    devUrl: "https://developers.tiktok.com",
  },
  {
    id: "instagram",
    name: "Instagram",
    emoji: "◈",
    gradient: "from-[#833AB4] via-[#E1306C] to-[#F77737]",
    border: "border-pink-500/30",
    glow: "shadow-[0_0_32px_rgba(225,48,108,0.18)]",
    textColor: "text-pink-400",
    description: "Feed posts, Reels & Stories",
    keysNeeded: ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"],
    devUrl: "https://developers.facebook.com/apps",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    emoji: "𝕏",
    gradient: "from-[#14171A] to-[#2d3748]",
    border: "border-white/15",
    glow: "shadow-[0_0_32px_rgba(255,255,255,0.05)]",
    textColor: "text-sky-400",
    description: "Posts, threads & Spaces",
    keysNeeded: ["TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"],
    devUrl: "https://developer.twitter.com/en/portal/dashboard",
  },
];

type OAuthStatus = Record<string, boolean>; // platform → configured
type Account = { id: string; platform: string; accountName: string; followers: number; connected: boolean };

// ─── Individual platform card ────────────────────────────────────────────────
function PlatformCard({
  platform,
  accounts,
  oauthConfigured,
  onConnectSuccess,
}: {
  platform: typeof PLATFORMS[0];
  accounts: Account[];
  oauthConfigured: boolean;
  onConnectSuccess: (platform: string) => void;
}) {
  const [state, setState] = useState<"idle" | "opening" | "waiting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { mutateAsync: disconnect } = useDisconnectPlatform();
  const queryClient = useQueryClient();

  const connected = accounts.filter(a => a.connected);
  const isConnected = connected.length > 0;

  // Listen for OAuth postMessage from popup
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_SUCCESS" && event.data?.platform === platform.id) {
        setState("success");
        queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
        onConnectSuccess(platform.id);
        setTimeout(() => setState("idle"), 2000);
      }
      if (event.data?.type === "OAUTH_ERROR" && event.data?.platform === platform.id) {
        setState("error");
        setErrorMsg(event.data.error || "Connection failed");
        setTimeout(() => setState("idle"), 3000);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [platform.id]);

  const handleConnect = useCallback(() => {
    setState("opening");
    const width = 560;
    const height = 680;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);

    const popup = window.open(
      `/api/oauth/${platform.id}/connect`,
      `oauth_${platform.id}`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,scrollbars=1,status=0`
    );

    if (!popup) {
      setState("error");
      setErrorMsg("Popup blocked — please allow popups for this site.");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    setState("waiting");

    // Poll for popup closed
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        if (state === "waiting") setState("idle");
      }
    }, 500);
  }, [platform.id]);

  const handleDisconnect = async (id: string) => {
    await disconnect({ platformId: id });
    queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-[#0d0d1a] overflow-hidden transition-all duration-300
        ${isConnected ? `${platform.border} ${platform.glow}` : "border-white/8"}`}
    >
      {/* Top gradient bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${platform.gradient}`} />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0`}>
            {platform.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-base">{platform.name}</h3>
              {isConnected && (
                <span className="flex items-center gap-1 text-green-400 text-xs font-semibold bg-green-500/12 px-2 py-0.5 rounded-full">
                  <Wifi className="w-3 h-3" /> Live
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">{platform.description}</p>
          </div>
        </div>

        {/* Connected accounts */}
        <AnimatePresence>
          {connected.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
              {connected.map(acc => (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="flex items-center gap-2.5 bg-white/5 hover:bg-white/8 rounded-xl px-3 py-2.5 group transition-colors"
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${platform.gradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {acc.accountName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{acc.accountName}</p>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" />
                      {formatNumber(acc.followers)} followers
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-400 opacity-70" />
                    <button
                      onClick={() => handleDisconnect(acc.id)}
                      className="w-7 h-7 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {state === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-300 text-xs">{errorMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connect button */}
        {!oauthConfigured ? (
          // Keys not set up — show setup info
          <div className="space-y-2">
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <p className="text-amber-300 text-xs font-medium">API keys required to connect</p>
              </div>
              <div className="font-mono text-[10px] text-amber-200/60 space-y-0.5">
                {platform.keysNeeded.map(k => <div key={k}>{k}</div>)}
              </div>
            </div>
            <a
              href={platform.devUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-muted-foreground hover:text-white hover:border-white/25 text-sm font-medium transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Get API Keys
            </a>
          </div>
        ) : (
          // Configured — show OAuth connect button
          <button
            onClick={handleConnect}
            disabled={state === "opening" || state === "waiting" || state === "success"}
            className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 select-none
              ${state === "success"
                ? "bg-green-500/15 text-green-400 border border-green-500/25"
                : state === "waiting" || state === "opening"
                  ? "bg-white/5 text-muted-foreground border border-white/10 cursor-wait"
                  : isConnected
                    ? "border border-dashed border-white/15 text-muted-foreground hover:text-white hover:border-white/30 hover:bg-white/4"
                    : `bg-gradient-to-r ${platform.gradient} text-white shadow-lg hover:opacity-90 active:scale-[0.98]`
              }`}
          >
            {state === "opening" || state === "waiting" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Connecting to {platform.name}…</>
            ) : state === "success" ? (
              <><CheckCircle2 className="w-4 h-4" /> Connected successfully!</>
            ) : isConnected ? (
              <><Plus className="w-4 h-4" /> Add another account</>
            ) : (
              <><ShieldCheck className="w-4 h-4" /> Connect {platform.name}</>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Platforms() {
  const { data: accounts, isLoading } = usePlatforms();
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus>({});
  const queryClient = useQueryClient();

  // Fetch OAuth configuration status for all platforms
  useEffect(() => {
    Promise.all(
      PLATFORMS.map(p =>
        fetch(`/api/oauth/${p.id}/status`)
          .then(r => r.json())
          .then((d: any) => [p.id, d.configured] as [string, boolean])
          .catch(() => [p.id, false] as [string, boolean])
      )
    ).then(results => {
      setOauthStatus(Object.fromEntries(results));
    });
  }, []);

  const grouped = (accounts || []).reduce<Record<string, Account[]>>((acc, item) => {
    if (!acc[item.platform]) acc[item.platform] = [];
    acc[item.platform].push(item as Account);
    return acc;
  }, {});

  const totalConnected = (accounts || []).filter(a => a.connected).length;
  const totalFollowers = (accounts || []).filter(a => a.connected).reduce((s, a) => s + a.followers, 0);
  const configuredCount = Object.values(oauthStatus).filter(Boolean).length;
  const connectedPlatforms = PLATFORMS.filter(p => grouped[p.id]?.some(a => a.connected)).length;

  const handleConnectSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
  }, [queryClient]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Connect Your Accounts</h1>
        <p className="text-muted-foreground">One tap to link each platform — secure OAuth login, no passwords stored.</p>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-3 bg-green-500/8 border border-green-500/20 rounded-xl px-5 py-3">
        <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
        <div>
          <p className="text-green-300 text-sm font-semibold">Bank-grade secure OAuth 2.0</p>
          <p className="text-green-400/60 text-xs">We never store your passwords. Only secure access tokens, same as official apps use.</p>
        </div>
      </div>

      {/* Stats row */}
      {!isLoading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Platforms live", value: `${connectedPlatforms} / 5` },
            { label: "Total accounts", value: totalConnected },
            { label: "Combined reach", value: formatNumber(totalFollowers) },
          ].map(item => (
            <div key={item.label} className="bg-white/4 border border-white/8 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Setup notice if no platforms are configured */}
      {!isLoading && configuredCount === 0 && (
        <div className="bg-violet-500/8 border border-violet-500/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-violet-400" />
            <p className="text-white font-semibold">First-time setup — add your API keys</p>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            To enable real OAuth logins, register your app with each platform's developer portal and add the API keys to your <strong className="text-white">Replit Secrets</strong>. Each platform card below shows exactly which keys it needs and a link to get them.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-violet-300/70">
            {["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
              "TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET", "TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"].map(k => (
              <div key={k} className="bg-black/30 rounded-lg px-2 py-1">{k}</div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5].map(i => <div key={i} className="h-56 bg-white/5 rounded-2xl animate-pulse"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLATFORMS.map((platform, idx) => (
            <motion.div key={platform.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
              <PlatformCard
                platform={platform}
                accounts={grouped[platform.id] || []}
                oauthConfigured={oauthStatus[platform.id] ?? false}
                onConnectSuccess={handleConnectSuccess}
              />
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground/50 pb-4">
        OAuth 2.0 industry standard · Tokens encrypted at rest · Revoke access anytime from each platform's settings
      </p>
    </motion.div>
  );
}
