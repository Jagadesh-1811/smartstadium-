import { desc, eq } from "drizzle-orm";
import { db } from "./index.ts";
import { incidents, systemLogs, sentimentWords, users } from "./schema.ts";

export async function seedInitialData() {
  // Mock data seeding disabled for production real-time operations
  console.log("Operational database initialized without mock/seeded data.");
}

// Incidents helpers
export async function getIncidents() {
  try {
    return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
  } catch (error) {
    console.error("Failed to fetch incidents:", error);
    throw new Error("Database query for incidents failed.", { cause: error });
  }
}

export async function addIncident(data: {
  id: string;
  type: string;
  level: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
  aiCategory: string;
  location: string;
  viewCamAvailable: boolean;
  userId?: string;
}) {
  try {
    const result = await db.insert(incidents).values({
      id: data.id,
      type: data.type,
      level: data.level,
      title: data.title,
      description: data.description,
      timestamp: data.timestamp,
      status: data.status,
      aiCategory: data.aiCategory,
      location: data.location,
      viewCamAvailable: data.viewCamAvailable,
      userId: data.userId || null,
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Failed to insert incident:", error);
    throw new Error("Database incident log failed.", { cause: error });
  }
}

export async function updateIncidentStatus(id: string, status: string) {
  try {
    const result = await db.update(incidents)
      .set({ status })
      .where(eq(incidents.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error("Failed to update incident status:", error);
    throw new Error("Database incident status update failed.", { cause: error });
  }
}

// System logs helpers
export async function getSystemLogs() {
  try {
    return await db.select().from(systemLogs).orderBy(desc(systemLogs.id)).limit(50);
  } catch (error) {
    console.error("Failed to fetch system logs:", error);
    throw new Error("Database query for system logs failed.", { cause: error });
  }
}

export async function addSystemLog(time: string, text: string, type: string) {
  try {
    const result = await db.insert(systemLogs).values({
      time,
      text,
      type,
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Failed to insert system log:", error);
    throw new Error("Database system log insertion failed.", { cause: error });
  }
}

// Sentiment words helpers
export async function getSentimentWords() {
  try {
    return await db.select().from(sentimentWords).orderBy(desc(sentimentWords.weight));
  } catch (error) {
    console.error("Failed to fetch sentiment words:", error);
    throw new Error("Database query for sentiment words failed.", { cause: error });
  }
}

export async function upsertSentimentWord(word: string, weight: number, color: string) {
  try {
    const result = await db.insert(sentimentWords)
      .values({ word, weight, color })
      .onConflictDoUpdate({
        target: sentimentWords.word,
        set: { weight, color },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Failed to upsert sentiment word:", error);
    throw new Error("Database upsert for sentiment word failed.", { cause: error });
  }
}
