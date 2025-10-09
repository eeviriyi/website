import { getTimeZones } from "@vvo/tzdb";
import { useState } from "react";

const allTimeZones = getTimeZones();
const cityTimeZones = allTimeZones
  .filter((tz) => tz.mainCities && tz.mainCities.length > 0)
  .map((tz) => ({
    displayName: `${tz.mainCities[0]} (${tz.abbreviation}, UTC${tz.rawOffsetInMinutes / 60})`,
    name: tz.name,
  }));

const TimeZoneDialog = ({ cityTimeZones, isOpen, onAddTimeZone, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTimeZones = cityTimeZones.filter((tz) => tz.displayName.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (tz) => {
    onAddTimeZone(tz);
    onClose();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 font-bold text-lg">Select a Time Zone</h2>
          <input
            className="mb-4 w-full rounded-lg border border-gray-300 p-2"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            type="text"
            value={searchTerm}
          />
          <ul className="max-h-60 overflow-y-auto">
            {filteredTimeZones.map((tz) => (
              <li className="cursor-pointer rounded p-2 hover:bg-gray-100" key={tz.name} onClick={() => handleSelect(tz)}>
                {tz.displayName}
              </li>
            ))}
          </ul>
          <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  );
};

export default TimeZoneDialog;
