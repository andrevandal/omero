import type { LogLevel } from 'consola'
interface ImportMetaEnv {
  PRIVATE_DATABASE_URL: string
  PRIVATE_JWT_SECRET: string
  CONSOLA_LEVEL?: LogLevel
}

interface ImportMeta {
  env: ImportMetaEnv
}

declare global {
  namespace NodeJS {
    interface ImportMeta {
      env: ImportMetaEnv
    }
  }
}
