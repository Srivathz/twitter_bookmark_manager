/**
 * Core domain models for the Twitter Bookmark Manager
 */

export interface Bookmark {
  id: string;
  text: string;
  author_username: string;
  created_at: string;
  mediaUrl?: string;
  categories?: string[]; // Category names as strings (optional, only in update responses)
  is_read: boolean;
  tweet_id: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface SyncStatus {
  lastSync: Date;
  syncing: boolean;
}

export interface User {
  id: string;
  username: string;
  name?: string;
}

export interface FilterState {
  read?: boolean;
  search?: string;
  dateRange?: [Date, Date];
}
