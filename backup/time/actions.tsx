"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "selectedTimeZones";

type TimePreferencesPayload = {
  selectedNames: string[];
  is24Hour: boolean;
  currentSelection: string;
};

export async function saveTimePreferences(payload: TimePreferencesPayload) {
  const cookieStore = cookies();
  cookieStore.set({
    maxAge: 60 * 60 * 24 * 30,
    name: COOKIE_NAME,
    path: "/",
    value: JSON.stringify(payload),
  });
}
