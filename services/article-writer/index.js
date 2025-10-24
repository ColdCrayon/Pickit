import express from "express";
import admin from "firebase-admin";

import { planPrompt } from "./lib/prompts.js";
import { generateArticlePlanJSON, writeBodyMarkdown } from "./lib/llm.js";
import { pickRecentEvents, writeArticles } from "./lib/firestore.js";

if (!admin.apps.length) admin.initializeApp();

const app = express();
app.use(express.json());

function yyyyWeek(d = new Date()) {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d - jan1) / 86400000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-${String(week).padStart(2, "0")}`;
}

app.post("/generate", async (req, res) => {
  try {
    const sports = Array.isArray(req.body?.sports) ? req.body.sports : [];
    const events  = await pickRecentEvents({ sports });  // Firestore read
    const weekKey = yyyyWeek();

    // Phase A: plan (small JSON)
    const plan = await generateArticlePlanJSON(planPrompt({ events, weekKey }));

    if (!Array.isArray(plan?.articles) || plan.articles.length === 0) {
      throw new Error("Plan returned no articles");
    }

    // Phase B: write each body & persist
    const articles = [];
    for (const a of plan.articles) {
      const bodyMarkdown = await writeBodyMarkdown(a);
      articles.push({
        title: a.title,
        sport: a.sport,
        teams: a.teams,
        summary: a.summary,
        bodyMarkdown,
        imageUrls: []
      });
    }

    const count = await writeArticles({ weekKey, articles }); // batched write
    res.json({ ok: true, weekKey, written: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get("/healthz", (_, res) => res.send("ok"));
app.listen(process.env.PORT || 8080, () => console.log("article-writer up"));

