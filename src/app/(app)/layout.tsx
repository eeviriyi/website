import Tabs from "@/components/homepage/Tabs";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-4 gap-16 p-16">
      <div className="col-span-1">
        <Tabs />
      </div>
      <div className="col-span-3">{children}</div>
    </div>
  );
}
