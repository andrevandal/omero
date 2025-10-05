export const fixedEncodeURIComponent = (uriComponent: string) =>
  encodeURIComponent(uriComponent).replaceAll(
    /[!'()*]/g,
    (c) => `%${c.codePointAt(0)?.toString(16).toUpperCase()}`
  );

export const fullUrl = (
  baseUrl: string,
  path: string,
  searchParameters?: URLSearchParams | Record<string, string>
) => {
  const baseURL = new URL(baseUrl);
  const url = new URL(path, baseURL);
  const search = searchParameters
    ? new URLSearchParams(searchParameters)
    : undefined;

  url.search = search?.toString() ?? "";

  return url;
};
