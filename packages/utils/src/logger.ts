import { pino, type LevelWithSilentOrString } from "pino";

export const createLogger = (level?: LevelWithSilentOrString) =>
  pino({
    level: level,
    transport: {
      target: "pino-pretty",
    },
  });
