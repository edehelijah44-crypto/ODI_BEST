import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnalytics, usePosts, usePlatforms } from "@/hooks/use-app-api";
import { Eye, Heart, Share2, MessageCircle, ArrowUpRight, Plus, FileText, Link2, Zap } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Link } from "wouter";

const PLATFORM_QUICK = [
  { id: "facebook",  emoji: "📘", gradient: "from-[#1877F2] to-[#0d5fc4]" },
  { id: "youtube",   emoji: "▶️", gradient: "from-[#FF0000] to-[#cc0000]" },
  { id: "tiktok",    emoji: "🎵", gradient: "from-[#010101] to-[#444]" },
  { id: "instagram", emoji: "📸", gradient: "from-[#833AB4] via-[#E1306C] to-[#F77737]" },
  { id: "twitter",   emoji: "𝕏",  gradient: "from-[#14171A] to-[#333]" },
];

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics({ period: "30d" });
  const { data: postsData, isLoading: postsLoading } = usePosts({ limit: 5 });
  const { data: platforms } = usePlatforms();

  if (analyticsLoading || postsLoading) return <div className="animate-pulse h-96 bg-white/5 rounded-2xl"></div>;
  if (!analytics || !postsData) return null;

  const connectedPlatformIds = new Set((platforms || []).filter(p => p.connected).map(p => p.platform));
  const unconnected = PLATFORM_QUICK.filter(p => !connectedPlatformIds.has(p.id));

  const stats = [
    { label: "Total Views", value: analytics.totalViews, icon: Eye, color: "text-blue-400" },
    { label: "Total Likes", value: analytics.totalLikes, icon: Heart, color: "text-pink-400" },
    { label: "Total Shares", value: analytics.totalShares, icon: Share2, color: "text-green-400" },
    { label: "Comments", value: analytics.totalComments, icon: MessageCircle, color: "text-purple-400" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard Overview</h1>
          <p className="text-muted-foreground">Here's what's happening with your content today.</p>
        </div>
        <Link href="/create">
          <Button variant="gradient" className="gap-2">
            <Plus className="w-5 h-5" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Connect accounts prompt — shown when platforms are missing */}
      {unconnected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-purple-600/10 p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                <Link2 className="w-5 h-5 text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm">
                  {connectedPlatformIds.size === 0
                    ? "Link your social accounts to get started"
                    : `${unconnected.length} platform${unconnected.length > 1 ? "s" : ""} not connected yet`}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {PLATFORM_QUICK.map(p => (
                    <div key={p.id}
                      className={`w-6 h-6 rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center text-[11px]
                        ${connectedPlatformIds.has(p.id) ? "opacity-100 ring-2 ring-green-400/50" : "opacity-35"}`}
                      title={p.id}
                    >
                      {p.emoji}
                    </div>
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    {connectedPlatformIds.size}/5 linked
                  </span>
                </div>
              </div>
            </div>
            <Link href="/platforms">
              <Button variant="gradient" size="sm" className="gap-2 shrink-0">
                <Zap className="w-4 h-4" /> Link Accounts
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="hover:border-white/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="success" className="gap-1 bg-green-500/10 text-green-400">
                    <ArrowUpRight className="w-3 h-3" /> 12%
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{formatNumber(stat.value)}</h3>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Audience Growth (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.chartData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.platformBreakdown} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="platform" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} style={{textTransform: 'capitalize'}} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="views" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
          <CardTitle>Recent Posts</CardTitle>
          <Link href="/posts">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {postsData.posts.map(post => (
              <div key={post.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  {post.mediaUrl ? (
                    <img src={post.mediaUrl} alt="" className="w-16 h-16 rounded-lg object-cover bg-white/10" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-white font-medium mb-1 line-clamp-1">{post.title}</h4>
                    <div className="flex items-center gap-3">
                      <Badge variant={post.status === 'published' ? 'success' : post.status === 'scheduled' ? 'warning' : 'secondary'} className="capitalize">
                        {post.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex gap-1 items-center">
                        <Eye className="w-3 h-3" /> {formatNumber(post.totalViews)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {post.platforms.map(plat => (
                    <div key={plat} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs uppercase text-muted-foreground" title={plat}>
                      {plat.substring(0, 1)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
