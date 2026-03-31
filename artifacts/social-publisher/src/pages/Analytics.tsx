import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics, usePostAnalytics } from "@/hooks/use-app-api";
import { Eye, Heart, Share2, MessageCircle } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function Analytics() {
  const { data: overview, isLoading: overviewLoading } = useAnalytics({ period: "30d" });
  const { data: topPosts, isLoading: postsLoading } = usePostAnalytics({ limit: 5 });

  if (overviewLoading || postsLoading) return <div className="p-8">Loading analytics...</div>;
  if (!overview || !topPosts) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Performance Analytics</h1>
        <p className="text-muted-foreground">Deep dive into how your content is performing.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Views", val: overview.totalViews, icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Total Likes", val: overview.totalLikes, icon: Heart, color: "text-pink-400", bg: "bg-pink-500/10" },
          { label: "Total Shares", val: overview.totalShares, icon: Share2, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Comments", val: overview.totalComments, icon: MessageCircle, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{formatNumber(stat.val)}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview.chartData}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={formatNumber} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="views" name="Views" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" />
                <Area type="monotone" dataKey="likes" name="Likes" stroke="hsl(var(--accent))" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.platformBreakdown}>
                  <XAxis dataKey="platform" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} style={{textTransform: 'capitalize'}} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="views" name="Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="likes" name="Likes" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {topPosts.map((post, i) => (
                <div key={post.postId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground font-bold">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium truncate max-w-[200px]">{post.title}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(post.views)} views</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">{formatNumber(post.likes)} likes</p>
                    <div className="flex gap-1 justify-end mt-1">
                      {post.platforms.map(p => <span key={p} className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center text-[8px] uppercase">{p[0]}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
