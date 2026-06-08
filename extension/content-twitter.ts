import type { SavedItem, ScrapeMessage } from "./types";

const SESSION_KEY = "saved-brain-twitter-session";
const MAX_ITEMS_PER_BATCH = 50;

function extractBookmarkedItems(): SavedItem[] {
  const items: SavedItem[] = [];
  const seen = new Set<string>();

  const articles = document.querySelectorAll('article[data-testid="tweet"]');

  for (const article of Array.from(articles)) {
    const linkEl = article.querySelector('a[href*="/status/"]') as HTMLAnchorElement | null;
    if (!linkEl) continue;

    const href = linkEl.getAttribute("href");
    if (!href || seen.has(href)) continue;
    seen.add(href);

    const url = href.startsWith("/") ? `https://x.com${href}` : href;

    const idMatch = href.match(/\/status\/(\d+)/);
    const id = idMatch ? idMatch[1] : href;

    const authorEl = article.querySelector('a[role="link"] span') as HTMLElement | null;
    const author = authorEl?.textContent?.trim() ?? null;

    const textEl = article.querySelector('div[data-testid="tweetText"]') as HTMLElement | null;
    const title = textEl?.textContent?.trim().slice(0, 280) ?? null;

    const timeEl = article.querySelector("time") as HTMLTimeElement | null;
    const timestamp = timeEl?.getAttribute("datetime") ?? null;

    items.push({
      id,
      url,
      source: "twitter",
      title,
      author,
      timestamp,
      thumbnailUrl: null,
      scrapedAt: new Date().toISOString(),
    });

    if (items.length >= MAX_ITEMS_PER_BATCH) break;
  }

  return items;
}

async function storeItems(items: SavedItem[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [SESSION_KEY]: [] }, (result) => {
      const existing: SavedItem[] = result[SESSION_KEY] || [];
      const existingIds = new Set(existing.map((i) => i.id));
      const merged = [...existing, ...items.filter((i) => !existingIds.has(i.id))];
      chrome.storage.local.set({ [SESSION_KEY]: merged }, () => resolve());
    });
  });
}

async function sendToBackground(items: SavedItem[]): Promise<void> {
  const msg: ScrapeMessage = {
    type: "scrape-complete",
    source: "twitter",
    items,
  };
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, () => resolve());
  });
}

function debounce(fn: () => void, ms: number): () => void {
  let timer: number | undefined;
  return () => {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(fn, ms);
  };
}

async function runScrape(): Promise<void> {
  const items = extractBookmarkedItems();
  if (items.length === 0) return;
  await storeItems(items);
  await sendToBackground(items);
}

const debouncedScrape = debounce(runScrape, 2000);

const observer = new MutationObserver((mutations) => {
  let shouldScrape = false;
  for (const m of mutations) {
    if (m.addedNodes.length > 0) {
      shouldScrape = true;
      break;
    }
  }
  if (shouldScrape) debouncedScrape();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

runScrape();
