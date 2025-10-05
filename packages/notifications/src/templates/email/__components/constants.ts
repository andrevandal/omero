import { fullUrl } from "@omero/utils";

import { env } from ":env";

export const poweredByLink = fullUrl(
  env.BASE_URL,
  "/",
  new URLSearchParams({
    utm_source: "email",
    utm_medium: "email",
    utm_campaign: "email-verification",
  })
).toString();
