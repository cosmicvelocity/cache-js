import { Cache, CacheOptions } from "./Cache";

type CacheEntry = {
  expired: number;
  data: unknown;
};

const defaultCachePrefix = "_cache";
const defaultCapacity = 1000;

export type StorageCacheOptions = CacheOptions & {
  readonly prefix?: string;
  readonly scope?: "local" | "session";
};

export class StorageCache implements Cache {
  readonly #capacity: number;
  readonly #dataPrefix: string;
  readonly #metaPrefix: string;
  readonly #prefix: string;
  readonly #storage: Storage;

  public constructor({
    capacity,
    prefix,
    scope = "local",
  }: StorageCacheOptions = {}) {
    this.#capacity = capacity || defaultCapacity;
    this.#prefix = prefix || defaultCachePrefix;
    this.#dataPrefix = this.#prefix + "_data_";
    this.#metaPrefix = this.#prefix + "_meta_";
    this.#storage =
      scope === "local" ? window.localStorage : window.sessionStorage;
  }

  public async delete(key: string): Promise<void> {
    this.#storage.removeItem(this.key(key));
    this.updateSize(this.getSize() - 1);
  }

  public async flush(): Promise<void> {
    const keys = await this.keys();

    for (const key of keys) {
      await this.delete(key);
    }

    this.updateSize(0);
  }

  public async gc(): Promise<void> {
    const keys = await this.keys();
    const time = Date.now();

    for (const key of keys) {
      const entry = this.entry(key);

      if (entry && !this.isValid(entry, time)) {
        await this.delete(key);
      }
    }
  }

  public async get<T>(key: string): Promise<T | undefined> {
    const entry = this.entry(key);

    if (entry && this.isValid(entry)) {
      return entry.data as T;
    }

    return undefined;
  }

  public async keys(): Promise<string[]> {
    const cut = this.#dataPrefix.length;
    const keys: string[] = [];

    for (let i = 0; i < this.#storage.length; i++) {
      const key = this.#storage.key(i);

      if (key && key.startsWith(this.#dataPrefix)) {
        keys.push(key.substring(cut));
      }
    }

    return keys;
  }

  public async set<T>(key: string, data: T, timeout = -1): Promise<boolean> {
    const entryKey = this.key(key);
    const added = this.#storage.getItem(entryKey) === null ? 1 : 0;
    const size = this.getSize();

    if (this.#capacity < size + added) {
      return false;
    }

    this.#storage.setItem(
      entryKey,
      JSON.stringify({
        expired: timeout < 0 ? -1 : Date.now() + timeout,
        data,
      })
    );
    this.updateSize(size + added);

    return true;
  }

  public async size(): Promise<number> {
    return this.getSize();
  }

  private entry(key: string): CacheEntry | undefined {
    const json = this.#storage.getItem(this.key(key));

    if (!json) {
      return undefined;
    }

    return JSON.parse(json) as CacheEntry;
  }

  private getSize(): number {
    return parseInt(this.#storage.getItem(this.meta("size")) || "", 10) || 0;
  }

  private key(key: string): string {
    return this.#dataPrefix + key;
  }

  private isValid(entry: CacheEntry, time = Date.now()): boolean {
    return entry.expired < 0 || time < entry.expired;
  }

  private meta(key: string): string {
    return this.#metaPrefix + key;
  }

  private updateSize(size: number): void {
    this.#storage.setItem(this.meta("size"), String(size));
  }
}
