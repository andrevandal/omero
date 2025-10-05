/** @type {import('prettier').Config} */

const config = {
  bracketSpacing: true,
  arrowParens: 'avoid',
  printWidth: 80,
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  endOfLine: 'auto',
  plugins: [
    'prettier-plugin-tailwindcss',
    'prettier-plugin-sh',
    '@prettier/plugin-oxc'
  ],
  overrides: [
    {
      files: ['*.yml', '*.yaml'],
      options: {
        singleQuote: false
      }
    }
  ]
}

export default config
