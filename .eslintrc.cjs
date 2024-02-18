// @ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require('eslint-define-config')

/// <reference types="@eslint-types/typescript-eslint" />

module.exports = defineConfig({
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['@nuxtjs/eslint-config-typescript'],
  rules: {}
})
