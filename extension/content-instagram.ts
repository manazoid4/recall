import type { SavedItem, ScrapeMessage } from "./types";

const SESSION_KEY = "saved-brain-instagram-session";
const MAX_ITEMS_PER_BATCH = 50;

function extractSavedItems(): SavedItem[] {
  const items: SavedItem[] = [];
  const seen = new Set<string>();

  const links = document.querySelectorAll('a[href*="/p/"]');

  for (const link of Array.from(links)) {
    const anchor = link as HTMLAnchorElement;
    const href = anchor.getAttribute("href");
    if (!href || seen.has(href)) continue;
    seen.add(href);

    const url = href.startsWith("/")
      ? `https://www.instagram.com${href}`
      : href;

    const article = anchor.closest("article") || anchor.closest("div[role]");
    const img = article?.querySelector("img") ?? anchor.querySelector("img");
    const thumbnailUrl = img?.getAttribute("src") ?? null;

    const timeEl = article?.querySelector("time") ?? anchor.closest("article")?.querySelector("time");
    const timestamp = timeEl?.getAttribute("datetime") ?? null;

    const id = href.split("/").filter(Boolean).find((s) => s.startsWith("C") || /^\d+$/.test(s)) ?? href;

    items.push({
      id,
      url,
      source: "instagram",
      title: null,
      author: null,
      timestamp,
      thumbnailUrl,
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
    source: "instagram",
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
  const items = extractSavedItems();
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
