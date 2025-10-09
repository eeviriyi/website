import { addWeeks, endOfWeek, startOfWeek } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/db";
import { events } from "@/lib/db/schema/events";

type NewEvent = {
  title: string;
  date: Date;
  description?: string;
};

export function calculateTwoWeekRange() {
  const today = new Date();
  const rangeStart = startOfWeek(today, { weekStartsOn: 1 });
  const rangeEnd = endOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });

  return {
    end: rangeEnd,
    start: rangeStart,
  };
}

export async function getEventsByDateRange(startDate: Date, endDate: Date) {
  const result = await db
    .select()
    .from(events)
    .where(and(gte(events.date, startDate), lte(events.date, endDate)))
    .orderBy(events.date);

  return result.map((event) => ({
    ...event,
    date: event.date.toISOString(),
  }));
}

export async function addEvent(eventData: NewEvent) {
  try {
    const result = await db.insert(events).values(eventData).returning();
    return result[0];
  } catch (error) {
    console.error("Error adding event:", error);
    throw new Error("Failed to add event to database.");
  }
}

export async function deleteEvent(eventId: number) {
  try {
    const result = await db.delete(events).where(eq(events.id, eventId)).returning({ id: events.id });
    if (result.length === 0) {
      throw new Error("Event not found for deletion.");
    }
    return result[0].id;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event.");
  }
}
