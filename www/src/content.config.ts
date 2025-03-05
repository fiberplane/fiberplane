import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema()
});

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    tags: z.array(z.string()),
    image: z
      .object({
        src: z.string(),
        alt: z.string()
      })
      .optional(),
    draft: z.boolean().optional()
  })
});

const changelog = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/changelog"
  }),
  schema: z.object({
    date: z.coerce.date(),
    version: z.string(),
    draft: z.boolean().optional()
  })
});

export const collections = {
  docs,
  blog,
  changelog
};
