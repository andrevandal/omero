import * as v from "valibot";

export const stages = v.picklist(["production", "beta", "development", "test"]);

export const logLevel = v.picklist([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);

export {
  BooleanSchema as coreRegisterEnabled,
  UrlSchema as databaseUrl,
  OptionalStringSchema as databaseAuthToken,
  UrlSchema as baseUrl,
  UrlSchema as betterAuthUrl,
  OptionalStringSchema as resendKey,
  OptionalStringSchema as betterAuthSecret,
} from ":commons/index.js";
