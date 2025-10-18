import { addWeeks, endOfWeek, startOfWeek } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/core/db/client.ts";
import { calendarEvents } from "@/lib/core/db/schema/calendar_events.ts";

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
    .from(calendarEvents)
    .where(and(gte(calendarEvents.date, startDate), lte(calendarEvents.date, endDate)))
    .orderBy(calendarEvents.date);

  return result.map((event) => ({
    ...event,
    date: event.date.toISOString(),
  }));
}

export async function addEvent(eventData: NewEvent) {
  try {
    const result = await db.insert(calendarEvents).values(eventData).returning();
    return result[0];
  } catch (error) {
    console.error("Error adding event:", error);
    throw new Error("Failed to add event to database.");
  }
}

export async function deleteEvent(eventId: number) {
  try {
    const result = await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId)).returning({ id: calendarEvents.id });
    if (result.length === 0) {
      throw new Error("Event not found for deletion.");
    }
    return result[0].id;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event.");
  }
}

export async function updateEventCompletionStatus(eventId: number, isCompleted: boolean) {
  try {
    const result = await db
      .update(calendarEvents)
      .set({ isCompleted })
      .where(eq(calendarEvents.id, eventId))
      .returning({ id: calendarEvents.id, isCompleted: calendarEvents.isCompleted });

    if (result.length === 0) {
      throw new Error("Event not found for completion update.");
    }

    return result[0];
  } catch (error) {
    console.error("Error updating event completion status:", error);
    throw new Error("Failed to update event completion status.");
  }
}
