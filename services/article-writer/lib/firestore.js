import admin from "firebase-admin";
import slugify from "slugify";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export async function pickRecentEvents({ sports = ["NFL","NBA","NHL","MLB","NCAAF","NCAAB"], daysAhead = 7, limit = 12 }) {
  const now = admin.firestore.Timestamp.now();
  const cutoff = admin.firestore.Timestamp.fromMillis(now.toMillis() + daysAhead*24*3600*1000);

  // Filter by sport and upcoming startTime
  // (Create a composite index if you add where("sport","==",...))
  const snap = await db.collection("events")
    .where("startTime", "<=", cutoff)
    .orderBy("startTime", "desc")
    .limit(limit)
    .get();

  const events = [];
  snap.forEach(doc => {
    const d = doc.data();
    if (!sports.includes(d.sport)) return;
    events.push({
      eventId: doc.id,
      sport: d.sport,
      league: d.league,
      teams: d.teams,
      startTimeISO: d.startTime?.toDate().toISOString()
    });
  });
  return events;
}

export async function writeArticles({ weekKey, articles }) {
  const batch = db.batch();
  const col = db.collection("articles");

  for (const a of articles) {
    const slug = slugify(a.title, { lower: true, strict: true }).slice(0, 96);
    const id = `${weekKey}-${slug}`;
    const ref = col.doc(id);

    batch.set(ref, {
      title: a.title,
      slug,
      sport: a.sport,
      teams: a.teams || {},
      summary: a.summary,
      bodyMarkdown: a.bodyMarkdown,
      imageUrls: Array.isArray(a.imageUrls) ? a.imageUrls : [],
      author: "Pickit AI",
      createdAt: admin.firestore.Timestamp.now(),
      sources: a.sources || [],
      status: "published",
      weekKey
    }, { merge: true });
  }

  await batch.commit();
  return articles.length;
}
