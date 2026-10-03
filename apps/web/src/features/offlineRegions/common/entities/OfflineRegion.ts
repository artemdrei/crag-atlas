export interface OfflineRegion {
  id: string;
  name: string;
  urls: string[];
  bytes: number;
  savedAt: number;
}

export interface DownloadProgress {
  done: number;
  total: number;
}
