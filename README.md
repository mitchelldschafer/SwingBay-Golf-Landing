# SwingBay Golf Landing

React + Vite frontend with an Express API for bookings, auth, and admin tools for the SwingBay indoor golf site.

## Markdown files in this repo

- `README.md` — project overview and deploy workflow
- `replit.md` — internal architecture notes
- `indoor-recreation-booking-preset.md` — landing-page prompt/reference doc
- `indoor-recreation-booking-preset copy.md` — alternate copy of the preset doc

## Local development

```bash
npm install
npm run dev
```

- Vite runs on `http://localhost:5173`
- Express runs on `http://localhost:5000`
- `/api/*` is proxied from Vite to the Express server during development

## Live site and GitHub sync

- GitHub repo: `mitchelldschafer/SwingBay-Golf-Landing`
- Netlify site: [swingbay-golf-denver.netlify.app](https://swingbay-golf-denver.netlify.app)
- Production branch: `main`

This project is already connected in Netlify to the GitHub repository and `main` branch. A push to `origin/main` should trigger a new production deploy automatically.

## Deploy settings

- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback: all routes rewrite to `index.html`

Those settings now live in the repo-level [`netlify.toml`](/Users/mitchellschafer/Library/Mobile%20Documents/com~apple~CloudDocs/Golf%20Simulator/netlify.toml:1), so the deploy setup is versioned instead of only living in local Netlify metadata.

## Working rule for future changes

If you want a change to be visible on the live site, it should be:

1. committed in this repo
2. pushed to GitHub
3. deployed by Netlify from `main`

If we work on a local-only change and do not push it, it will not appear on the live site.
