import express from "express";
import { weeklyArticlesPrompt } from "./lib/prompts.js";
import { generateArticlesJSON } from "./lib/llm.js";
import { pickRecentEvents, writeArticles } from "./lib/firestore.js";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

function yyyyWeek() {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-${String(week).padStart(2,"0")}`;
}

app.post("/generate", async (req, res) => {
  try {
    // 1) gather context from Firestore (recent tracked events)
    const sports = req.body?.sports || ["NFL","NBA","NHL","MLB","NCAAF","NCAAB"];
    const events = await pickRecentEvents({ sports, daysAhead: 10, limit: 20 });
    const weekKey = req.body?.weekKey || yyyyWeek();

    // 2) prompt the LLM for 5 articles (strict JSON)
    const prompt = weeklyArticlesPrompt({ sport: "multi", events, weekKey });
    const { weekKey: returnedWeek, articles } = await generateArticlesJSON(prompt);

    if (!Array.isArray(articles) || articles.length < 1) {
      return res.status(400).json({ ok:false, error:"LLM returned no articles" });
    }

    // 3) basic validation (>=400 words)
    const valid = articles.filter(a => (a.bodyMarkdown || "").split(/\s+/).filter(Boolean).length >= 400);
    if (valid.length < articles.length) {
      console.warn(`Dropped ${articles.length - valid.length} under-length articles`);
    }

    // 4) write to Firestore
    const count = await writeArticles({ weekKey: returnedWeek || weekKey, articles: valid });

    res.json({ ok:true, weekKey: returnedWeek || weekKey, written: count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:String(e) });
  }
});

app.get("/healthz", (_, res) => res.send("ok"));
app.listen(process.env.PORT || 8080, () => console.log("article-writer up"));
