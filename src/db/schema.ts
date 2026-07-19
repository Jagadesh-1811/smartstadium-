import { pgTable, text, timestamp, integer, boolean, serial } from "drizzle-orm/pg-core";

// Define the 'users' table using Firebase uid directly as the primary key.
export const users = pgTable("users", {
  uid: text("uid").primaryKey(), // Firebase Auth UID
  email: text("email").notNull(),
  displayName: text("display_name"),
  photoUrl: text("photo_url"),
  role: text("role").default("operator").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define the 'incidents' table.
export const incidents = pgTable("incidents", {
  id: text("id").primaryKey(), // e.g., "inc-1"
  type: text("type").notNull(),
  level: text("level").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  timestamp: text("timestamp").notNull(),
  status: text("status").notNull().default("OPEN"),
  aiCategory: text("ai_category").notNull(),
  location: text("location").notNull(),
  viewCamAvailable: boolean("view_cam_available").notNull().default(false),
  userId: text("user_id").references(() => users.uid),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define the 'system_logs' table.
export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  time: text("time").notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(), // system, info, alert, comm
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define the 'sentiment_words' table.
export const sentimentWords = pgTable("sentiment_words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull().unique(),
  weight: integer("weight").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
