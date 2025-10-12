import { createClient, type Config } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schemas from ":schemas";

export const createDatabase = (config: Config) => {
  const client = createClient(config);

  const db = drizzle({
    client,
    schema: { ...schemas },
  });

  return {
    client,
    db,
  };
};
