import Tabs from "@/components/homepage/Tabs";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-8 md:flex-row">
      <Tabs />
      <div className="flex-1">{children}</div>
    </div>
  );
}
