import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { date, z } from "zod";
 
const posts = defineCollection({
  name: "posts",
  directory: "src/posts",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    date: z.string().refine(date),
    tags: z.array(z.string()).optional(),
    summary: z.string().optional(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    return {
      ...document,
      mdx,
    };
  },
});
 
export default defineConfig({
  collections: [posts],
});