import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const calendarEvents = pgTable("calendar_events", {
  createdAt: timestamp("created_at").defaultNow(),
  date: timestamp("date", { mode: "date", withTimezone: true }).notNull(),
  description: text("description"),
  id: serial("id").primaryKey(),
  isCompleted: boolean("is_completed").default(false),
  title: text("title").notNull(),
});
