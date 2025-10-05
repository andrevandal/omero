import { rawEnvs, createEnv } from '@omero/env'
import { envsSchemas } from '@omero/schemas'
export const env = createEnv({
  server: {
    DATABASE_URL: envsSchemas.databaseUrl,
    DATABASE_AUTH_TOKEN: envsSchemas.databaseAuthToken
  },
  runtimeEnvStrict: {
    DATABASE_URL: rawEnvs.DATABASE_URL,
    DATABASE_AUTH_TOKEN: rawEnvs.DATABASE_AUTH_TOKEN
  }
})
