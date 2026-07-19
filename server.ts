import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load database helpers
import {
  seedInitialData,
  getIncidents,
  addIncident,
  updateIncidentStatus,
  getSystemLogs,
  addSystemLog,
  getSentimentWords,
  upsertSentimentWord
} from "./src/db/helpers.ts";

import { getOrCreateUser } from "./src/db/users.ts";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory static/real-time telemetry (does not require long-term DB tracking)
let telemetry = {
  attendance: {
    capacity: 80000,
    activeInBowl: 64210,
    inConcourse: 14290,
    totalCount: 78500
  },
  multilingual: [
    { lang: "Spanish", volunteers: 12, requests: 4, percent: 100 },
    { lang: "Arabic", volunteers: 8, requests: 7, percent: 85 },
    { lang: "French", volunteers: 2, requests: 6, percent: 30 },
    { lang: "Mandarin", volunteers: 5, requests: 2, percent: 100 }
  ],
  transit: [
    { name: "SUBWAY LINE 1", hub: "Main Station", time: "2m 45s", status: "ON TIME" },
    { name: "SHUTTLE S-4", hub: "West Terminal", time: "7m 12s", status: "DELAYED" },
    { name: "VVIP HELIPAD", hub: "South Hangar", time: "14m 00s", status: "APPROACH" }
  ],
  weather: {
    temp: "24°C",
    condition: "PARTLY CLOUDY",
    humidity: "42%",
    wind: "12 km/h",
    precipitation: "2%"
  },
  inclusionScore: "98.4%",
  avgResponseTime: "0:45s",
  feedbackScans: 1245
};

// Lazy Initializer for Gemini Client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  aiInstance = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      }
    }
  });
  return aiInstance;
}

// Helper to format timestamps
function getFormattedTime() {
  const d = new Date();
  return d.toTimeString().split(" ")[0];
}

// --- API ENDPOINTS ---

// Sync and register/update user in PostgreSQL (called upon frontend login)
app.post("/api/users/sync", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { email, displayName, photoURL } = req.body;
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: "Unauthorized: Missing authentication context." });
    }
    const user = await getOrCreateUser(req.user.uid, req.user.email || email || "unknown@fifa.com", displayName, photoURL);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Get Live State (merged from Cloud SQL DB & live telemetry)
