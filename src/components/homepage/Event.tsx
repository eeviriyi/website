"use client";

import { eachDayOfInterval, format, isSameDay } from "date-fns";
import { Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { AddEventModal } from "@/components/homepage/AddEventModal";
import { deleteEventAction } from "@/lib/event/actions";

type Event = {
  id: number;
  title: string;
  date: string;
  description: string | null;
};

const getDaysInInterval = (start: Date, end: Date) => eachDayOfInterval({ end, start });

export function EventCalendar({ events, range }: { events: Event[]; range: { start: Date; end: Date } }) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false);

  useEffect(() => {
    const dailyEvents = events.filter((event) => isSameDay(selectedDate, new Date(event.date)));
    setSelectedDayEvents(dailyEvents.length > 0 ? dailyEvents : null);
  }, [events, selectedDate]);

  const days = getDaysInInterval(range.start, range.end);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const handleDelete = async (id: number) => {
    setSelectedDayEvents((prev) => (prev ? prev.filter((e) => e.id !== id) : null));
    await deleteEventAction(id);
  };

  return (
    <div className="w-full border bg-card px-5 py-3 text-card-foreground">
      <div className="grid grid-cols-7 gap-5 py-5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
          <span className="text-center text-muted-foreground" key={label}>
            {label}
          </span>
        ))}
        {(showAllDays ? days : days.slice(0, 7)).map((day) => {
          const formattedDate = format(day, "d");
          const dayKey = format(day, "yyyy-MM-dd");
          const isSelected = isSameDay(day, selectedDate);

          return (
            <button className="flex cursor-pointer flex-col items-center" key={dayKey} onClick={() => handleDayClick(day)} type="button">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors md:h-13 md:w-13 ${isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
              >
                {formattedDate}
              </div>
            </button>
          );
        })}
        {!showAllDays && days.length > 7 && (
          <button
            className="col-span-7 flex items-center justify-center text-muted-foreground transition hover:text-primary"
            onClick={() => setShowAllDays(true)}
            type="button"
          >
            <span className="text-xl leading-none">
              <Minus />
            </span>
          </button>
        )}
      </div>

      <div className="border-t px-3 py-5">
        <div className="flex">
          <button
            className="bg-secondary px-4 py-2 text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            Add Event to {format(selectedDate, "M/d")}
          </button>
        </div>
        {selectedDayEvents ? (
          <ul>
            {selectedDayEvents.map((event) => (
              <li className="border-b p-3" key={event.id}>
                <p className="font-medium">{event.title}</p>
                <p className="text-muted-foreground">{event.description}</p>
                <button className="text-destructive text-sm" onClick={() => handleDelete(event.id)} type="button">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-3 text-muted-foreground">There are no events scheduled for {format(selectedDate, "M/d")}</p>
        )}
        <AddEventModal defaultDate={selectedDate} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
}
