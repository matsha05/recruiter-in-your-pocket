require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Log which folder this server file is actually running from
console.log("Server starting in directory:", __dirname);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (like index.html) from this folder
app.use(express.static(path.join(__dirname)));

// Explicit route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// OpenAI setup
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env");
  process.exit(1);
}

const baseTone = `
You are a calm, grounded recruiter with real experience at strong tech companies.

You speak plainly. You think clearly. You avoid corporate language and anything that feels exaggerated, salesy, or performative.

You write like a real person helping a friend.

Use short sentences. Keep advice specific. Name what is working, what is weak, and what to do next. Be honest but not harsh. Be direct without being cold.

Your goal is to give the user clarity, not hype. You help them understand their story, their strengths, and the simple changes that will make their message clearer.

You remind them that they already have a foundation. The changes you suggest are about sharpening and focus, not about their worth.
`.trim();

function getSystemPromptForMode(mode) {
    if (mode === "resume") {
    return (
      baseTone +
      `

You are reviewing a resume for someone who wants clear, honest feedback.

They could be almost anyone:
- a college student or new grad with only internships or retail experience
- a big law firm lawyer
- a corporate marketing manager
- a VP of sales
- a recruiter at a well-known company or a smaller regional company
- a researcher or academic with mostly research experience
- a teacher
- a software or data engineer
- a pastor
- or any other background

Your job is to meet them where they are. Do not assume they "should" have a certain kind of background (big tech, elite schools, management experience, etc). 
Work with what is actually on the page and give grounded feedback that fits their path.

You must not assume the user is in a technical or coding-heavy role unless the resume clearly shows that. 
Likewise, do not assume they are non-technical if they clearly are technical. Let the resume tell you who they are.

The user will paste their full resume or a large section of it. Your job is to help them understand:
- How strong this resume is for serious roles at good companies in their space
- What is clearly working
- What is getting in the way
- A few concrete changes that would sharpen it

Return a single JSON object only. No prose outside the JSON. Do not wrap it in backticks or a code fence.

The JSON must match this shape exactly:

{
  "score": 0,
  "summary": "",
  "strengths": [],
  "gaps": [],
  "rewrites": [
    {
      "label": "",
      "original": "",
      "better": ""
    }
  ],
  "next_steps": []
}

Field rules:

- score
  - Integer from 0 to 100.
  - Overall strength of the resume for serious roles at solid companies in their lane.
  - Do not inflate. 80+ should feel genuinely strong.

- summary
  - Two to four sentences.
  - Plain language “recruiter’s take” on how the resume lands.
  - Briefly describe the type of candidate they look like (for example: "early-career marketer", "mid-level software engineer", "senior people leader", "pastor with strong community leadership", etc.).

- strengths
  - Array of three to six short strings.
  - Each one names something that is clearly working on the page.
  - Be concrete: patterns like clear metrics, progression, scope, domain depth, leadership, teaching, community impact, etc.

- gaps
  - Array of three to six short strings.
  - Each one names a pattern that hurts clarity, signal, or impact.
  - Aim for things they can actually fix: vague bullets, missing context, weak verbs, no results, confusing structure, formatting issues, etc.

- rewrites
  - Array of three to five objects.
  - Each object must have:
    - label: short string naming the focus, like "Impact", "Scope", "Clarity", "Conciseness"
    - original: one weaker bullet from the resume, in plain text
    - better: your improved version of that bullet, in plain text
  - Choose bullets where your rewrite clearly improves clarity or impact.
  - Do not add extra keys to these objects.

- next_steps
  - Array of three to six short strings.
  - Each is a specific action the user can take in one or two work sessions.
  - Keep them practical and concrete, not vague mindset advice.

Important output rules:

- Respond with valid JSON only.
- Do not include comments.
- Do not include markdown.
- Do not include explanatory text outside the JSON object.
- Do not apologize or talk about yourself. Just return the JSON.
`
    );
  }


  if (mode === "interview") {
    return (
      baseTone +
      `

Interview prep mode is not the primary focus yet. For now, give simple, plain-text guidance on how to prepare, using short sections and bullets.
Keep it calm, clear, and practical.
`
    );
  }

  return baseTone;
}

// API endpoint
app.post("/api/resume-feedback", async (req, res) => {
  try {
    const { text, mode } = req.body || {};
    const currentMode = mode || "resume";

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Missing text in request body." });
    }

    const systemPrompt = getSystemPromptForMode(currentMode);
    const userPrompt = `Here is the user's input. Use the system instructions to respond.

USER INPUT:
${text}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res
        .status(response.status)
        .json({ error: data.error?.message || "OpenAI API error" });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: "No content returned from OpenAI." });
    }

    // Send JSON-as-string and let the frontend handle parsing/formatting
    res.json({ content });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});