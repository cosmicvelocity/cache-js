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
  });
});
