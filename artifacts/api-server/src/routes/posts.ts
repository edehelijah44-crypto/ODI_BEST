import { Router, type IRouter } from "express";
import { db, postsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreatePostBody, UpdatePostBody } from "@workspace/api-zod";

const router: IRouter = Router();

const DEMO_USER_ID = 1;

function mapPost(p: typeof postsTable.$inferSelect) {
  return {
    id: String(p.id),
    userId: String(p.userId),
    title: p.title,
    caption: p.caption,
    mediaUrl: p.mediaUrl,
    mediaType: p.mediaType,
    status: p.status,
    platforms: (p.platforms as string[]) || [],
    platformCaptions: (p.platformCaptions as any[]) || [],
    scheduledAt: p.scheduledAt?.toISOString() ?? null,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    totalLikes: p.totalLikes,
    totalViews: p.totalViews,
    totalShares: p.totalShares,
    totalComments: p.totalComments,
  };
}

router.get("/", async (req, res) => {
  try {
    const { status, limit = "20", offset = "0" } = req.query as Record<string, string>;
    let query = db.select().from(postsTable).where(eq(postsTable.userId, DEMO_USER_ID)).$dynamic();

    if (status) {
      query = query.where(and(eq(postsTable.userId, DEMO_USER_ID), eq(postsTable.status, status)));
    }

    const posts = await query.orderBy(desc(postsTable.createdAt)).limit(Number(limit)).offset(Number(offset));

    const allPosts = await db.select().from(postsTable).where(eq(postsTable.userId, DEMO_USER_ID));
    return res.json({ posts: posts.map(mapPost), total: allPosts.length });
  } catch (err) {
    req.log.error({ err }, "Error listing posts");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreatePostBody.parse(req.body);
    const inserted = await db.insert(postsTable).values({
      userId: DEMO_USER_ID,
      title: body.title,
      caption: body.caption,
      mediaUrl: body.mediaUrl || null,
      mediaType: body.mediaType || null,
      platforms: body.platforms as string[],
      platformCaptions: (body.platformCaptions || []) as any[],
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      status: body.scheduledAt ? "scheduled" : "draft",
    }).returning();

    return res.status(201).json(mapPost(inserted[0]));
  } catch (err) {
    req.log.error({ err }, "Error creating post");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:postId", async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const posts = await db.select().from(postsTable).where(and(eq(postsTable.id, postId), eq(postsTable.userId, DEMO_USER_ID))).limit(1);
    if (posts.length === 0) return res.status(404).json({ error: "Post not found" });
    return res.json(mapPost(posts[0]));
  } catch (err) {
    req.log.error({ err }, "Error getting post");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:postId", async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const body = UpdatePostBody.parse(req.body);

    const updateData: any = { updatedAt: new Date() };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.caption !== undefined) updateData.caption = body.caption;
    if (body.mediaUrl !== undefined) updateData.mediaUrl = body.mediaUrl;
    if (body.mediaType !== undefined) updateData.mediaType = body.mediaType;
    if (body.platforms !== undefined) updateData.platforms = body.platforms;
    if (body.platformCaptions !== undefined) updateData.platformCaptions = body.platformCaptions;
    if (body.scheduledAt !== undefined) {
      updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
      updateData.status = body.scheduledAt ? "scheduled" : "draft";
    }

    await db.update(postsTable).set(updateData).where(and(eq(postsTable.id, postId), eq(postsTable.userId, DEMO_USER_ID)));
    const posts = await db.select().from(postsTable).where(eq(postsTable.id, postId)).limit(1);
    return res.json(mapPost(posts[0]));
  } catch (err) {
    req.log.error({ err }, "Error updating post");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:postId", async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    await db.delete(postsTable).where(and(eq(postsTable.id, postId), eq(postsTable.userId, DEMO_USER_ID)));
    return res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting post");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:postId/publish", async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const posts = await db.select().from(postsTable).where(and(eq(postsTable.id, postId), eq(postsTable.userId, DEMO_USER_ID))).limit(1);
    if (posts.length === 0) return res.status(404).json({ error: "Post not found" });

    const post = posts[0];
    const platforms = (post.platforms as string[]) || [];

    const results = platforms.map((platform: string) => ({
      platform,
      success: true,
      postUrl: `https://${platform}.com/posts/${postId}`,
      error: null,
    }));

    const fakeViews = Math.floor(Math.random() * 5000) + 500;
    const fakeLikes = Math.floor(fakeViews * 0.08);
    const fakeShares = Math.floor(fakeViews * 0.02);
    const fakeComments = Math.floor(fakeViews * 0.01);

    await db.update(postsTable).set({
      status: "published",
      publishedAt: new Date(),
      totalViews: fakeViews,
      totalLikes: fakeLikes,
      totalShares: fakeShares,
      totalComments: fakeComments,
      updatedAt: new Date(),
    }).where(eq(postsTable.id, postId));

    return res.json({
      postId: String(postId),
      status: "published",
      results,
    });
  } catch (err) {
    req.log.error({ err }, "Error publishing post");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
