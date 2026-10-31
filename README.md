# ASCEND

A gamified fitness app (React + Vite).

```
npm install
npm run dev
```

## AI coach

The coach works out of the box in basic mode (answers from your diary numbers).
For real AI answers, run the small server, which keeps your API key off the browser:

```
ANTHROPIC_API_KEY=sk-... node server/coach.js
echo "VITE_COACH_URL=http://localhost:8787" > .env.local
npm run dev
```

Set `ALLOW_ORIGIN` to your site's origin before deploying. The server has a basic
per-IP rate limit; add real limits and auth before exposing it publicly.

## Photo meal scan
Needs the coach server: `ANTHROPIC_API_KEY=... node server/coach.js`, then set `VITE_COACH_URL=http://localhost:8787`. The app posts a shrunk photo to `/photo` and shows the estimate for you to confirm before anything is logged. Without the server the screen explains this and the rest of the app works.

## Not included
Barcode scanning uses the browser BarcodeDetector API (Chrome and Android). Other browsers get a type-the-number box. Built-in products live in `src/products.json`; add yours there, or save unknown barcodes in the app (stored on the device).
