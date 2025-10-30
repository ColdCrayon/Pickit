export function weeklyArticlesPrompt({ sport, events, weekKey }) {
  // events: [{eventId, sport, league, teams:{home,away}, startTimeISO}, ...]
  return `
You are a talented sports writer. Produce FIVE articles as JSON that meet ALL criteria:

- Each article 400-600 words, informative and original (no scraping).
- Audience: casual bettors & sports fans.
- Focus only on these sports/events (draw from list below).
- Include a title, summary (<= 40 words), full body in Markdown, and optional image URLs (royalty-free or leave empty).
- Tone: clear, engaging, neutral. Avoid claims of guaranteed outcomes.

Return ONLY valid JSON that matches the provided schema.
Do NOT include explanations, markdown, or code fences.

Return STRICT JSON matching:

{
  "weekKey": "${weekKey}",
  "articles": [
    {
      "title": "string",
      "sport": "string",
      "teams": { "home": "string", "away": "string" },
      "summary": "string",
      "bodyMarkdown": "string",
      "imageUrls": ["string"]
    },
    ...
  ]
}

Events to reference (context only):
${events
  .map(
    (e) =>
      `- ${e.sport} ${e.league} | ${e.teams.home} vs ${e.teams.away} | ${e.startTimeISO}`
  )
  .join("\n")}

weekKey: ${weekKey}
`.trim();
}

export function planPrompt({ events, weekKey }) {
  return `
Return ONLY valid JSON for exactly five article plans.

Schema:
{
  "weekKey": "${weekKey}",
  "articles": [
    {
      "title": "string",
      "sport": "string",
      "teams": { "home": "string", "away": "string" },
      "summary": "string"
      "imageQueries": ["string"],   // optional, 1-3 short search terms for pictures
      "sourceQueries": ["string"]   // optional, 1-3 short search terms for reputable info
    }
  ]
}

Constraints:
- 5 items exactly.
- Summaries <= 40 words.
- Use only teams/games from the list below (no fabrication).
- For imageQueries/sourceQueries, prefer team names, league names, or marquee 
  players. Keep each query short.

Events:
${events
  .map(
    (e) =>
      `- ${e.sport} ${e.league} | ${e.teams.home} vs ${e.teams.away} | ${e.startTimeISO}`
  )
  .join("\n")}

weekKey: ${weekKey}
`.trim();
}
