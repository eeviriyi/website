import { getTimeZones } from "@vvo/tzdb";
import { useState } from "react";

const allTimeZones = getTimeZones();
const cityTimeZones = allTimeZones.filter((tz) => tz.mainCities && tz.mainCities.length > 0);

export const useTimeZones = () => {
  const [selectedTimeZones, setSelectedTimeZones] = useState([]);

  const addTimeZone = (timeZone) => {
    if (!selectedTimeZones.some((tz) => tz.name === timeZone.name)) {
      setSelectedTimeZones((prev) => [...prev, timeZone]);
    }
  };

  const removeTimeZone = (timeZoneName) => {
    setSelectedTimeZones((prev) => prev.filter((tz) => tz.name !== timeZoneName));
  };

  return {
    addTimeZone,
    cityTimeZones,
    removeTimeZone,
    selectedTimeZones,
  };
};