app.get("/api/state", async (req, res) => {
  try {
    const dbIncidents = await getIncidents();
    const dbLogs = await getSystemLogs();
    const dbSentiment = await getSentimentWords();

    // Fluctuated telemetry for realism
    const flux = Math.floor(Math.random() * 11) - 5;
    const newActive = Math.max(10000, telemetry.attendance.activeInBowl + flux);
    const newConcourse = Math.max(5000, telemetry.attendance.inConcourse - flux);

    res.json({
      incidents: dbIncidents,
      systemLogs: dbLogs,
      sentimentWords: dbSentiment,
      telemetry: {
        ...telemetry,
        attendance: {
          capacity: 80000,
          activeInBowl: newActive,
          inConcourse: newConcourse,
          totalCount: newActive + newConcourse
        },
        feedbackScans: telemetry.feedbackScans + (Math.random() > 0.7 ? 1 : 0)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load operational grid state from database.", details: error.message });
  }
});

// 2. Incident Handlers (Protected or publicly accessible from stadium operators)
app.post("/api/incidents", async (req, res) => {
  try {
    const { title, description, level, location, type, userId } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const timeString = getFormattedTime();
    const id = `inc-${Date.now()}`;

    // Predict AI Category based on description keywords
    let aiCategory = "EXPERIENCE";
    const descLower = description.toLowerCase();
    if (descLower.includes("medical") || descLower.includes("hurt") || descLower.includes("exhaustion") || descLower.includes("faint")) {
      aiCategory = "SAFETY";
    } else if (descLower.includes("ramp") || descLower.includes("accessible") || descLower.includes("elevator") || descLower.includes("wheelchair")) {
      aiCategory = "ACCESS";
    } else if (descLower.includes("fight") || descLower.includes("lost") || descLower.includes("security") || descLower.includes("police")) {
      aiCategory = "SAFETY";
    } else if (descLower.includes("network") || descLower.includes("scanner") || descLower.includes("camera") || descLower.includes("offline")) {
      aiCategory = "TECHNICAL";
    }

    const newIncident = await addIncident({
      id,
      type: type || "LOGISTICS",
      level: level || "MODERATE",
      title,
      description,
      timestamp: timeString,
      status: "OPEN",
      aiCategory,
      location: location || "Stadium Perimeter",
      viewCamAvailable: Math.random() > 0.5,
      userId: userId || undefined,
    });

    // Dynamically extract and add real-time sentiment words from user incident text
    try {
      const words = `${title} ${description}`
        .split(/[^a-zA-Z]+/)
        .map(w => w.trim())
        .filter(w => w.length > 4 && !["about", "there", "their", "would", "could", "should", "under", "above", "where", "which", "after", "before", "right", "stadium", "incident", "request", "please", "reported", "assistance", "assist"].includes(w.toLowerCase()));
      
      if (words.length > 0) {
        const uniqueWords = [...new Set(words)].slice(0, 2);
        const colors = [
          "text-primary font-bold animate-pulse",
          "text-secondary font-semibold",
          "text-tertiary font-bold",
          "text-on-surface opacity-85"
        ];
        for (const word of uniqueWords) {
          const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          await upsertSentimentWord(
            capitalizedWord,
            Math.floor(Math.random() * 15) + 12,
            colors[Math.floor(Math.random() * colors.length)]
          );
        }
      }
    } catch (err) {
      console.error("Non-blocking error extracting live sentiment words:", err);
    }

    // Append a persistent system log
    await addSystemLog(
      timeString,
      `NEW INCIDENT: [${newIncident.level}] ${newIncident.title} registered at ${newIncident.location}.`,
      "alert"
    );

    res.status(201).json(newIncident);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to persist new incident to the database.", details: error.message });
  }
});

// Update Incident Status in PostgreSQL DB
app.put("/api/incidents/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }

    const updated = await updateIncidentStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: "Incident not found in the operations database." });
    }

    const timeString = getFormattedTime();
    await addSystemLog(
      timeString,
      `Incident ${id} (${updated.title}) status resolved/updated to ${status}.`,
      "system"
    );

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update incident status.", details: error.message });
  }
});

