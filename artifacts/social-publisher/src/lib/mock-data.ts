import type { 
  Post, 
  PlatformConnection, 
  AnalyticsOverview, 
  UserProfile,
  PostAnalytics 
} from "@workspace/api-client-react";

export const MOCK_USER = {
  id: "usr_123",
  email: "demo@socialconnect.app",
  name: "ODI BEST ETT",
  avatar: "/images/avatar-placeholder.png",
  createdAt: new Date().toISOString()
};

export const MOCK_PROFILE: UserProfile = {
  id: "prof_123",
  userId: "usr_123",
  displayName: "ODI BEST ETT",
  bio: "Creating the best content across the universe. Digital Creator & Tech Enthusiast.",
  website: "https://socialconnect.app",
  avatar: "/images/avatar-placeholder.png",
  postsCount: 142,
  followersCount: 1250400,
  platformsConnected: 4
};

export const MOCK_PLATFORMS: PlatformConnection[] = [
  {
    id: "plat_1",
    platform: "youtube",
    accountName: "ODI Tech Reviews",
    accountId: "yt_123",
    connected: true,
    connectedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    followers: 850000,
    avatar: null
  },
  {
    id: "plat_2",
    platform: "instagram",
    accountName: "@odi_best_ett",
    accountId: "ig_123",
    connected: true,
    connectedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    followers: 320400,
    avatar: null
  },
  {
    id: "plat_3",
    platform: "tiktok",
    accountName: "@odi.creates",
    accountId: "tt_123",
    connected: true,
    connectedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    followers: 80000,
    avatar: null
  },
  {
    id: "plat_4",
    platform: "twitter",
    accountName: "@odi_tweets",
    accountId: "tw_123",
    connected: false,
    connectedAt: new Date().toISOString(),
    followers: 0,
    avatar: null
  },
  {
    id: "plat_5",
    platform: "facebook",
    accountName: "ODI Best ETT Official",
    accountId: "fb_123",
    connected: false,
    connectedAt: new Date().toISOString(),
    followers: 0,
    avatar: null
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: "post_1",
    userId: "usr_123",
    title: "The Future of AI is Here 🤖",
    caption: "Just got my hands on the latest AI tools and the workflow is INSANE. Check out how I built a full app in 10 minutes. #AI #Tech #Coding",
    mediaUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    mediaType: "image",
    status: "published",
    platforms: ["youtube", "instagram", "tiktok"],
    platformCaptions: [],
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    totalLikes: 45200,
    totalViews: 320000,
    totalShares: 8400,
    totalComments: 1205
  },
  {
    id: "post_2",
    userId: "usr_123",
    title: "My Desk Setup 2025 💻",
    caption: "Upgraded the battle station. What do you guys think? Drop your setups in the comments! 👇",
    mediaUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80",
    mediaType: "image",
    status: "scheduled",
    platforms: ["instagram", "twitter"],
    platformCaptions: [],
    scheduledAt: new Date(Date.now() + 86400000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    totalLikes: 0,
    totalViews: 0,
    totalShares: 0,
    totalComments: 0
  },
  {
    id: "post_3",
    userId: "usr_123",
    title: "10 Tips for Better Code 🚀",
    caption: "Stop writing messy code. Here are 10 rules I live by to keep my codebase clean and scalable.",
    mediaType: "text",
    status: "draft",
    platforms: ["twitter"],
    platformCaptions: [],
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    totalLikes: 0,
    totalViews: 0,
    totalShares: 0,
    totalComments: 0
  },
  {
    id: "post_4",
    userId: "usr_123",
    title: "Behind the Scenes Vlog",
    caption: "Ever wonder how much work goes into a 10-minute video? Here's the raw truth.",
    mediaUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
    mediaType: "video",
    status: "published",
    platforms: ["youtube", "tiktok"],
    platformCaptions: [],
    publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    totalLikes: 112000,
    totalViews: 850000,
    totalShares: 15000,
    totalComments: 3400
  }
];

const generateChartData = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.floor(Math.random() * 50000) + 10000,
      likes: Math.floor(Math.random() * 5000) + 1000,
      shares: Math.floor(Math.random() * 1000) + 100,
    });
  }
  return data;
};

export const MOCK_ANALYTICS: AnalyticsOverview = {
  totalPosts: 142,
  totalViews: 2450000,
  totalLikes: 320000,
  totalShares: 45000,
  totalComments: 18500,
  growthRate: 24.5,
  topPlatform: "youtube",
  chartData: generateChartData(),
  platformBreakdown: [
    { platform: "youtube", views: 1200000, likes: 150000, posts: 45 },
    { platform: "instagram", views: 800000, likes: 120000, posts: 80 },
    { platform: "tiktok", views: 400000, likes: 45000, posts: 15 },
    { platform: "twitter", views: 50000, likes: 5000, posts: 2 },
  ]
};

export const MOCK_POST_ANALYTICS: PostAnalytics[] = MOCK_POSTS.filter(p => p.status === 'published').map(p => ({
  postId: p.id,
  title: p.title,
  platforms: p.platforms,
  views: p.totalViews,
  likes: p.totalLikes,
  shares: p.totalShares,
  comments: p.totalComments,
  publishedAt: p.publishedAt
}));
