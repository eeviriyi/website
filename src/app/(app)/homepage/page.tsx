import { generateId } from "ai";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Chat from "@/components/homepage/Chat.tsx";
import ChatSkeleton from "@/components/homepage/ChatSkeleton.tsx";
import { EventCalendar } from "@/components/homepage/EventCalendar.tsx";
import Poem from "@/components/homepage/Poem.tsx";
import Settings from "@/components/homepage/Settings.tsx";
import { loadChat } from "@/lib/components/chat/repository.ts";
import { calculateTwoWeekRange, getEventsByDateRange } from "@/lib/components/eventCalendar/repository.ts";

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const existingId = params.id as string | undefined;

  if (!existingId) {
    redirect(`/homepage?id=${generateId()}`);
  }

  const { start, end } = calculateTwoWeekRange();
  const [initialMessages, events] = await Promise.all([loadChat(existingId), getEventsByDateRange(start, end)]);

  return (
    <div className="flex flex-1 flex-col gap-5">
      <Settings />
      <Suspense fallback={<ChatSkeleton />}>
        <Chat id={existingId} initialMessages={initialMessages} />
      </Suspense>
      <Poem />
      <EventCalendar events={events} range={{ end, start }} />
    </div>
  );
}
