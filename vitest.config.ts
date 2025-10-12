import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "threads",
    projects: [
      "{packages,apps}/{vitest,vite}.config.ts",
      {
        extends: true,
        test: {
          include: ["**/*.{browser}.test.{ts,tsx}"],
          // it is recommended to define a name when using inline configs
          name: { label: "node", color: "yellow" },
          environment: "happy-dom",
        },
      },
      {
        extends: true,
        test: {
          include: ["**/*.{node}.test.{ts}"],
          // color of the name label can be changed
          name: { label: "node", color: "green" },
          environment: "node",
        },
      },
    ],
  },
});
