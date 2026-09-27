# Snap-to-Store

Photograph a product with your webcam (or upload a photo), and Gemini identifies
it and generates a full single-product storefront around it — all rendered
locally in this Next.js app.

## Setup

1. Get a free Gemini API key: https://aistudio.google.com/apikey
2. Put it in `.env.local` (already created from `.env.local.example`):

   ```
   GEMINI_API_KEY=your_key_here
   ```

3. Install deps and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

4. Open http://localhost:3000, attach a photo or use the webcam tab, and wait
   for Gemini to identify the product and generate the storefront copy.

## How it works

- `src/components/ImageCapture.tsx` — file upload / drag-drop and webcam
  capture (via `getUserMedia` + `<canvas>` snapshot).
- `src/app/api/identify/route.ts` — sends the image to Gemini
  (`gemini-2.5-flash` by default) with a JSON schema to extract structured
  product data (name, category, features, estimated price, colors, tags).
- `src/app/api/generate-site/route.ts` — sends that product data back to
  Gemini to generate full storefront copy (hero, features, pricing tiers,
  testimonials, FAQ, brand colors) as structured JSON.
- `src/components/GeneratedStore.tsx` — renders the generated copy as a
  themed landing page using the captured photo as the hero image.

Everything runs locally against the Gemini API — no external hosting or
database required.
