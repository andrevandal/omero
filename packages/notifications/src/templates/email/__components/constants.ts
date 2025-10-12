import { fullUrl } from "@omero/utils";

export const poweredByLink = (baseUrl: string) =>
  fullUrl(
    baseUrl,
    "/",
    new URLSearchParams({
      utm_source: "email",
      utm_medium: "email",
      utm_campaign: "email-verification",
    })
  ).toString();
