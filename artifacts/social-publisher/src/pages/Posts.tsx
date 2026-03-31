import { useState } from "react";
import { motion } from "framer-motion";
import { usePosts, useDeletePost } from "@/hooks/use-app-api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash2, Send, Eye, Heart } from "lucide-react";
import { Link } from "wouter";

const TABS = ["All", "Published", "Scheduled", "Draft"];

export default function Posts() {
  const [activeTab, setActiveTab] = useState("All");
  const { data: postsData, isLoading } = usePosts(activeTab !== "All" ? { status: activeTab.toLowerCase() as any } : undefined);
  const { mutate: deletePost } = useDeletePost();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Content Library</h1>
          <p className="text-muted-foreground">Manage all your posts across platforms.</p>
        </div>
        <Link href="/create">
          <Button variant="gradient">Create Post</Button>
        </Link>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-px overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse"/>)}
        </div>
      ) : (
        <div className="space-y-4">
          {postsData?.posts.length === 0 ? (
            <Card className="border-dashed border-white/20 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Send className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No posts found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">You haven't created any posts in this category yet. Get started by creating your first post.</p>
                <Link href="/create"><Button variant="outline">Create New Post</Button></Link>
              </CardContent>
            </Card>
          ) : (
            postsData?.posts.map((post, idx) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="hover:border-white/20 transition-all group">
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    {post.mediaUrl ? (
                      <img src={post.mediaUrl} alt="" className="w-24 h-24 rounded-xl object-cover bg-white/10 shrink-0" />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <span className="text-muted-foreground uppercase text-xs font-bold">{post.mediaType}</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <Badge variant={post.status === 'published' ? 'success' : post.status === 'scheduled' ? 'warning' : 'secondary'} className="capitalize">
                          {post.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {post.publishedAt ? `Published ${format(new Date(post.publishedAt), 'MMM d, yyyy')}` : 
                           post.scheduledAt ? `Scheduled for ${format(new Date(post.scheduledAt), 'MMM d, yyyy')}` : 
                           `Drafted ${format(new Date(post.createdAt), 'MMM d, yyyy')}`}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1 truncate">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{post.caption}</p>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4" /> {post.totalViews.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4" /> {post.totalLikes.toLocaleString()}
                        </div>
                        <div className="flex gap-1 ml-auto sm:ml-0 border-l border-white/10 pl-6">
                          {post.platforms.map(plat => (
                            <div key={plat} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] uppercase font-bold text-white" title={plat}>
                              {plat[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                      {post.status === 'draft' && (
                         <Button variant="gradient" size="sm" className="flex-1 sm:w-full">Publish</Button>
                      )}
                      <Button variant="outline" size="sm" className="flex-1 sm:w-full"><Edit className="w-4 h-4 mr-2"/> Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => deletePost({ postId: post.id })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}
