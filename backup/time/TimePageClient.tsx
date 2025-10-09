"use client";

import { getTimeZones } from "@vvo/tzdb";
import { useEffect, useMemo, useRef, useState } from "react";
import TimeDisplay from "@/components/time/TimeDisplay";
import TimeZoneDialog from "@/components/time/TimeZoneDialog";
import { saveTimePreferences } from "./actions";

const allTimeZones = getTimeZones();
const cityTimeZones = allTimeZones
  .filter((tz) => tz.mainCities && tz.mainCities.length > 0)
  .map((tz) => ({
    displayName: `${tz.mainCities[0]} (${tz.abbreviation}, UTC${tz.rawOffsetInMinutes / 60})`,
    name: tz.name,
    rawOffsetInMinutes: tz.rawOffsetInMinutes,
  }))
  .sort((a, b) => a.displayName.localeCompare(b.displayName));

type CityTimeZone = (typeof cityTimeZones)[number];

interface TimePageClientProps {
  initialSelectedNames: string[];
  initialIs24Hour: boolean;
  initialCurrentSelection: string;
}

export default function TimePageClient({ initialSelectedNames, initialIs24Hour, initialCurrentSelection }: TimePageClientProps) {
  const initialSelectedTimeZones = useMemo(() => cityTimeZones.filter((tz) => initialSelectedNames.includes(tz.name)), [initialSelectedNames]);

  const [selectedTimeZones, setSelectedTimeZones] = useState<CityTimeZone[]>(initialSelectedTimeZones);
  const [currentSelection, setCurrentSelection] = useState(() => {
    if (initialCurrentSelection && initialSelectedTimeZones.some((tz) => tz.name === initialCurrentSelection)) {
      return initialCurrentSelection;
    }
    return initialSelectedTimeZones[0]?.name ?? "";
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [is24Hour, setIs24Hour] = useState(initialIs24Hour);
  const [displayTime, setDisplayTime] = useState("--:--:--");
  const [displayDate, setDisplayDate] = useState("");
  const hasInitializedCookie = useRef(false);

  const activeTimeZone = useMemo(() => currentSelection || Intl.DateTimeFormat().resolvedOptions().timeZone, [currentSelection]);

  useEffect(() => {
    const updateDisplay = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat(is24Hour ? "en-GB" : "en-US", {
        hour: "2-digit",
        hour12: !is24Hour,
        minute: "2-digit",
        second: "2-digit",
        timeZone: activeTimeZone,
      });
      const dateFormatter = new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        timeZone: activeTimeZone,
        weekday: "long",
        year: "numeric",
      });

      setDisplayTime(timeFormatter.format(now));
      setDisplayDate(dateFormatter.format(now));
    };

    updateDisplay();
    const intervalId = window.setInterval(updateDisplay, 1000);
    return () => window.clearInterval(intervalId);
  }, [activeTimeZone, is24Hour]);

  useEffect(() => {
    if (!hasInitializedCookie.current) {
      hasInitializedCookie.current = true;
      return;
    }
    const names = selectedTimeZones.map((tz) => tz.name);
    void saveTimePreferences({ currentSelection, is24Hour, selectedNames: names });
  }, [selectedTimeZones, is24Hour, currentSelection]);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(is24Hour ? "en-GB" : "en-US", {
        hour: "2-digit",
        hour12: !is24Hour,
        minute: "2-digit",
        second: "2-digit",
        timeZone: activeTimeZone,
      }),
    [activeTimeZone, is24Hour],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        timeZone: activeTimeZone,
        weekday: "long",
        year: "numeric",
      }),
    [activeTimeZone],
  );

  const formattedTime = timeFormatter.format(now);
  const formattedDate = dateFormatter.format(now);
  const currentTimeZoneDisplayName = cityTimeZones.find((tz) => tz.name === activeTimeZone)?.displayName ?? activeTimeZone;

  const handleAddTimeZone = (timeZone: CityTimeZone) => {
    const exists = selectedTimeZones.some((tz) => tz.name === timeZone.name);
    if (!exists) {
      setSelectedTimeZones((prev) => [...prev, timeZone]);
      setCurrentSelection(timeZone.name);
    }
    setIsDialogOpen(false);
  };

  const handleRemoveTimeZone = (nameToRemove: string) => {
    setSelectedTimeZones((prev) => {
      const updated = prev.filter((tz) => tz.name !== nameToRemove);
      if (currentSelection === nameToRemove) {
        setCurrentSelection(updated[0]?.name ?? "");
      }
      return updated;
    });
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-amber-900">
      <div className="grid h-[calc(90dvh)] w-[calc(90dvw)] grid-rows-2 bg-neutral-200" style={{ borderRadius: "21px" }}>
        <div className="flex flex-1 flex-col border-white border-b-3 p-[55px]">
          <div className="flex flex-row">
            <div className="">TimeSpot</div>
            <div className="mx-auto">Search</div>
            <div className="">Log in</div>
          </div>
          <div className="flex flex-1">
            <div className="m-auto text-center text-[320px] leading-none">{displayTime}</div>
          </div>
          <div className="flex flex-row">
            <button
              className="rounded-md border border-gray-300 px-3 py-2 font-medium text-gray-700 text-sm transition hover:bg-gray-100"
              onClick={() => setIs24Hour((prev) => !prev)}
              type="button"
            >
              {is24Hour ? "Switch to 12h" : "Switch to 24h"}
            </button>
            <div className="mx-auto">{displayDate}</div>
            <div className="">Current</div>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-[55px]">
          <div className="flex flex-row">
            <div className="">{currentTimeZoneDisplayName}</div>
            <div className="mx-auto">Life moves fast. Stay on time and enjoy every moment!</div>
            <button
              className="mb-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition duration-200 hover:bg-blue-700"
              onClick={() => setIsDialogOpen(true)}
              type="button"
            >
              Add City
            </button>
          </div>
          <TimeDisplay
            currentSelection={currentSelection}
            onRemove={handleRemoveTimeZone}
            onSelect={setCurrentSelection}
            selectedTimeZones={selectedTimeZones}
          />
          <TimeZoneDialog
            cityTimeZones={cityTimeZones}
            isOpen={isDialogOpen}
            onAddTimeZone={handleAddTimeZone}
            onClose={() => setIsDialogOpen(false)}
          />
          <div className="flex flex-row">
            <button
              className="rounded-md border border-gray-300 px-3 py-2 font-medium text-gray-700 text-sm transition hover:bg-gray-100"
              onClick={() => setIs24Hour((prev) => !prev)}
              type="button"
            >
              {is24Hour ? "Switch to 12h" : "Switch to 24h"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
