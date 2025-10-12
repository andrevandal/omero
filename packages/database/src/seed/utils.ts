import { readFileSync } from "node:fs";
import path from "node:path";

import { slugify } from "@omero/utils";

export const loadJsonData = <T>(filePath: string): T => {
  const fullPath = path.resolve(__dirname, "data", filePath);
  const content = readFileSync(fullPath, "utf8");
  return JSON.parse(content) as T;
};

export const generateSlug = (title: string, language: string): string => {
  const baseSlug = slugify(title);
  return language === "pt-br" ? baseSlug : `${baseSlug}-${language}`;
};

export const assignVisibility = (
  index: number
): "public" | "draft" | "private" => {
  if (index === 2) return "draft"; // 3rd post is draft
  if (index === 3) return "private"; // 4th post is private
  return "public";
};

export const generateRandomDate = (daysAgo: number = 90): Date => {
  const now = Date.now();
  const randomTime = Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(now - randomTime);
};

export const createSEOCustomFields = (
  title: string,
  content: string,
  slug: string
) => ({
  meta_title: `${title} - Blog`,
  meta_description: content.slice(0, 160).replaceAll(/[#*]/g, "").trim(),
  og_tags: {
    title,
    description: content.slice(0, 200).replaceAll(/[#*]/g, "").trim(),
    image: {
      src: `/assets/blog/${slug}-og.jpg`,
      width: "1200",
      height: "630",
      alt: title,
    },
  },
});
