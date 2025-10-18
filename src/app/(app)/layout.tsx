import Tabs from "@/components/homepage/Tabs.tsx";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex max-w-dvw flex-col gap-5 p-5 md:max-w-4xl md:flex-row md:gap-8 md:p-8">
      <Tabs />
      <div className="flex-1">{children}</div>
    </div>
  );
}
