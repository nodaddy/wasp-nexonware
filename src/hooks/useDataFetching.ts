import { useRef, useCallback } from "react";
import { useAuth } from "./useAuth";

interface CacheItem<T> {
  data: T;
  expiry: number;
}

interface FetchOptions {
  headers?: Record<string, string>;
  method?: string;
  body?: any;
}

export function useDataFetching() {
  const { getUserToken } = useAuth();
  const cache = useRef<Map<string, CacheItem<any>>>(new Map());

  // Default cache duration is 5 minutes
  const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

  // Function to generate a cache key from URL and options
  const getCacheKey = (url: string, options?: FetchOptions): string => {
    return `${url}:${JSON.stringify(options || {})}`;
  };

  // Function to check if cache is valid
  const isCacheValid = (key: string): boolean => {
    const item = cache.current.get(key);
    return !!item && item.expiry > Date.now();
  };

  // Function to fetch data with authentication and caching
  const fetchWithAuth = useCallback(
    async <T>(
      url: string,
      options?: FetchOptions,
      cacheDuration: number = DEFAULT_CACHE_DURATION,
      forceRefresh: boolean = false
    ): Promise<T> => {
      // Get token
      const token = await getUserToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      // Prepare fetch options with auth header
      const fetchOptions: FetchOptions = {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token}`,
        },
      };

      // Generate cache key
      const cacheKey = getCacheKey(url, fetchOptions);

      // Check cache if not forcing refresh
      if (!forceRefresh && isCacheValid(cacheKey)) {
        console.log(`Using cached data for ${url}`);
        return cache.current.get(cacheKey)!.data as T;
      }

      // Fetch fresh data
      console.log(`Fetching fresh data for ${url}`);
      const response = await fetch(url, fetchOptions as RequestInit);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as T;

      // Cache the response
      cache.current.set(cacheKey, {
        data,
        expiry: Date.now() + cacheDuration,
      });

      return data;
    },
    [getUserToken]
  );

  // Function to clear cache
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  // Function to clear specific cache entry
  const clearCacheEntry = useCallback((url: string, options?: FetchOptions) => {
    const key = getCacheKey(url, options);
    cache.current.delete(key);
  }, []);

  return {
    fetchWithAuth,
    clearCache,
    clearCacheEntry,
  };
}
