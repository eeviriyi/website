export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { default: Post } = await import(`@/posts/${slug}.mdx`);

  return (
    <div className="prose dark:prose-invert">
      <Post />
    </div>
  );
}

export function generateStaticParams() {
  return [{ slug: "welcome" }, { slug: "about" }];
}

export const dynamicParams = true;
