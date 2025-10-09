import { generateId } from "ai";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Chat from "@/components/homepage/Chat";
import ChatSkeleton from "@/components/homepage/ChatSkeleton";
import { EventCalendar } from "@/components/homepage/Event";
import Poem from "@/components/homepage/Poem";
import Settings from "@/components/homepage/Settings";
import { loadChat } from "@/lib/ai/chat-store";
import { calculateTwoWeekRange, getEventsByDateRange } from "@/lib/event/utils";

async function ChatWrapper({ id }: { id: string }) {
  const initialMessages = await loadChat(id);
  return <Chat id={id} initialMessages={initialMessages} />;
}

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const id = (params.id as string | undefined) || generateId();
  const { start, end } = calculateTwoWeekRange();
  const events = await getEventsByDateRange(start, end);

  if (!params.id) {
    redirect(`/homepage?id=${id}`);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <Settings />
      <Suspense fallback={<ChatSkeleton />}>
        <ChatWrapper id={id} />
      </Suspense>
      <Poem />
      <EventCalendar events={events} range={{ end, start }} />
    </div>
  );
}
