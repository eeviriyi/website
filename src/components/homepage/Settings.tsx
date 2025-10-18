"use client";

import { Languages, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState, useTransition } from "react";
import { getUserLocale, type Locale, setUserLocale } from "@/lib/core/i18n/locale.ts";

export default function Settings() {
  const t = useTranslations("Settings");
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = async () => {
    startTransition(async () => {
      const currentLocale = await getUserLocale();
      const newLocale: Locale = currentLocale === "zh-cn" ? "en" : "zh-cn";
      await setUserLocale(newLocale);
      window.location.reload();
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <button
        aria-label="Toggle theme"
        className="flex flex-row items-center border bg-card px-4 py-2 text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={toggleTheme}
        type="button"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        <span className="ml-2">{theme === "dark" ? t("light") : t("dark")}</span>
      </button>

      <button
        aria-label="Toggle language"
        className="flex flex-row items-center border bg-card px-4 py-2 text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        disabled={isPending}
        onClick={toggleLanguage}
        type="button"
      >
        <Languages size={18} /> <span className="ml-2">{t("language")}</span>
      </button>
    </div>
  );
}
