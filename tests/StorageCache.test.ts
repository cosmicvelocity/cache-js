/**
 * @jest-environment jsdom
 */

import { StorageCache } from "../src/StorageCache";

describe("StorageCache", () => {
  beforeEach(() => {
    jest.useFakeTimers("modern");

    const liveData = {
      expired: -1,
      data: "TEST",
    };
    const expiredData = {
      expired: Date.now() + 1000,
      data: "TEST TIMEOUT",
    };

    window.localStorage.setItem("test", "dummy");
    window.localStorage.setItem("_cache_meta_size", "2");
    window.localStorage.setItem("_cache_data_test", JSON.stringify(liveData));
    window.localStorage.setItem(
      "_cache_data_timeout",
      JSON.stringify(expiredData)
    );
  });
  afterEach(() => {
    window.localStorage.clear();

    jest.useRealTimers();
  });

  describe("#delete", () => {
    describe("when key exists.", () => {
      const cache = new StorageCache();

      test("cache will be deleted.", async () => {
        await expect(cache.get("test")).resolves.not.toBeUndefined();
        await cache.delete("test");
        expect(window.localStorage.getItem("_cache_data_test")).toBeNull();
      });
    });

    describe("when key not exists.", () => {
      const cache = new StorageCache();

      test("cache will be deleted.", async () => {
        await expect(cache.get("not_exists_key")).resolves.toBeUndefined();
        await cache.delete("not_exists_key");
        expect(
          window.localStorage.getItem("_cache_data_not_exists_key")
        ).toBeNull();
      });
    });
  });

  describe("#flush", () => {
    const cache = new StorageCache();

    test("only cache data will be deleted.", async () => {
      expect(window.localStorage.length).toBe(4);
      await cache.flush();
      console.log(window.localStorage);
      expect(window.localStorage.length).toBe(2);
    });
  });

  describe("#gc", () => {
    test("expired entries will be deleted.", async () => {
      const cache = new StorageCache();

      await cache.gc();
      expect(window.localStorage.length).toBe(4);

      jest.setSystemTime(Date.now() + 1100);

      await cache.gc();
      expect(window.localStorage.length).toBe(3);
    });
  });

  describe("#get", () => {
    describe("when key exists.", () => {
      const cache = new StorageCache();

      test("data can be retrieved.", async () => {
        await expect(cache.get("test")).resolves.toEqual("TEST");
      });
      test("data that has timed out cannot be retrieved.", async () => {
        await expect(cache.get("timeout")).resolves.toEqual("TEST TIMEOUT");

        jest.setSystemTime(Date.now() + 300);

        await expect(cache.get("timeout")).resolves.toEqual("TEST TIMEOUT");

        jest.setSystemTime(Date.now() + 800);

        await expect(cache.get("timeout")).resolves.toBeUndefined();
      });
    });

    describe("when key not exists.", () => {
      const cache = new StorageCache();

      test("unable to retrieve data.", async () => {
        await expect(cache.get("not_exists_key")).resolves.toBeUndefined();
      });
    });
  });

  describe("#keys", () => {
    const cache = new StorageCache();

    test("list of valid keys will be retrieved.", async () => {
      await expect(cache.keys()).resolves.toEqual(["test", "timeout"]);
    });
  });

  describe("#set", () => {
    describe("when key exists.", () => {
      test("entry is saved", async () => {
        const cache = new StorageCache();

        await expect(cache.set("test", "TEST2")).resolves.toBeTruthy();
        expect(window.localStorage.getItem("_cache_data_test")).toBe(
          JSON.stringify({
            expired: -1,
            data: "TEST2",
          })
        );
      });

      test("capacity is met", async () => {
        const cache = new StorageCache({ capacity: 2 });

        await expect(cache.set("test", "TEST")).resolves.toBeTruthy();
        await expect(cache.size()).resolves.toBe(2);
        expect(window.localStorage.getItem("_cache_data_test")).not.toBeNull();
      });
    });

    describe("when key not exists.", () => {
      test("entry is saved", async () => {
        const cache = new StorageCache();
        await cache.set("test", "TEST");

        expect(window.localStorage.getItem("_cache_data_test")).toBe(
          JSON.stringify({
            expired: -1,
            data: "TEST",
          })
        );
      });

      test("capacity is met", async () => {
        const cache = new StorageCache({ capacity: 2 });

        await expect(cache.set("new_key", "TEST")).resolves.toBeFalsy();
        await expect(cache.size()).resolves.toBe(2);
        expect(window.localStorage.getItem("_cache_data_new_key")).toBeNull();
      });
    });
  });

  describe("#size", () => {
    const cache = new StorageCache();

    test("only the number of cached data will be retrieved.", async () => {
      await expect(cache.size()).resolves.toBe(2);
    });
  });

  test("set and get the cache.", async () => {
    const cache = new StorageCache();

    await cache.set("example", "EXAMPLE");
    await expect(cache.get("example")).resolves.toEqual("EXAMPLE");

    await cache.set("example_timeout", "EXAMPLE TIMEOUT", 1000);

    jest.setSystemTime(Date.now() + 300);
    await expect(cache.get("example_timeout")).resolves.toEqual(
      "EXAMPLE TIMEOUT"
    );

    jest.setSystemTime(Date.now() + 800);
    await expect(cache.get("example_timeout")).resolves.toBeUndefined();
  });

  test("set and get objects.", async () => {
    const obj = {
      id: 1,
      text: "Hello !!",
    };
    const cache = new StorageCache();

    await cache.set("example", obj);
    await expect(cache.get("example")).resolves.toEqual(obj);

    await cache.set("example_timeout", obj, 1000);

    jest.setSystemTime(Date.now() + 300);
    await expect(cache.get("example_timeout")).resolves.toEqual(obj);

    jest.setSystemTime(Date.now() + 800);
    await expect(cache.get("example_timeout")).resolves.toBeUndefined();
  });

  describe("set and get primitives.", () => {
    const cache = new StorageCache();

    test("boolean", async () => {
      await cache.set("example", true);
      await expect(cache.get("example")).resolves.toBeTruthy();
      await cache.set("example", false);
      await expect(cache.get("example")).resolves.toBeFalsy();
    });

    test("number", async () => {
      await cache.set("example", 10000);
      await expect(cache.get("example")).resolves.toBe(10000);
      await cache.set("example", -10000);
      await expect(cache.get("example")).resolves.toBe(-10000);
    });

    test("null", async () => {
      await cache.set("example", null);
      await expect(cache.get("example")).resolves.toBeNull();
    });

    test("undefined", async () => {
      await cache.set("example", undefined);
      await expect(cache.get("example")).resolves.toBeUndefined();
    });
  });
});
