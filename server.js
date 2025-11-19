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

You must not assume the user is in a technical or coding-heavy role unless the resume clearly shows that. 
For non-technical roles (marketing, HR, recruiting, legal, nonprofit, education, creative, operations, finance, etc.), 
keep all feedback grounded in that discipline. Do not suggest adding coding, software engineering, DevOps, or technical tools 
unless the resume already points in that direction.

The user will paste their full resume or a large section of it. You will return a single JSON object only. 
No prose outside the JSON. Do not wrap it in backticks or a code fence.

Return JSON that matches this schema exactly:

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
  - Integer from 0 to 100
  - Overall strength of the resume for serious roles at strong companies
  - Do not inflate. 80+ should feel genuinely strong.

- summary
  - Two to four sentences
  - Describe how the resume lands to a recruiter in plain language
  - This is the "Recruiter's Take" that appears at the top

- strengths
  - Array of three to six short strings
  - Each names something that is clearly working on the page
  - Be concrete and specific, not generic praise

- gaps
  - Array of three to six short strings
  - Each names a pattern that hurts clarity, signal, or impact
  - Focus on clarity, structure, and evidence rather than vague criticism

- rewrites
  - Array of three to five objects
  - Each object must have:
    - label: short string naming the area, like "Impact" or "Scope"
    - original: one weak bullet from the resume, in plain text
    - better: your improved version of that bullet, in plain text
  - Choose bullets where your rewrite will clearly improve clarity or impact
  - Do not add extra keys

- next_steps
  - Array of three to six short strings
  - Each is a concrete action the user can take to make the resume closer to a clear yes
  - Keep actions simple and doable in one to two work sessions

Important output rules:

- Respond with valid JSON only
- Do not include comments
- Do not include markdown
- Do not include explanatory text outside the JSON object
- Do not apologize or explain the JSON; just return it
`
    );
  }

  if (mode === "interview") {
    return (
      baseTone +
      `

The user will paste their resume, a job description, and/or notes about an upcoming interview. Your job is to help them prepare with clarity and focus.

Avoid long explanations. Use short sentences. Give practical guidance they can act on in the next one or two days.

Return your answer as plain text with these sections:

1. How you currently read
- Three to six bullets naming how they likely show up to the interviewer based on what they shared.

2. Stories to prepare
- Three to five one line prompts for strong stories. Each should name the theme, for example "Handling a rough launch" or "Turning vague direction into a clear plan".

3. Questions they are likely to get
- Five to ten targeted questions based on their background and the role.

4. Questions they should ask
- Three to six simple, thoughtful questions.

5. Things to lean into
- Three to five bullets naming strengths they should highlight.

6. Watch outs
- Two to four bullets naming things to avoid or clarify.

Keep it calm, clear, and human.
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

    // E: Model prompt optimization – parse JSON here and return structured object
    let parsed;
    try {
      // In case the model ever wraps it in fences, strip them
      let raw = content.trim();
      const fence =
        raw.match(/```json([\s\S]*?)```/) ||
        raw.match(/```([\s\S]*?)```/);
      if (fence && fence[1]) {
        raw = fence[1].trim();
      }
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse JSON from model:", err);
      console.error("Raw content was:", content);
      return res.status(500).json({ error: "Failed to parse JSON from model." });
    }

    // Basic shape sanity check
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.score !== "number" ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.gaps)
    ) {
      console.error("Parsed JSON does not match expected shape:", parsed);
      return res
        .status(500)
        .json({ error: "Model returned JSON that did not match the expected shape." });
    }

    // Send the structured JSON directly to the frontend
    res.json(parsed);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});