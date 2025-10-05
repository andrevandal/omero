export { createEnv } from '@t3-oss/env-core'

export const rawEnvs = {
  ...process.env,
  ...import.meta.env
} as Record<string, string | undefined>
