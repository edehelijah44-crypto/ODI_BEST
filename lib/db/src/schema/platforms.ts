import { pgTable, text, timestamp, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const platformConnectionsTable = pgTable("platform_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  platform: text("platform").notNull(),
  accountName: text("account_name").notNull(),
  accountId: text("account_id").notNull(),
  connected: boolean("connected").default(true).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  followers: integer("followers").default(0).notNull(),
  avatar: text("avatar"),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
});

export const insertPlatformConnectionSchema = createInsertSchema(platformConnectionsTable).omit({ id: true, connectedAt: true });
export type InsertPlatformConnection = z.infer<typeof insertPlatformConnectionSchema>;
export type PlatformConnection = typeof platformConnectionsTable.$inferSelect;
