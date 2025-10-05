import { describe, expect, test } from "vitest";

import { slugify } from "../string.js";

describe("String Utils", () => {
  describe("slugify", () => {
    test("converts simple text to slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    test("handles special characters", () => {
      expect(slugify("Hello, World!")).toBe("hello-world");
      expect(slugify("Hello & World @ Home")).toBe("hello-world-home");
      expect(slugify("Test#123$%^")).toBe("test123");
    });

    test("handles accented characters", () => {
      expect(slugify("Café")).toBe("cafe");
      expect(slugify("naïve")).toBe("naive");
      expect(slugify("résumé")).toBe("resume");
      expect(slugify("Piñata")).toBe("pinata");
    });

    test("handles multiple spaces and dashes", () => {
      expect(slugify("Hello   World")).toBe("hello-world");
      expect(slugify("Hello - World - Test")).toBe("hello-world-test");
      expect(slugify("Hello---World")).toBe("hello-world");
    });

    test("handles leading and trailing spaces", () => {
      expect(slugify("  Hello World  ")).toBe("hello-world");
    });

    test("removes leading and trailing dashes", () => {
      expect(slugify("-Hello World-")).toBe("hello-world");
      expect(slugify("--Hello World--")).toBe("hello-world");
    });

    test("handles empty string", () => {
      expect(slugify("")).toBe("");
    });

    test("handles string with only special characters", () => {
      expect(slugify("!@#$%^&*()")).toBe("");
      expect(slugify("---")).toBe("");
    });

    test("preserves numbers", () => {
      expect(slugify("Version 2.0")).toBe("version-20");
      expect(slugify("Chapter 123")).toBe("chapter-123");
    });

    test("handles mixed case with numbers", () => {
      expect(slugify("iPhone 15 Pro Max")).toBe("iphone-15-pro-max");
      expect(slugify("Node.js v18.0.0")).toBe("nodejs-v1800");
    });

    test("handles unicode characters", () => {
      expect(slugify("こんにちは")).toBe("");
      expect(slugify("Hello 世界")).toBe("hello");
    });
  });
});
