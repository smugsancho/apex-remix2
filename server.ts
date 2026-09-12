import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;

function getAi() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function callGemini(prompt: string, config?: any) {
  const ai = getAi();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config,
    });
    return response;
  } catch (err) {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config,
    });
    return response;
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/gemini/mission", async (req, res) => {
  try {
    const { threatLevel, syndicatePower } = req.body;
    const prompt = `Generate a gritty, dystopian military mission for a top-tier mercenary syndicate in a brutal cold war world where killing is normalized. 
    Current threat level: ${threatLevel}, Syndicate power: ${syndicatePower}.
    Return JSON with:
    - title (string, atmospheric)
    - client (string, e.g. "The Technocratic Syndicate of Vorex", "Aethelgard Corporate Intelligence", etc.)
    - targetNation (string, rival country)
    - description (string, 2-3 sentences of harsh dystopian atmosphere and objectives)
    - difficulty (string: "Easy", "Moderate", "Extreme", "Suicide Mission")
    - recommendedPower (number)
    - rewards: object with credits (number), intel (number), tech (number)
    - recruitRewardName (string, name of a potential legendary or elite soldier captured/rescued in this mission)
    - recruitRewardClass (string: "Assault", "Sniper", "Juggernaut", "Hacker", "Infiltrator", "Medic")`;

    const response = await callGemini(prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          client: { type: Type.STRING },
          targetNation: { type: Type.STRING },
          description: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          recommendedPower: { type: Type.INTEGER },
          rewards: {
            type: Type.OBJECT,
            properties: {
              credits: { type: Type.INTEGER },
              intel: { type: Type.INTEGER },
              tech: { type: Type.INTEGER },
            },
            required: ["credits", "intel", "tech"],
          },
          recruitRewardName: { type: Type.STRING },
          recruitRewardClass: { type: Type.STRING },
        },
        required: ["title", "client", "targetNation", "description", "difficulty", "recommendedPower", "rewards", "recruitRewardName", "recruitRewardClass"],
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.warn("Mission generation fallback used:", error.message);
    const fallbackMissions = [
      {
        title: "Operation: Crimson Conduit",
        client: "Vorex Technocracy",
        targetNation: "The Iron Directorate",
        description: "Infiltrate a neural data bunker and execute enemy directors to secure quantum routing codes.",
        difficulty: "Moderate",
        recommendedPower: 180,
        rewards: { credits: 3500, intel: 50, tech: 20 },
        recruitRewardName: "Zoe 'Ghost' Weaver",
        recruitRewardClass: "Infiltrator",
      },
      {
        title: "Assault on Sector 9 Armory",
        client: "Neo-Shanghai Conglomerate",
        targetNation: "Aethelgard Republic",
        description: "Storm an underground ballistic silo and extract weapons blueprints before orbital bombardment.",
        difficulty: "Extreme",
        recommendedPower: 260,
        rewards: { credits: 5000, intel: 90, tech: 35 },
        recruitRewardName: "Kuro 'Titan' Takahashi",
        recruitRewardClass: "Juggernaut",
      },
    ];
    res.json(fallbackMissions[Math.floor(Math.random() * fallbackMissions.length)]);
  }
});

app.post("/api/gemini/recruit", async (req, res) => {
  try {
    const prompt = `Generate a bio and stats for an elite dystopian mercenary recruit available for hire or capture in a dark cold war setting.
    Return JSON with:
    - name (string)
    - callsign (string)
    - class (string: "Assault", "Sniper", "Juggernaut", "Hacker", "Infiltrator", "Medic")
    - backstory (string, 2 sentences of bleak, gritty background)
    - combatRating (number between 40 and 95)
    - hireCost (number between 500 and 3000)
    - trait (string, e.g. "Cybernetically Enhanced", "Ruthless Executioner", "Ghost Recon Expert", "Pain-Resistant Stim-Addict")`;

    const response = await callGemini(prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          callsign: { type: Type.STRING },
          class: { type: Type.STRING },
          backstory: { type: Type.STRING },
          combatRating: { type: Type.INTEGER },
          hireCost: { type: Type.INTEGER },
          trait: { type: Type.STRING },
        },
        required: ["name", "callsign", "class", "backstory", "combatRating", "hireCost", "trait"],
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.warn("Recruit generation fallback used:", error.message);
    const classes = ["Assault", "Sniper", "Juggernaut", "Hacker", "Infiltrator", "Medic"];
    const names = ["Jax Thorne", "Sora Vane", "Kaelen Voss", "Lyra Vance", "Damon Black"];
    const callsigns = ["Viper", "Apex", "Spectre", "Zero", "Rogue"];
    res.json({
      name: names[Math.floor(Math.random() * names.length)],
      callsign: callsigns[Math.floor(Math.random() * callsigns.length)],
      class: classes[Math.floor(Math.random() * classes.length)],
      backstory: "A hardened veteran of the neural wars, seeking high-paying contracts in the dystopian underground.",
      combatRating: 78,
      hireCost: 1500,
      trait: "Cybernetically Enhanced",
    });
  }
});

app.post("/api/gemini/advisor", async (req, res) => {
  try {
    const { credits, soldiersCount, tension } = req.body;
    const prompt = `You are Director Kael, the cynical, cold, and calculating chief tactical advisor of a supreme mercenary-producing dystopian nation. 
    The commander currently has ${credits} credits, ${soldiersCount} active mercenaries, and global cold war tension is at ${tension}%.
    Give a short, ruthless, atmospheric tactical briefing or warning in 2 sentences in character.`;

    const response = await callGemini(prompt);

    res.json({ advice: response.text?.trim() || "Keep your weapons clean and trust no one, Commander." });
  } catch (error: any) {
    console.warn("Advisor fallback used:", error.message);
    res.json({ advice: "The rival states are positioning nuclear batteries along Sector 4. Do not hesitate to strike first, Commander." });
  }
});

app.post("/api/gemini/news", async (req, res) => {
  try {
    const prompt = `Generate 3 dystopian cold war news headlines and ticker updates where killing and proxy warfare are normalized. Return JSON array of strings.`;
    const response = await callGemini(prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    });

    const data = JSON.parse(response.text || "[]");
    res.json(data);
  } catch (error: any) {
    console.warn("News fallback used:", error.message);
    res.json([
      "Global Cold War Tension rises as Sector 7 border disputes intensify.",
      "The Technocratic Syndicate of Vorex places heavy bounty on rogue cyber-hackers.",
      "Apex Mercenaries praised for flawless proxy operation in the neutral wastes.",
    ]);
  }
});

async function startServer() {
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
    console.log(`Apex Mercenary Command server running on port ${PORT}`);
  });
}

startServer();
