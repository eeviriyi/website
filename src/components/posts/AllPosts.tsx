import Link from "next/link";
import { allPosts } from "@/content-collections";

export default function AllPosts() {
  return (
    <section className="flex w-full flex-col gap-4">
      {allPosts.map((post) => (
        <Link
          className="flex w-full flex-col gap-3 border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
          href={`/posts/${post._meta.path}`}
          key={post._meta.path}
        >
          <div className="flex w-full items-center justify-between">
            <h3 className="pr-8 font-medium text-lg">{post.title}</h3>
            <p className="self-start whitespace-nowrap pt-1 text-muted-foreground text-sm tabular-nums">{post.date}</p>
          </div>

          {post.summary && <p className="line-clamp-2 text-muted-foreground text-sm">{post.summary}</p>}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
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
