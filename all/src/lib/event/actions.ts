"use server";

import { revalidatePath } from "next/cache";
import { addEvent, deleteEvent } from "@/lib/event/utils";

export async function createEventAction(formData: FormData) {
  const title = formData.get("title") as string;
  const dateString = formData.get("date") as string;
  const description = formData.get("description") as string;

  if (!title || !dateString) {
    return { error: "Title and Date are required." };
  }

  const date = new Date(dateString);

  await addEvent({ date, description, title });

  revalidatePath("/");
}

export async function deleteEventAction(eventId: number) {
  await deleteEvent(eventId);
  revalidatePath("/");
}
