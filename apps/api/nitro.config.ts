import path from 'path'

// https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: 'src',
  alias: {
    '@': path.resolve(__dirname, './src')
  }
})
