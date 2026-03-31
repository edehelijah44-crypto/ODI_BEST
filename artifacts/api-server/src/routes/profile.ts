import { Router, type IRouter } from "express";
import { db, profilesTable, postsTable, platformConnectionsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { UpdateProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

function getDemoUserId(): number {
  return 1;
}

router.get("/", async (req, res) => {
  try {
    const userId = getDemoUserId();

    let profile = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    if (profile.length === 0) {
      await db.insert(profilesTable).values({ userId, displayName: "ODI BEST ETT" });
      profile = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    }

    const [postsResult] = await db.select({ count: count() }).from(postsTable).where(eq(postsTable.userId, userId));
    const [platformsResult] = await db.select({ count: count() }).from(platformConnectionsTable).where(eq(platformConnectionsTable.userId, userId));

    const p = profile[0];
    return res.json({
      id: String(p.id),
      userId: String(p.userId),
      displayName: p.displayName,
      bio: p.bio,
      website: p.website,
      avatar: p.avatar,
      postsCount: Number(postsResult.count),
      followersCount: 12400,
      platformsConnected: Number(platformsResult.count),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting profile");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/", async (req, res) => {
  try {
    const userId = getDemoUserId();
    const body = UpdateProfileBody.parse(req.body);

    let profile = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    if (profile.length === 0) {
      await db.insert(profilesTable).values({ userId, displayName: body.displayName || "ODI BEST ETT" });
    } else {
      const updateData: any = { updatedAt: new Date() };
      if (body.displayName !== undefined) updateData.displayName = body.displayName;
      if (body.bio !== undefined) updateData.bio = body.bio;
      if (body.website !== undefined) updateData.website = body.website;
      await db.update(profilesTable).set(updateData).where(eq(profilesTable.userId, userId));
    }

    profile = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    const [postsResult] = await db.select({ count: count() }).from(postsTable).where(eq(postsTable.userId, userId));
    const [platformsResult] = await db.select({ count: count() }).from(platformConnectionsTable).where(eq(platformConnectionsTable.userId, userId));

    const p = profile[0];
    return res.json({
      id: String(p.id),
      userId: String(p.userId),
      displayName: p.displayName,
      bio: p.bio,
      website: p.website,
      avatar: p.avatar,
      postsCount: Number(postsResult.count),
      followersCount: 12400,
      platformsConnected: Number(platformsResult.count),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating profile");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
