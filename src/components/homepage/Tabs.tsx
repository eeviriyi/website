"use client";

import { LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useSelectedLayoutSegment } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const UNDERLINE_ID = "underline";

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
    <LayoutGroup>
      <nav className="flex flex-row gap-3 overflow-x-auto font-medium text-xl md:flex-col md:overflow-x-visible">
        {tabs.map((tab) => {
          const isSelected = segment === tab.id;
          const href = tab.id === "homepage" && storedChatId ? `/homepage?id=${storedChatId}` : `/${tab.id}`;

          return (
            <Link
              className={`relative border px-5 py-3 pr-5 pl-5 md:border-0 md:pr-13 ${segment === tab.id ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent hover:text-accent-foreground"
                }`}
              href={href}
              key={tab.id}
            >
              {tab.name}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 z-[-1] rounded-md bg-primary"
                  layoutId={UNDERLINE_ID}
                  transition={{ damping: 30, stiffness: 300, type: "spring" }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
