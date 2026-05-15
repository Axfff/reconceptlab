import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const nodeSchema = z.object({
  id: z.string(),
  locale: z.enum(["en", "zh"]),
  title: z.string(),
  summary: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  translationStatus: z.enum(["source", "translated", "needs-review", "missing"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  conceptType: z.enum(["concept", "algorithm", "data-structure", "system", "math", "tool"]),
  tags: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  next: z.array(z.string()).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export const collections = {
  nodes: defineCollection({
    loader: glob({ pattern: "**/*.mdx", base: "./src/content/nodes" }),
    schema: nodeSchema
  })
};
