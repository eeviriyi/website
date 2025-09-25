import Link from "next/link";
import { getAllPostsTags } from "@/lib/posts/PostsUtils";

export default async function Home() {
  const posts = await getAllPostsTags();

  return (
    <section className="flex flex-col space-y-2">
      {posts.map((tag) => (
        <Link className="flex" href={`/tags/${tag}`} key={tag}>
          {tag}
        </Link>
      ))}
    </section>
  );
}
