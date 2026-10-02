# CryptoLoot.Wiki

An independent educational reference for cryptocurrency and blockchain technology, with live market and news feeds and an editorial review queue.

## Run locally

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`. Market and news data refresh every 10 minutes; use **Refresh** to fetch immediately.

## Checks

```powershell
npm run lint
npm run build
```

Favicons are generated from `images/icon.png` before development and production
builds. Vite gives the browser-tab icons content-hashed filenames so replacing the
artwork changes their URLs. Stable copies, including `/favicon.ico`, remain in
`public` for clients that request the conventional paths. Run `npm run icons`
after changing the source image during an already-running development session.

The home page's Pump.fun card opens the coin in a new tab. The Pump.fun coin page
blocks third-party framing with `X-Frame-Options: SAMEORIGIN` and CSP
`frame-ancestors 'self'`; adding `?embed=1` does not override those headers.
An inline Pump.fun panel requires an officially supported embeddable endpoint
or permission from Pump.fun to frame its page.

The article library and review queue are stored in the current browser's local storage. This starter is a single-editor prototype; a public multi-user deployment should replace local storage with authenticated editorial roles and a shared database.

## Deploy on Render

The root `render.yaml` defines a single Node web service that builds the frontend and serves it with the API:

1. Push this project to a GitHub repository. A private repository is fine; keep `.env` out of source control.
2. In Render, choose **New > Blueprint**, connect the repository, and create the service from `render.yaml`.
3. Render assigns a public `onrender.com` URL.

The free service may sleep while idle, and review changes remain in each visitor's browser rather than shared storage.

