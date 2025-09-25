"use client";

import Link from "next/link";
import { useSearchParams, useSelectedLayoutSegment } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function Tabs() {
  const segment = useSelectedLayoutSegment();
  const searchParams = useSearchParams();
  const [storedChatId, setStoredChatId] = useState<string | null>(null);

  const t = useTranslations("Tabs");
  const tabs = [
    { id: "homepage", name: t("Homepage") },
    { id: "posts", name: t("Posts") },
    { id: "about", name: t("About") },
  ];

  useEffect(() => {
    const currentChatId = searchParams.get("id");
    if (currentChatId) {
      sessionStorage.setItem("chatId", currentChatId);
      setStoredChatId(currentChatId);
    } else {
      const savedChatId = sessionStorage.getItem("chatId");
      setStoredChatId(savedChatId);
    }
  }, [searchParams]);

  return (
    <nav className="flex flex-col gap-2 font-medium text-xl">
      {tabs.map((tab) => {
        const href = tab.id === "homepage" && storedChatId ? `/homepage?id=${storedChatId}` : `/${tab.id}`;

        return (
          <Link
            className={`p-3 ${
              segment === tab.id ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent hover:text-accent-foreground"
            }`}
            href={href}
            key={tab.id}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
