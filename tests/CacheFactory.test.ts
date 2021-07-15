/**
 * @jest-environment jsdom
 */

import { CacheFactory } from "../src/CacheFactory";

describe("CacheFactory", () => {
  describe("#create", () => {
    test("create localstorage based cache.", () => {
      const cache = CacheFactory.create("localstorage");

      expect((cache as any).scope).toBe("local");
    });

    test("create sessionstorage based cache.", () => {
      const cache = CacheFactory.create("sessionstorage");

      expect((cache as any).scope).toBe("session");
    });

    test("not supported options.", () => {
      expect(() => {
        const cache = CacheFactory.create("hogehoge" as any);
      }).toThrow("storage type is not supported.");
    });
  });
});
