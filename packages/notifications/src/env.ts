import { createEnv, rawEnvs } from '@omero/env'
import { commonsSchemas } from '@omero/schemas'
export const env = createEnv({
  server: {
    BASE_URL: commonsSchemas.UrlSchema,
    RESEND_KEY: commonsSchemas.StringSchema
  },
  runtimeEnvStrict: {
    BASE_URL: rawEnvs.BASE_URL,
    RESEND_KEY: rawEnvs.RESEND_KEY
  }
})
