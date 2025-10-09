import { cookies } from "next/headers";
import TimePageClient from "./TimePageClient.tsx";

export default function Page() {
  const cookieStore = cookies();
  let initialSelectedNames: string[] = [];
  let initialIs24Hour = false;
  let initialCurrentSelection = "";

  const raw = cookieStore.get("selectedTimeZones")?.value;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        initialSelectedNames = parsed;
      } else if (parsed && typeof parsed === "object") {
        initialSelectedNames = Array.isArray(parsed.selectedNames) ? parsed.selectedNames : [];
        initialIs24Hour = Boolean(parsed.is24Hour);
        initialCurrentSelection = typeof parsed.currentSelection === "string" ? parsed.currentSelection : "";
      }
    } catch {
      initialSelectedNames = [];
    }
  }

  return (
    <TimePageClient initialCurrentSelection={initialCurrentSelection} initialIs24Hour={initialIs24Hour} initialSelectedNames={initialSelectedNames} />
  );
}
