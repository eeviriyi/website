import PostsList from "@/components/homepage/PostsList";
import { getPostsByDate } from "@/lib/posts/PostsUtils";

export default async function PostsPage() {
  const posts = await getPostsByDate();
  return <PostsList posts={posts} />;
}
