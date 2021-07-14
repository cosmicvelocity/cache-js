import { Cache, CacheOptions } from "./Cache";
import { StorageCache, StorageCacheOptions } from "./StorageCache";

type StorageType = "localstorage" | "sessionstorage";

export class CacheFactory {
  /**
   * Creates a cache with the specified options.
   *
   * @param type Cache storage type.
   * @param options Cache options.
   * @return Cache object.
   */
  public static create(
    type: StorageType,
    options: CacheOptions | StorageCacheOptions = {}
  ): Cache {
    switch (type) {
      case "localstorage":
        return new StorageCache({ ...options, scope: "local" });
      case "sessionstorage":
        return new StorageCache({ ...options, scope: "session" });
      default:
        throw new Error("storage type is not supported.");
    }
  }
}
