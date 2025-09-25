import Link from "next/link";
import type { PostWithSlug } from "@/lib/posts/PostsUtils";

interface PostsListProps {
  posts: PostWithSlug[];
}

export default async function PostsList({ posts }: PostsListProps) {
  return (
    <section className="flex w-full flex-col gap-4">
      {posts.map((post) => (
        <Link
          className="flex w-full flex-col gap-3 border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
          href={`/posts/${post.slug}`}
          key={post.slug}
        >
          <div className="flex w-full items-center justify-between">
            <h3 className="pr-8 font-medium text-lg">{post.metadata.title}</h3>
            <p className="self-start whitespace-nowrap pt-1 text-muted-foreground text-sm tabular-nums">{post.metadata.date}</p>
          </div>

          {post.metadata.summary && <p className="line-clamp-2 text-muted-foreground text-sm">{post.metadata.summary}</p>}

          {post.metadata.tags && post.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.metadata.tags.map((tag) => (
                <span className="border bg-secondary px-3 py-1 text-secondary-foreground text-xs" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </section>
  );
}
