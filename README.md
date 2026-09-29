# Cryptocurrency.Wiki

An independent educational reference for cryptocurrency and blockchain technology, with live market and news feeds and an editorial review queue.

## Run locally

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`. Market and news data refresh every 10 minutes; use **Refresh** to fetch immediately.

To enable AI article suggestions, add an OpenAI API key to `.env` as `OPENAI_API_KEY=...`, then restart the app. `OPENAI_MODEL` can select a chat-completions model. AI suggestions are never published automatically; review them in the editorial desk.

## Checks

```powershell
npm run lint
npm run build
```

The article library and review queue are stored in the current browser's local storage. This starter is a single-editor prototype; a public multi-user deployment should replace local storage with authenticated editorial roles and a shared database.

## Deploy on Render

The root `render.yaml` defines a single Node web service that builds the frontend and serves it with the API:

1. Push this project to a GitHub repository. A private repository is fine; keep `.env` out of source control.
2. In Render, choose **New > Blueprint**, connect the repository, and create the service from `render.yaml`.
3. Render assigns a public `onrender.com` URL. Add `OPENAI_API_KEY` in the service's Environment settings if AI drafts are needed.

The free service may sleep while idle, and review changes remain in each visitor's browser rather than shared storage.

