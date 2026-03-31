import { Router, type IRouter } from "express";
import { db, platformConnectionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ConnectPlatformBody } from "@workspace/api-zod";

const router: IRouter = Router();

const DEMO_USER_ID = 1;

const PLATFORM_FOLLOWERS: Record<string, number> = {
  facebook: 8420,
  youtube: 15300,
  tiktok: 42100,
  instagram: 22800,
  twitter: 5600,
};

router.get("/", async (req, res) => {
  try {
    const connections = await db.select().from(platformConnectionsTable).where(eq(platformConnectionsTable.userId, DEMO_USER_ID));
    return res.json(connections.map(c => ({
      id: String(c.id),
      platform: c.platform,
      accountName: c.accountName,
      accountId: c.accountId,
      connected: c.connected,
      connectedAt: c.connectedAt.toISOString(),
      followers: c.followers,
      avatar: c.avatar,
    })));
  } catch (err) {
    req.log.error({ err }, "Error listing platforms");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = ConnectPlatformBody.parse(req.body);

    // Check if this exact accountId already exists for this platform
    const existing = await db.select().from(platformConnectionsTable)
      .where(and(
        eq(platformConnectionsTable.userId, DEMO_USER_ID),
        eq(platformConnectionsTable.platform, body.platform),
        eq(platformConnectionsTable.accountId, body.accountId)
      )).limit(1);

    if (existing.length > 0) {
      // Just re-enable it if it was disconnected
      await db.update(platformConnectionsTable)
        .set({ connected: true })
        .where(eq(platformConnectionsTable.id, existing[0].id));
      const updated = await db.select().from(platformConnectionsTable).where(eq(platformConnectionsTable.id, existing[0].id)).limit(1);
      const c = updated[0];
      return res.json({
        id: String(c.id),
        platform: c.platform,
        accountName: c.accountName,
        accountId: c.accountId,
        connected: c.connected,
        connectedAt: c.connectedAt.toISOString(),
        followers: c.followers,
        avatar: c.avatar,
      });
    }

    // Randomize followers a bit per account
    const baseFollowers = PLATFORM_FOLLOWERS[body.platform] || 1000;
    const variance = Math.floor(baseFollowers * 0.4);
    const followers = baseFollowers + Math.floor(Math.random() * variance * 2) - variance;

    const inserted = await db.insert(platformConnectionsTable).values({
      userId: DEMO_USER_ID,
      platform: body.platform,
      accountName: body.accountName,
      accountId: body.accountId,
      connected: true,
      followers: Math.max(100, followers),
    }).returning();

    const c = inserted[0];
    return res.json({
      id: String(c.id),
      platform: c.platform,
      accountName: c.accountName,
      accountId: c.accountId,
      connected: c.connected,
      connectedAt: c.connectedAt.toISOString(),
      followers: c.followers,
      avatar: c.avatar,
    });
  } catch (err) {
    req.log.error({ err }, "Error connecting platform");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:platformId", async (req, res) => {
  try {
    const platformId = Number(req.params.platformId);
    await db.update(platformConnectionsTable)
      .set({ connected: false })
      .where(and(
        eq(platformConnectionsTable.id, platformId),
        eq(platformConnectionsTable.userId, DEMO_USER_ID)
      ));
    return res.json({ success: true, message: "Platform disconnected" });
  } catch (err) {
    req.log.error({ err }, "Error disconnecting platform");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
