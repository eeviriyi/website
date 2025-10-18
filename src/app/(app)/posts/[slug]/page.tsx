import { allPosts } from "@/content-collections";
import { MDXRenderer } from "@/posts/components/MDXRenderer.tsx";

export function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post._meta.path.replace(/\.mdx$/, ""),
  }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postData = allPosts.find((p) => p._meta.path === slug);

  if (!postData) {
    return <div>Post not found</div>;
  }

  return (
    <article className="prose flex-1 py-8">
      <MDXRenderer code={postData.mdx} />
    </article>
  );
}
