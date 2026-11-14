/**
 * Astro middleware installed by core's integration: every HTML page (dev and build) gets Czech
 * one-letter words glued to the next word (core/typography/czech.ts).
 */
import { defineMiddleware } from "astro/middleware";
import { glueOneLetterWordsInHtml } from "./czech.ts";

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("text/html")) {
    return response;
  }
  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(glueOneLetterWordsInHtml(html), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
