import fs from "node:fs/promises";
import path from "node:path";

export interface PostMetadata {
  title: string;
  date: string;
  tags?: string[];
  summary?: string;
}

export interface PostWithSlug {
  slug: string;
  metadata: PostMetadata;
}

const postsDirectory = path.join(process.cwd(), "src", "posts");

let cachedPosts: Map<string, PostMetadata> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 0;

async function loadAllPostsMetadata(): Promise<Map<string, PostMetadata>> {
  const now = Date.now();

  if (cachedPosts && now - cacheTimestamp < CACHE_TTL) {
    return cachedPosts;
  }

  const posts = new Map<string, PostMetadata>();

  try {
    await fs.access(postsDirectory);
  } catch {
    cachedPosts = posts;
    cacheTimestamp = now;
    return posts;
  }

  const files = await fs.readdir(postsDirectory);
  const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

  await Promise.all(
    mdxFiles.map(async (file) => {
      const slug = file.replace(/\.mdx$/, "");
      try {
        const { metadata } = await import(`@/posts/${slug}.mdx`);

        posts.set(slug, metadata as PostMetadata);
      } catch (error) {
        console.warn(`Failed to load metadata for ${slug}:`, error);
      }
    }),
  );

  cachedPosts = posts;
  cacheTimestamp = now;
  return posts;
}

export async function getAllPostsSlugs(): Promise<string[]> {
  const posts = await loadAllPostsMetadata();
  return Array.from(posts.keys());
}

export async function getAllPostsTags(): Promise<string[]> {
  const posts = await loadAllPostsMetadata();
  const tagsSet = new Set<string>();

  for (const metadata of posts.values()) {
    if (metadata.tags) {
      metadata.tags.forEach((tag) => {
        tagsSet.add(tag);
      });
    }
  }

  return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
}

export async function getPostMetadata(slug: string): Promise<PostMetadata> {
  const posts = await loadAllPostsMetadata();
  const metadata = posts.get(slug);

  if (!metadata) {
    throw new Error(`Post not found: ${slug}`);
  }

  return metadata;
}

export async function getPostsByDate(start?: number, end?: number): Promise<PostWithSlug[]> {
  const posts = await loadAllPostsMetadata();

  const postsWithMetadata = Array.from(posts.entries()).map(([slug, metadata]) => ({
    date: new Date(metadata.date),
    metadata,
    slug,
  }));

  postsWithMetadata.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (start === undefined && end === undefined) {
    return postsWithMetadata.map(({ slug, metadata }) => ({ metadata, slug }));
  }

  const startIndex = start !== undefined ? start - 1 : 0;
  const endIndex = end !== undefined ? end : postsWithMetadata.length;

  return postsWithMetadata.slice(startIndex, endIndex).map(({ slug, metadata }) => ({ metadata, slug }));
}

export async function getPostsByTag(tag: string): Promise<PostWithSlug[]> {
  const posts = await loadAllPostsMetadata();

  const filteredPosts = Array.from(posts.entries())
    .filter(([, metadata]) => metadata.tags?.includes(tag))
    .map(([slug, metadata]) => ({
      date: new Date(metadata.date),
      metadata,
      slug,
    }));

  filteredPosts.sort((a, b) => b.date.getTime() - a.date.getTime());

  return filteredPosts.map(({ slug, metadata }) => ({ metadata, slug }));
}

export function clearPostsCache(): void {
  cachedPosts = null;
  cacheTimestamp = 0;
}