// 3. AI Dispatch Chatbot (Leveraging the live Cloud SQL data)
app.post("/api/dispatch", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const timeString = getFormattedTime();
    await addSystemLog(
      timeString,
      `Operator query to Dispatch AI: "${message}"`,
      "comm"
    );

    // Fetch latest operations state from DB to feed as context into the prompt
    const dbIncidents = await getIncidents();
    const dbLogs = await getSystemLogs();

    const ai = getGeminiClient();
    if (!ai) {
      // Direct, highly realistic offline fallback with context matching
      setTimeout(async () => {
        let aiText = `I have scanned the World Cup command database for your query: "${message}". `;
        let matchData = null;

        const msgLower = message.toLowerCase();
        if (msgLower.includes("german") || msgLower.includes("volunteer") || msgLower.includes("speak")) {
          aiText += "Scanning South Perimeter for multilingual personnel... Found active volunteer **Hans Müller** (V-882). He is nearby and certified in translation support.";
          matchData = {
            name: "Volunteer: Hans Müller (V-882)",
            distance: "45m",
            location: "Tunnel B, Level 1",
            languages: "GER, ENG, ESP",
            actionLabel: "DEPLOY TO GATE 4"
          };
        } else if (msgLower.includes("congest") || msgLower.includes("crowd") || msgLower.includes("gate")) {
          aiText += "Congestion identified around Gate A/4. Command database lists crowd level as heavy. Deploy Shuttle Line B reinforcements and update digital perimeter signage immediately.";
          matchData = {
            name: "Crowd Flow Re-route Action",
            distance: "Gate 4 Perimeter",
            location: "Terminal East",
            languages: "Signage & Shuttles",
            actionLabel: "EXECUTE SIGNAL CHANGE"
          };
        } else {
          aiText += `Stadium operational systems are active. We have ${dbIncidents.filter(i => i.status === "OPEN").length} open incidents in our database. Response Team Bravo is stationed near the Main Gate Pavilion and ready to deploy.`;
          matchData = {
            name: "Response Team Bravo",
            distance: "120m",
            location: "Main Gate Pavilion",
            languages: "All Emergency Protocol",
            actionLabel: "DISPATCH TEAM"
          };
        }

        res.json({
          text: aiText,
          timestamp: timeString,
          match: matchData
        });
      }, 600);
      return;
    }

    const prompt = `
      You are the elite "Dispatch AI" (Operational Logic Engine v4.2) for StadiumIntel 2026, the real-time command center for the FIFA World Cup 2026 stadium.
      You have access to the current active incidents from our SQL database: ${JSON.stringify(dbIncidents)}
      You have access to recent system logs from our SQL database: ${JSON.stringify(dbLogs.slice(0, 5))}
      
      The user (stadium commander) asked: "${message}"
      
      Respond in a highly authoritative, concise, tactical command center manner.
      If they ask to find resources (e.g. German speakers, medical staff, closest security):
      Identify or dynamically create a fictional, highly appropriate staff/volunteer match that solves their request.
      
      Format your response as a JSON object with:
      {
        "text": "authoritative paragraph detailing tactical recommendation or result",
        "match": {
          "name": "Personnel, Team or Action Name",
          "distance": "Fictional distance e.g. '30m' or 'Zone 4'",
          "location": "Fictional stadium location e.g. 'Tunnel B, Level 1'",
          "languages": "Fictional details e.g. 'GER, ENG, ESP' or 'TRAINED-MEDIC'",
          "actionLabel": "Action button text e.g. 'DEPLOY TO GATE 4'"
        }
      }
      Do not include any markdown format tags like \`\`\`json outside the JSON. Return valid JSON only.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const textResult = response.text || "{}";
    let parsed = { text: "Tactical system update complete.", match: null };
    try {
      parsed = JSON.parse(textResult.trim());
    } catch (e) {
      parsed = { text: textResult, match: null };
    }

    res.json({
      text: parsed.text,
      timestamp: timeString,
      match: parsed.match
    });

  } catch (error: any) {
    console.error("Gemini Dispatch AI Error:", error);
    res.status(500).json({ error: "AI Dispatcher temporarily offline.", details: error.message });
  }
});

// 4. Trigger simulated new events (saving directly to PostgreSQL)
app.post("/api/simulate-trigger", async (req, res) => {
  try {
    const timeString = getFormattedTime();
    
    const alerts = [
      {
        title: "Scanner 09 Offline",
        description: "Touchscreen scanner at turnstile 09 has a network disconnect. Maintenance requested.",
        type: "FACILITIES",
        level: "LOW",
        location: "Gate C",
        aiCategory: "TECHNICAL"
      },
      {
        title: "VIP Escort Assistance Needed",
        description: "VIP delegation from Group B team arriving at West Hangar. Requesting multilingual assistance.",
        type: "LOGISTICS",
        level: "MODERATE",
        location: "West Lounge",
        aiCategory: "EXPERIENCE"
      },
      {
        title: "Faint report - Sect 201",
        description: "Fan reports feeling dizzy near high concourse stairs Section 201.",
        type: "MEDICAL",
        level: "CRITICAL",
        location: "Sect 201",
        aiCategory: "SAFETY"
      }
    ];

    const chosenAlert = alerts[Math.floor(Math.random() * alerts.length)];
    const id = `inc-${Date.now()}`;

    const newIncident = await addIncident({
      id,
      ...chosenAlert,
      timestamp: timeString,
      status: "OPEN",
      viewCamAvailable: Math.random() > 0.5
    });

    await addSystemLog(
      timeString,
      `SIMULATION ALERT: [${newIncident.level}] ${newIncident.title} registered at ${newIncident.location}.`,
      "alert"
    );

    // Randomly add/update a sentiment word in the DB
    const newWords = ["Fired up", "Noisy", "Epic", "Stuck", "Thrilled", "Thirsty"];
    const chosenWord = newWords[Math.floor(Math.random() * newWords.length)];
    
    await upsertSentimentWord(
      chosenWord,
      Math.floor(Math.random() * 15) + 15,
      "text-primary font-bold animate-pulse"
    );

    res.json({ success: true, incident: newIncident });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to process simulation trigger.", details: error.message });
  }
});

// --- VITE DEV / PRODUCTION HANDLERS ---

async function startServer() {
  // Pre-seed PostgreSQL schema on startup
  console.log("Seeding operational database values...");
  await seedInitialData();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`World Cup Command Center Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
