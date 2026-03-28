import axios from 'axios';
import type {
  FetchBookmarksParams,
  BookmarksResponse,
  CategoriesResponse,
  SyncResponse,
  UpdateBookmarkRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryResponse,
  BookmarkResponse,
} from '@/types';

// Use environment variable with fallback
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract user-friendly error message
    const message = 
      error.response?.data?.detail || 
      error.response?.data?.message ||
      error.message || 
      'An unexpected error occurred';
    
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message,
    });
    
    // Create a new error with user-friendly message
    const userError = new Error(message);
    return Promise.reject(userError);
  }
);

// Request interceptor (for future auth tokens)
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here in the future
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

export const fetchBookmarks = async (params: FetchBookmarksParams = {}): Promise<BookmarksResponse> => {
  const { skip = 0, limit = 20, is_read, category_id, search } = params;
  const queryParams: FetchBookmarksParams = { skip, limit };
  
  // Only add filter params if they have values
  if (is_read !== undefined) queryParams.is_read = is_read;
  if (category_id) queryParams.category_id = category_id;
  if (search) queryParams.search = search;
  
  const res = await api.get<BookmarksResponse>('/bookmarks', {
    params: queryParams,
  });
  return res.data;
};

export const fetchCategories = async (): Promise<CategoriesResponse> => {
  const res = await api.get<CategoriesResponse>('/categories');
  return res.data;
};

export const syncBookmarks = async (): Promise<SyncResponse> => {
  const res = await api.post<SyncResponse>('/sync');
  return res.data;
};

export const updateBookmark = async (id: string, data: UpdateBookmarkRequest): Promise<BookmarkResponse> => {
  const res = await api.patch<BookmarkResponse>(`/bookmarks/${id}`, data);
  return res.data;
};

export const createCategory = async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
  const res = await api.post<CategoryResponse>('/categories', data);
  return res.data;
};

export const updateCategory = async (id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> => {
  const res = await api.patch<CategoryResponse>(`/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
