import type { APIRoute } from "astro";
import { absoluteUrl, getSiteBase } from "../lib/seo";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const siteBase = getSiteBase(site);
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "User-agent: GPTBot",
    "Allow: /",
    "",
    "User-agent: ChatGPT-User",
    "Allow: /",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml", siteBase)}`
  ].join("\n");

  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
};
