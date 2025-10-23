export function weeklyArticlesPrompt({ sport, events, weekKey }) {
  // events: [{eventId, sport, league, teams:{home,away}, startTimeISO}, ...]
  return `
You are a talented sports writer. Produce FIVE articles as JSON that meet ALL criteria:

- Each article >= 400 words, informative and original (no scraping).
- Audience: casual bettors & sports fans.
- Focus only on these sports/events (draw from list below).
- Include a title, summary (<= 40 words), full body in Markdown, and optional image URLs (royalty-free or leave empty).
- Tone: clear, engaging, neutral. Avoid claims of guaranteed outcomes.

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
${events.map(e => `- ${e.sport} ${e.league} | ${e.teams.home} vs ${e.teams.away} | ${e.startTimeISO}`).join("\n")}
`.trim();
}
