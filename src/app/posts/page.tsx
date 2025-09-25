import PostsList from "@/components/mdx/PostsList";
import { getPostsByDate } from "@/lib/posts/PostsUtils";

export default async function PostsPage() {
  const posts = await getPostsByDate();
  return <PostsList posts={posts} />;
}
