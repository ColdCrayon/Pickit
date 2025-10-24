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

async function wikiSearch(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrlimit=1&prop=pageimages|info&inprop=url&pilicense=any&pithumbsize=640&format=json&origin=*&gsrsearch=${encodeURIComponent(query)}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const data = await r.json();
  const pages = data?.query?.pages;
  if (!pages) return null;
  const first = Object.values(pages)[0];
  if (!first) return null;
  return {
    title: first.title,
    pageUrl: first.fullurl,
    thumb: first.thumbnail?.source
  };
}

async function resolveImagesForArticle(a) {
  const q = [
    ...(a.imageQueries || []),
    a.teams?.home || "",
    a.teams?.away || "",
    a.sport || ""
  ].filter(Boolean);

  const out = [];
  for (const term of q) {
    const hit = await wikiSearch(term);
    if (hit?.thumb) out.push(hit.thumb);
    if (out.length >= 3) break; // cap at 3 images
  }
  return out;
}

async function resolveSourcesForArticle(a) {
  const q = [
    ...(a.sourceQueries || []),
    `${a.teams?.home} ${a.sport}`,
    `${a.teams?.away} ${a.sport}`,
    `${a.sport} Wikipedia`
  ].filter(Boolean);

  const out = [];
  for (const term of q) {
    const hit = await wikiSearch(term);
    if (hit?.pageUrl && !out.includes(hit.pageUrl)) out.push(hit.pageUrl);
    if (out.length >= 5) break; // cap at 5 sources
  }
  return out;
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

      const [imageUrls, sources] = await Promise.all([
        resolveImagesForArticle(a),
        resolveSourcesForArticle(a),
      ]);

      const mdWithSources = sources.length
        ? `${bodyMarkdown}\n\n---\n**Sources**\n${sources.map(u => `- ${u}`).join("\n")}\n`
        : bodyMarkdown;

      const expiresAt = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      );

      articles.push({
        title: a.title,
        sport: a.sport,
        teams: a.teams,
        summary: a.summary,
        mdWithSources,
        imageUrls,
        sources,
        expiresAt,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
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

