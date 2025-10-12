import { describe, expect, test } from "vitest";

import { generateId } from "../random.js";

describe("Random Utils", () => {
  describe("generateId", () => {
    test("generates ID with default length of 7", () => {
      const id = generateId();
      expect(id).toHaveLength(7);
      expect(id).toMatch(/^[a-zA-Z0-9]+$/);
    });

    test("generates ID with custom length", () => {
      const id5 = generateId(5);
      expect(id5).toHaveLength(5);
      expect(id5).toMatch(/^[a-zA-Z0-9]+$/);

      const id10 = generateId(10);
      expect(id10).toHaveLength(10);
      expect(id10).toMatch(/^[a-zA-Z0-9]+$/);

      const id1 = generateId(1);
      expect(id1).toHaveLength(1);
      expect(id1).toMatch(/^[a-zA-Z0-9]+$/);
    });

    test("generates unique IDs", () => {
      const ids = new Set();
      for (let index = 0; index < 1000; index++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(1000);
    });

    test("throws error for zero or negative length", () => {
      expect(() => generateId(0)).toThrow("Length must be a positive integer.");
      expect(() => generateId(-1)).toThrow(
        "Length must be a positive integer."
      );
    });

    test("uses alphanumeric characters only", () => {
      const id = generateId(100);
      expect(id).toMatch(/^[a-zA-Z0-9]+$/);
      expect(id).not.toMatch(/[^a-zA-Z0-9]/);
    });

    test("contains mix of uppercase, lowercase, and numbers", () => {
      const id = generateId(1000);
      expect(id).toMatch(/[a-z]/);
      expect(id).toMatch(/[A-Z]/);
      expect(id).toMatch(/\d/);
    });
  });
});
