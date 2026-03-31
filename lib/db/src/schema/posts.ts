import { pgTable, text, timestamp, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  caption: text("caption").notNull(),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
  status: text("status").notNull().default("draft"),
  platforms: jsonb("platforms").$type<string[]>().notNull().default([]),
  platformCaptions: jsonb("platform_captions").$type<Array<{
    platform: string;
    caption: string;
    hashtags: string[];
  }>>().notNull().default([]),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  totalLikes: integer("total_likes").default(0).notNull(),
  totalViews: integer("total_views").default(0).notNull(),
  totalShares: integer("total_shares").default(0).notNull(),
  totalComments: integer("total_comments").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;
