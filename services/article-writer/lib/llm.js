import { VertexAI } from "@google-cloud/vertexai";
import { jsonrepair } from "jsonrepair";

const PROJECT =
  process.env.VERTEX_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT;
const LOCATION = process.env.VERTEX_LOCATION || "us-central1";
const MODEL = process.env.VERTEX_MODEL || "gemini-2.5-pro"; // use your enabled 2.5 model id

console.log("Vertex config:", {
  project: PROJECT,
  location: LOCATION,
  model: MODEL,
});

const vertexAI = new VertexAI({ project: PROJECT, location: LOCATION });
const model = vertexAI.getGenerativeModel({ model: MODEL });

export async function generateArticlePlanJSON(prompt) {
  const resp = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          weekKey: { type: "string" },
          articles: {
            type: "array",
            minItems: 5,
            maxItems: 5,
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                sport: { type: "string" },
                teams: {
                  type: "object",
                  properties: {
                    home: { type: "string" },
                    away: { type: "string" },
                  },
                  required: ["home", "away"],
                },
                summary: { type: "string" },
                imageQueries: { type: "array", items: { type: "string" } },
                sourceQueries: { type: "array", items: { type: "string" } },
              },
              required: ["title", "sport", "teams", "summary"],
            },
          },
        },
        required: ["weekKey", "articles"],
      },
    },
  });

  const raw = resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = raw.replace(/^```json\s*|\s*```$/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const repaired = jsonrepair(cleaned);
    return JSON.parse(repaired);
  }
}

export async function writeBodyMarkdown({ title, sport, teams }) {
  const bodyPrompt = `Write a 400–600 word sports article **in Markdown**.
Constraints:
- Do NOT include a title or any H1/H2 heading.
- Do NOT include frontmatter.
- Start directly with the first paragraph.
- Use short, scannable paragraphs, occasional subheadings (### only), and a list if helpful.
- No betting advice.

Context:
Sport: ${sport}
Title (for context only, do not render it): "${title}"
Matchup: ${teams.home} vs ${teams.away}
Tone: engaging, factual. Avoid betting advice.`.trim();

  const r = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: bodyPrompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      // IMPORTANT: text/plain for Vertex 2.x (or omit this line entirely)
      responseMimeType: "text/plain",
    },
  });

  // Safely extract full text (some responses come in multiple parts)
  const parts = r?.response?.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((p) => p.text || "")
    .join("")
    .trim();
  return text;
}
