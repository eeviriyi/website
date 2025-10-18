import type { NextRequest } from "next/server";
import { addDeviceStat } from "@/lib/components/device_stats/repository";
import type { NewDeviceStat } from "@/lib/core/db/schema/device_stats.ts";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const newStat: NewDeviceStat = {
      batteryLevel: data.batteryLevel,
      deviceName: data.deviceName,
      isCharging: data.isCharging,
      isScreenOn: data.isScreenOn,
      ...(data.timestamp ? { timestamp: data.timestamp } : {}),
    };

    const inserted = await addDeviceStat(newStat);

    return Response.json({ data: inserted, message: "Data uploaded successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error processing request:", error);
    return Response.json({ error: "Failed to upload data" }, { status: 500 });
  }
}
