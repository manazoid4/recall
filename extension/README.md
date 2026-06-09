# Recall - Chrome Extension

A Chrome extension that scrapes saved/bookmarked posts from Instagram and X/Twitter and syncs them to your Recall backend.

## Installation (Developer Mode)

1. **Build the extension:**
   ```bash
   npm run extension:build
   ```

2. **Open Chrome and navigate to:**
   ```
   chrome://extensions
   ```

3. **Enable Developer Mode** (toggle in top-right corner)

4. **Click "Load unpacked"** and select the `extension/dist` folder

## Building for Production

### Build the extension:
```bash
npm run extension:build
```

### Create distribution package:
```bash
npm run extension:zip
```

This creates `saved-brain-extension.zip` in the project root for Chrome Web Store submission.

## Project Structure

```
extension/
├── dist/                  # Compiled output (after build)
├── scripts/
│   ├── copy-assets.js      # Copies static files to dist
│   └── package.js          # Creates zip archive
├── background.ts          # Service worker source
├── content-instagram.ts    # Instagram content script
├── content-twitter.ts     # Twitter content script
├── types.ts               # Shared TypeScript types
├── manifest.json          # Extension manifest
├── popup.html             # Popup UI
├── popup.js               # Popup logic
├── package.json           # Extension dependencies
└── tsconfig.json          # TypeScript config
```

## Configuration

1. Click the extension icon in Chrome
2. Enter your backend URL (e.g., `http://localhost:3000`)
3. Optionally add your API key
4. Click "Save Settings"

## Features

- Scrapes saved posts from Instagram (`/saved/*`)
- Scrapes bookmarks from X/Twitter (`/bookmarks`)
- Auto-syncs every 15 minutes
- Manual sync via popup
- Deduplication of items
- Sync status display

## Chrome Web Store Submission

1. Run `npm run extension:zip`
2. Upload `saved-brain-extension.zip` to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Fill in store listing details
4. Submit for review

## Development

```bash
# Build once
npm run extension:build

# Watch for changes (requires tsc installed globally or via npx)
npx tsc --watch

# Package for distribution
npm run extension:zip
```