# Recall

Private saved-post memory importer.

## Stack
Next.js App Router, React, Tailwind v4, JSZip.

## Run
```bash
npm install
npm run dev
npm run lint
npm run build
```

## Import flow
- Meta export ZIP parsed in-browser.
- Only canonical URLs POST to `/api/sources/instagram`.
- No scraping. No passwords. No bulk ZIP upload.
