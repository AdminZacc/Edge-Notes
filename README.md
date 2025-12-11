# Edge AI Notes

A minimalist notepad deployed on Cloudflare Pages that uses Workers AI for summaries/translation/rewriting, KV for anonymous note storage, and Turnstile for simple anti-spam.

## Features

- Workers AI: summarize, bulletize, translate, rewrite
- KV: store notes per anonymous session
- Pages + Tailwind: clean UI
- Turnstile: anti-spam without full auth

## Setup

1. Install Wrangler:

   ```bash
   npm i -g wrangler
   ```

2. Install deps and build CSS:

   ```bash
   npm install
   npm run build
   ```

3. Configure bindings in `wrangler.toml`:

   - `kv_namespaces[0].id`: create a KV namespace in Cloudflare and paste its ID
   - `TURNSTILE_SITE_KEY`: site key from Turnstile
   - Add secret: `wrangler secrets put TURNSTILE_SECRET`

4. Enable Workers AI on your account and ensure AI binding is available for Pages.

## Dev

```bash
npm run dev
```

Open the local preview URL and test saving notes and AI actions.

## Deploy

```bash
npm run deploy
```

## Notes

- The Pages Functions live under `functions/api/*` and are invoked via `/api/{route}`.
- Turnstile requires valid site and secret keys; the widget sits on `index.html`.
- Replace placeholders in `index.html` and `wrangler.toml` before deploy.
