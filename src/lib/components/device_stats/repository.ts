import { gte } from "drizzle-orm";
import { db } from "@/lib/core/db/client.ts";
import { deviceStats, type NewDeviceStat } from "@/lib/core/db/schema/device_stats.ts";

export async function addDeviceStat(stat: Omit<NewDeviceStat, "id">) {
  const [inserted] = await db
    .insert(deviceStats)
    .values(stat)
    .onConflictDoUpdate({
      set: stat,
      target: deviceStats.deviceName,
    })
    .returning();
  return inserted;
}

export async function getRecentDeviceStats() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const stats = await db.select().from(deviceStats).where(gte(deviceStats.timestamp, twentyFourHoursAgo)).orderBy(deviceStats.timestamp);

  return stats;
}
