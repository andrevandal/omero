import { rawEnvs } from "@omero/env";
import { pino } from "pino";

export const logger = pino({
  level: rawEnvs.LOG_LEVEL ?? "info",
  transport: {
    target: "pino-pretty",
  },
});
