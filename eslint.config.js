import { fileURLToPath } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import css from "@eslint/css";
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX, createNodeResolver } from "eslint-plugin-import-x";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import * as reactHooksPlugin from "eslint-plugin-react-hooks";
import { configs as sonarjsConfigs } from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import { tailwind4 } from "tailwind-csstree";
import * as tseslint from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig(
  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  globalIgnores([
    "dist/**",
    "**/node_modules/**",
    "**/coverage/**",
    "**/build/**",
    "**/public/**",
    "**/.cache/**",
  ]),

  js.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.strict,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  importX.flatConfigs.react,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  reactHooksPlugin.configs["recommended-latest"],
  jsxA11yPlugin.flatConfigs.recommended,
  sonarjsConfigs.recommended,
  unicorn.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals["shared-node-browser"],
      },
    },
    settings: {
      // React
      react: {
        version: "19.1.1",
      },
      formComponents: ["Form"],
      linkComponents: [
        { name: "Link", linkAttribute: "to" },
        { name: "NavLink", linkAttribute: "to" },
      ],

      // Import X
      "import-x/internal-regex": "^~/",
      "import-x/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      "import-x/core-modules": ["virtual:remix/server-build"],
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          project: "tsconfig.json",
        }),
        createNodeResolver(),
      ],
    },
    rules: {
      curly: ["error", "multi-or-nest", "consistent"],
      "arrow-body-style": ["error", "as-needed"],
      "prefer-arrow-callback": "error",

      // React
      "react/prop-types": "off",

      // Typecript
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Import X
      "import-x/order": [
        "error",
        {
          "newlines-between": "always",
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: "~/**",
              group: "internal",
            },
          ],
        },
      ],
      "import-x/namespace": ["error", { allowComputed: true }],

      // Unicorn
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",

      // Sonar
      "sonarjs/no-hardcoded-passwords": "off",
      "sonarjs/anchor-precedence": "warn",
      "sonarjs/slow-regex": "warn",
      "sonarjs/pseudo-random": "warn",
      "sonarjs/no-commented-code": "warn",
    },
  },

  {
    files: ["**/*.*.test.ts"],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "sonarjs/no-hardcoded-secrets": "off",
    },
  },

  {
    files: ["**/*.css"],
    plugins: {
      css,
    },
    language: "css/css",
    languageOptions: {
      customSyntax: {
        ...tailwind4,
        atrules: {
          ...tailwind4.atrules,
          "custom-variant": {
            prelude: "<custom-selector> <declaration-list>",
          },
        },
      },
    },
    rules: {
      "css/no-empty-blocks": "error",
    },
  },

  {
    files: ["./drizzle.config.ts"],

    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  {
    files: ["packages/custom-fields/src/**.ts"],

    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  {
    files: ["packages/database/src/seed/**.ts"],

    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "sonarjs/anchor-precedence": "off",
      "sonarjs/slow-regex": "off",
      "sonarjs/pseudo-random": "off",
      "unicorn/prefer-top-level-await": "off",
    },
  },

  prettierConfig
);
