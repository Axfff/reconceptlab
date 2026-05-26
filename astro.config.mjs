import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

const site = process.env.PUBLIC_SITE_URL ?? "https://reconceptlab.com";

export default defineConfig({
  site,
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex]
    }),
    react()
  ]
});
