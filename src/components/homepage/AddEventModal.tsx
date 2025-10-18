"use client";

import { format } from "date-fns";
import type React from "react";
import { createEventAction } from "../../lib/components/eventCalendar/actions.ts";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: Date;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, defaultDate }) => {
  if (!isOpen) return null;

  const handleSubmit = async (formData: FormData) => {
    await createEventAction(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
      <div className="w-96 border bg-card p-6 text-card-foreground">
        <h2 className="mb-4 font-bold text-xl">Add new event</h2>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-sm">Date</label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              defaultValue={format(defaultDate, "yyyy-MM-dd")}
              name="date"
              required
              type="date"
            />
          </div>
          <div>
            <label className="block font-medium text-sm">Title</label>
            <input className="mt-1 block w-full rounded-md border border-gray-300 p-2" name="title" required type="text" />
          </div>
          <div>
            <label className="block font-medium text-sm">Description (Optional)</label>
            <textarea className="mt-1 block w-full rounded-md border border-gray-300 p-2" name="description" rows={3} />
          </div>
          <div className="flex justify-end space-x-3">
            <button className="border px-4 py-2" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary/90" type="submit">
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
