import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const deviceStats = pgTable("device_stats", {
  batteryLevel: integer("battery_level").notNull(),
  deviceName: text("device_name").notNull().primaryKey(),
  isCharging: boolean("is_charging").notNull(),
  isScreenOn: boolean("is_screen_on").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export type NewDeviceStat = typeof deviceStats.$inferInsert;
