# Song request delivery setup

The website form sends requests through a Cloudflare Worker, which forwards them to a private Discord channel. The Discord webhook URL must stay in Cloudflare as a secret; do not put it in website files.

## Before publishing

1. In Discord, open the server that contains the private song request channel.
2. Open **Server Settings → Integrations → Webhooks**.
3. Create or regenerate the webhook for the private channel. Keep its URL private. The old URL was present in public website code, so it must be regenerated before using this setup.
4. In Cloudflare, open **Workers & Pages** and create a Worker named `groovyrecordshow-song-requests`.
5. Add the files `song-request-worker.js` and `wrangler.jsonc` from this repository to the Worker project, then deploy it.
6. In the Worker’s **Settings → Variables and Secrets**, add a secret named `DISCORD_WEBHOOK_URL` and paste the new Discord webhook URL into the secret value. Save and deploy.
7. Copy the Worker’s public `workers.dev` address. It is okay to share this address; do not share the Discord webhook URL.
8. Replace `https://YOUR-WORKER-SUBDOMAIN.workers.dev/song-request` in `script.js` with that address plus `/song-request`.

Cloudflare’s setup screens can change. The key security rule is that the webhook URL goes only into the Worker secret, never into `script.js`, HTML, or a GitHub file.

## What the Worker checks

The Worker accepts requests only from the two Groovy Record Show website domains, applies a request limit, validates the form, ignores submissions that fill the hidden spam-check field, and forwards the request to Discord. The browser code also displays a helpful success or failure message.
