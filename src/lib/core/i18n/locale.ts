"use server";

import { cookies } from "next/headers";

export type Locale = "en" | "zh-cn";
const defaultLocale: Locale = "en";

const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale(): Promise<Locale> {
  return ((await cookies()).get(COOKIE_NAME)?.value as Locale) || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);
}
