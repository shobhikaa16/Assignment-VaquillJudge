// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// ✅ Check for GEMINI_API_KEY
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

console.log("🔑 Loaded GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "✅ Found" : "❌ Missing");

const app = express();

// =====================================
// ✅ CORS CONFIGURATION (ADD THIS PART)
// =====================================
const corsOptions = {
  origin: "http://localhost:8080", // your React frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json()); // built-in JSON parser

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to build the AI prompt
function buildFullPrompt({ caseTitle, plaintiffDocs, defendantDocs, description, text }) {
  if (text) return text;

  return `
You are an AI Judge. Be unbiased, logical, and concise in your legal reasoning and verdicts for "${caseTitle || "Untitled Case"}".

Case Description:
${description || "No description provided."}

Plaintiff's Evidence:
${plaintiffDocs || "No plaintiff documents provided."}

Defendant's Evidence:
${defendantDocs || "No defendant documents provided."}

Your task:
1. Summarize the case and identify main issues.
2. Summarize key arguments from both sides.
3. Evaluate merits of each side.
4. Provide a fair verdict with reasoning.

Return in this format:
### Case Summary
...
### Plaintiff’s Key Points
...
### Defendant’s Key Points
...
### Verdict
...
`;
}

// POST /analyze endpoint
app.post("/analyze", async (req, res) => {
  try {
    console.log("=== /analyze called ===");
    console.log("Headers:", req.headers);
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const { caseTitle, plaintiffDocs, defendantDocs, description, text } = req.body;

    const fullPrompt = buildFullPrompt({ caseTitle, plaintiffDocs, defendantDocs, description, text });

    if (!fullPrompt.trim()) {
      return res.status(400).json({ error: "Prompt cannot be empty" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(fullPrompt);

    console.log("[Gemini raw result]", result);

    const output = result?.response?.text?.() || null;

    if (!output) {
      throw new Error("No text returned from Gemini API");
    }

    console.log("[Gemini response OK]");
    res.json({ ok: true, result: output });

  } catch (err) {
    console.error("[Gemini error]", err);
    res.status(500).json({ error: err.message || "Gemini analysis failed" });
  }
});

// Start backend
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Gemini AI Backend running on port ${PORT}`)
);