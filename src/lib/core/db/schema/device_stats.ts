import { bigint, boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const deviceStats = pgTable("device_stats", {
  batteryLevel: integer("battery_level").notNull(),
  clientTimestamp: bigint("client_timestamp", { mode: "number" }).notNull(),
  deviceId: text("device_id").notNull(),
  id: serial("id").primaryKey(),
  isCharging: boolean("is_charging").notNull(),
  screenTimeSec: integer("screen_time_sec").notNull(),
  serverTimestamp: timestamp("server_timestamp", { withTimezone: true }).defaultNow().notNull(),
});

export type NewDeviceStat = typeof deviceStats.$inferInsert;
