/**
 * API request and response types
 */

import type { Bookmark, Category } from './models';

// Generic paginated response
export interface PaginatedResponse<T> {
  items: T[];
  bookmarks?: T[]; // API returns 'bookmarks' key instead of 'items'
  categories?: Category[];
  total: number;
  skip: number;
  limit: number;
  count: number;
}

// Request types
export interface FetchBookmarksParams {
  skip?: number;
  limit?: number;
  is_read?: boolean;
  category_id?: string;
  search?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

export interface UpdateBookmarkRequest {
  is_read?: boolean;
  add_categories?: string[];
  remove_categories?: string[];
}

// Response types
export interface BookmarksResponse {
  bookmarks: Bookmark[];
  total: number;
  skip: number;
  limit: number;
  count: number;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CategoryResponse extends Category {}

export interface BookmarkResponse extends Bookmark {}

export interface SyncResponse {
  message: string;
  bookmarks_synced: number;
}
