import { Router, type IRouter } from "express";
import { db, postsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

const DEMO_USER_ID = 1;

function generateChartData(period: string) {
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      views: Math.floor(Math.random() * 3000) + 200,
      likes: Math.floor(Math.random() * 300) + 20,
      shares: Math.floor(Math.random() * 100) + 5,
    });
  }
  return data;
}

router.get("/", async (req, res) => {
  try {
    const period = (req.query.period as string) || "30d";
    const posts = await db.select().from(postsTable).where(eq(postsTable.userId, DEMO_USER_ID));
    const publishedPosts = posts.filter(p => p.status === "published");

    const totalViews = publishedPosts.reduce((sum, p) => sum + p.totalViews, 0);
    const totalLikes = publishedPosts.reduce((sum, p) => sum + p.totalLikes, 0);
    const totalShares = publishedPosts.reduce((sum, p) => sum + p.totalShares, 0);
    const totalComments = publishedPosts.reduce((sum, p) => sum + p.totalComments, 0);

    const platformMap: Record<string, { views: number; likes: number; posts: number }> = {};
    publishedPosts.forEach(p => {
      const platforms = (p.platforms as string[]) || [];
      platforms.forEach((platform: string) => {
        if (!platformMap[platform]) platformMap[platform] = { views: 0, likes: 0, posts: 0 };
        platformMap[platform].views += Math.floor(p.totalViews / platforms.length);
        platformMap[platform].likes += Math.floor(p.totalLikes / platforms.length);
        platformMap[platform].posts += 1;
      });
    });

    const platformBreakdown = Object.entries(platformMap).map(([platform, data]) => ({
      platform,
      ...data,
    }));

    const topPlatform = platformBreakdown.length > 0
      ? platformBreakdown.sort((a, b) => b.views - a.views)[0].platform
      : null;

    return res.json({
      totalPosts: posts.length,
      totalViews: totalViews || 24800,
      totalLikes: totalLikes || 1980,
      totalShares: totalShares || 620,
      totalComments: totalComments || 248,
      growthRate: 23.4,
      topPlatform: topPlatform || "tiktok",
      chartData: generateChartData(period),
      platformBreakdown: platformBreakdown.length > 0 ? platformBreakdown : [
        { platform: "facebook", views: 6200, likes: 480, posts: 5 },
        { platform: "youtube", views: 8400, likes: 620, posts: 4 },
        { platform: "tiktok", views: 12400, likes: 980, posts: 7 },
        { platform: "instagram", views: 7200, likes: 560, posts: 6 },
      ],
    });
  } catch (err) {
    req.log.error({ err }, "Error getting analytics");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const posts = await db.select().from(postsTable)
      .where(eq(postsTable.userId, DEMO_USER_ID))
      .orderBy(desc(postsTable.totalViews))
      .limit(limit);

    return res.json(posts.map(p => ({
      postId: String(p.id),
      title: p.title,
      platforms: (p.platforms as string[]) || [],
      views: p.totalViews,
      likes: p.totalLikes,
      shares: p.totalShares,
      comments: p.totalComments,
      publishedAt: p.publishedAt?.toISOString() ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Error getting post analytics");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
