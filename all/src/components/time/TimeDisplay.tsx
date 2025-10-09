import type React from "react";

type CityTimeZone = {
  displayName: string;
  name: string;
  rawOffsetInMinutes: number;
};

interface TimeDisplayProps {
  selectedTimeZones: CityTimeZone[];
  currentSelection: string;
  onSelect: (timeZoneName: string) => void;
  onRemove: (timeZoneName: string) => void;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ selectedTimeZones, currentSelection, onSelect, onRemove }) => {
  if (selectedTimeZones.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-gray-300 border-dashed p-8 text-center text-gray-500">
        Add a city to see its current time.
      </div>
    );
  }

  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {selectedTimeZones.map((tz) => {
        const isActive = tz.name === currentSelection;
        return (
          <li
            className={`rounded-lg border bg-white p-4 shadow-sm transition ${isActive ? "border-blue-600 shadow-lg" : "border-gray-200"}`}
            key={tz.name}
          >
            <div className="flex items-start gap-3">
              <button className="flex-1 text-left" onClick={() => onSelect(tz.name)} type="button">
                <p className="font-semibold text-lg">{tz.displayName}</p>
                <p className="mt-1 text-gray-500 text-sm">{tz.name}</p>
              </button>
              <button
                aria-label={`Remove ${tz.displayName}`}
                className="rounded-md bg-gray-100 px-2 py-1 font-medium text-red-600 text-xs transition hover:bg-red-50 hover:text-red-700"
                onClick={() => onRemove(tz.name)}
                type="button"
              >
                Remove
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default TimeDisplay;
