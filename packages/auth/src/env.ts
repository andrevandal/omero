import { rawEnvs, createEnv } from "@omero/env";
import { commonsSchemas } from "@omero/schemas";

export const env = createEnv({
  server: {
    BASE_URL: commonsSchemas.UrlSchema,
    REGISTER_ENABLED: commonsSchemas.BooleanSchema,
  },
  runtimeEnvStrict: {
    BASE_URL: rawEnvs.BASE_URL,
    REGISTER_ENABLED: rawEnvs.REGISTER_ENABLED,
  },
});
