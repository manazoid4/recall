export interface SavedItem {
  id: string;
  url: string;
  source: "instagram" | "twitter";
  title: string | null;
  author: string | null;
  timestamp: string | null;
  thumbnailUrl: string | null;
  scrapedAt: string;
}

export interface SyncConfig {
  backendUrl: string;
  apiToken: string;
}

export interface SyncStatus {
  lastSync: string | null;
  itemCount: number;
  error: string | null;
  syncing: boolean;
}

export interface ScrapeMessage {
  type: "scrape-complete";
  source: "instagram" | "twitter";
  items: SavedItem[];
}

export interface SyncMessage {
  type: "sync-now" | "sync-status" | "sync-result";
  status?: SyncStatus;
}
