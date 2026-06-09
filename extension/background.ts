import type { SavedItem, SyncConfig, SyncStatus, ScrapeMessage, SyncMessage } from "./types";

const STORAGE_KEY_ITEMS = "saved-brain-pending-items";
const STORAGE_KEY_STATUS = "saved-brain-status";
const SYNC_ALARM_NAME = "saved-brain-sync-alarm";
const SYNC_INTERVAL_MINUTES = 15;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(SYNC_ALARM_NAME, {
    delayInMinutes: SYNC_INTERVAL_MINUTES,
    periodInMinutes: SYNC_INTERVAL_MINUTES,
  });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === SYNC_ALARM_NAME) {
    await triggerSync();
  }
});

chrome.runtime.onMessage.addListener(
  (
    message: ScrapeMessage | SyncMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    if (message.type === "scrape-complete") {
      handleScrapeComplete(message.items).then(() => sendResponse({ ok: true }));
      return true;
    }
    if (message.type === "sync-now") {
      triggerSync().then(() => sendResponse({ ok: true }));
      return true;
    }
    if (message.type === "sync-status") {
      getStatus().then((status) => sendResponse({ status }));
      return true;
    }
  },
);

async function handleScrapeComplete(items: SavedItem[]): Promise<void> {
  const pending = await getPendingItems();
  const existingIds = new Set(pending.map((i) => i.id));
  const deduped = items.filter((i) => !existingIds.has(i.id));
  if (deduped.length === 0) return;

  pending.push(...deduped);
  await setPendingItems(pending);
}

async function triggerSync(): Promise<void> {
  const config = await getConfig();
  if (!config.apiToken) {
    await updateStatus({ error: "Not connected — open the extension to connect your account", syncing: false });
    return;
  }

  const pending = await getPendingItems();
  if (pending.length === 0) {
    await updateStatus({ lastSync: new Date().toISOString(), itemCount: 0, error: null, syncing: false });
    return;
  }

  await updateStatus({ syncing: true });

  try {
    const response = await fetch(`${config.backendUrl}/api/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.apiToken ? { Authorization: `Bearer ${config.apiToken}` } : {}),
      },
      body: JSON.stringify(pending),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    await setPendingItems([]);
    await updateStatus({
      lastSync: new Date().toISOString(),
      itemCount: pending.length,
      error: null,
      syncing: false,
    });
  } catch (err) {
    await updateStatus({
      error: err instanceof Error ? err.message : "Unknown sync error",
      syncing: false,
    });
  }
}

const DEFAULT_BACKEND_URL = "https://userecall.app";

async function getConfig(): Promise<SyncConfig> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["config"], (result) => {
      const cfg = result.config || {};
      resolve({
        backendUrl: cfg.backendUrl || DEFAULT_BACKEND_URL,
        apiToken: cfg.apiToken || "",
      });
    });
  });
}

async function getPendingItems(): Promise<SavedItem[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [STORAGE_KEY_ITEMS]: [] }, (result) => {
      resolve(result[STORAGE_KEY_ITEMS] || []);
    });
  });
}

async function setPendingItems(items: SavedItem[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY_ITEMS]: items }, () => resolve());
  });
}

async function getStatus(): Promise<SyncStatus> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      {
        [STORAGE_KEY_STATUS]: {
          lastSync: null,
          itemCount: 0,
          error: null,
          syncing: false,
        },
      },
      (result) => {
        resolve(result[STORAGE_KEY_STATUS]);
      },
    );
  });
}

async function updateStatus(partial: Partial<SyncStatus>): Promise<void> {
  const current = await getStatus();
  const merged = { ...current, ...partial };
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY_STATUS]: merged }, () => resolve());
  });
}
