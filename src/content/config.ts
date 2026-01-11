import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  type: "content", // v2.5.0+ (required for Markdown)
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default("Orhan"),
    tags: z.array(z.string()),
    // optional: add an image property if you want cover images later
  }),
});

export const collections = {
  blog: blogCollection,
};
