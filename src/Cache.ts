export type CacheOptions = {
  readonly capacity?: number;
};

/**
 * Provides a cache function.
 */
export interface Cache {
  /**
   * Delete the cache.
   *
   * @param key Key to the cache.
   */
  delete(key: string): Promise<void>;

  /**
   * Clear the cache.
   */
  flush(): Promise<void>;

  /**
   * Get the cache.
   *
   * @param key Key to the cache.
   * @return Cache if key exists, undefined if not.
   */
  get<T>(key: string): Promise<T | undefined>;

  /**
   * Set the cache.
   *
   * @param key Key to the cache.
   * @param data Data to be set.
   * @param timeout Data expiration date.
   * @return true if registered or updated, false otherwise.
   */
  set<T>(key: string, data: T, timeout: number): Promise<boolean>;
}
