import {VertexAI} from "@google-cloud/aiplatform";

const LOCATION = process.env.VERTEX_LOCATION || "us-central1";
// Model examples: "gemini-1.5-pro" (multimodal) or "text-bison@002" (text)
const MODEL_NAME = process.env.VERTEX_MODEL || "gemini-1.5-pro";

const vertex = new VertexAI({ location: LOCATION });
const generativeModel = vertex.getGenerativeModel({ model: MODEL_NAME });

export async function generateArticlesJSON(prompt) {
  const resp = await generativeModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      responseMimeType: "application/json"
    }
  });
  const text = resp.response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return JSON.parse(text); // throws if invalid JSON
}
