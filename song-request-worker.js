const ALLOWED_ORIGINS = new Set([
  "https://groovyrecordshow.com",
  "https://www.groovyrecordshow.com",
]);

function jsonResponse(data, status, origin) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };

  if (ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }

  return new Response(JSON.stringify(data), { status, headers });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (!ALLOWED_ORIGINS.has(origin)) {
      return jsonResponse({ error: "Origin not allowed." }, 403, "");
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin",
        },
      });
    }

    if (url.pathname !== "/song-request") {
      return jsonResponse({ error: "Not found." }, 404, origin);
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405, origin);
    }

    const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
    const rate = await env.SONG_REQUEST_LIMITER.limit({ key: clientIp });
    if (!rate.success) {
      return jsonResponse({ error: "Too many requests. Try again later." }, 429, origin);
    }

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > 12000) {
      return jsonResponse({ error: "Request is too large." }, 413, origin);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid request." }, 400, origin);
    }

    // Quietly accept bot submissions trapped by the hidden website field.
    if (typeof payload.website === "string" && payload.website.trim() !== "") {
      return jsonResponse({ ok: true }, 200, origin);
    }

    const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 80) : "";
    const song = typeof payload.song === "string" ? payload.song.trim().slice(0, 1000) : "";

    if (!song) {
      return jsonResponse({ error: "Please enter a song request." }, 400, origin);
    }

    if (!env.DISCORD_WEBHOOK_URL) {
      return jsonResponse({ error: "Song request delivery is not configured." }, 503, origin);
    }

    let webhookUrl;
    try {
      webhookUrl = new URL(env.DISCORD_WEBHOOK_URL);
    } catch {
      return jsonResponse({ error: "Song request delivery is not configured." }, 503, origin);
    }

    if (webhookUrl.protocol !== "https:" || webhookUrl.hostname !== "discord.com" || !webhookUrl.pathname.startsWith("/api/webhooks/")) {
      return jsonResponse({ error: "Song request delivery is not configured." }, 503, origin);
    }

    webhookUrl.searchParams.set("wait", "true");

    try {
      const discordResponse = await fetch(webhookUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "New Song Request",
            fields: [
              { name: "Name", value: name || "Anonymous" },
              { name: "Song request", value: song },
            ],
            timestamp: new Date().toISOString(),
          }],
          allowed_mentions: { parse: [] },
        }),
      });

      if (!discordResponse.ok) {
        return jsonResponse({ error: "Discord could not accept the request." }, 502, origin);
      }

      return jsonResponse({ ok: true }, 200, origin);
    } catch {
      return jsonResponse({ error: "Discord could not be reached." }, 502, origin);
    }
  },
};

