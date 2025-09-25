import type { UIMessage } from "ai";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import type { Locale } from "@/i18n/locale";
import { db } from "@/lib/db/db";
import { historys } from "@/lib/db/schema/historys";

const initialMessagesEN: UIMessage[] = [
  {
    id: "0123456789101112",
    parts: [
      {
        state: "done",
        text: "Hey! I'm an assistant created by Eeviriyi, and I know all about him and this site. Have a question? Just ask!",
        type: "text",
      },
    ],
    role: "assistant",
  },
  {
    id: "0123456789101113",
    parts: [
      {
        state: "done",
        text: "And here's a fun secret: tell me, 'Notify Eeviriyi that I'm on his website!' I'll quietly send him a message, and then he'll have to guess who you are. Are you ready to challenge him?",
        type: "text",
      },
    ],
    role: "assistant",
  },
];

const initialMessagesCN: UIMessage[] = [
  {
    id: "0123456789101112",
    parts: [
      {
        state: "done",
        text: "嗨！我是 Eeviriyi 的小助手，从他那里学到了超多关于 Eeviriyi 和这个网站的知识，有任何问题都可以问我哦！",
        type: "text",
      },
    ],
    role: "assistant",
  },
  {
    id: "0123456789101113",
    parts: [
      {
        state: "done",
        text: "顺便告诉你一个小秘密：你可以对我说‘通知 Eeviriyi 我在他的网站上！’，我会在后台悄悄告诉他。他收到后，就会开始猜你是谁，快来挑战他吧！",
        type: "text",
      },
    ],
    role: "assistant",
  },
];

export async function getChatList(): Promise<{ id: string; firstMessage: string }[]> {
  const chatList = await db
    .select({
      firstMessage: historys.firstMessage,
      id: historys.id,
    })
    .from(historys);

  return chatList;
}

export async function saveFirstMessage(id: string, firstMessage: string): Promise<void> {
  await db.update(historys).set({ firstMessage: firstMessage }).where(eq(historys.id, id)).returning();
}

export async function loadChat(id: string): Promise<UIMessage[]> {
  const cookiesStore = await cookies();
  const locale = cookiesStore.get("NEXT_LOCALE")?.value || "en";
  const message = await db.select().from(historys).where(eq(historys.id, id));
  const chatMessages = message[0]?.messages as UIMessage[];
  return chatMessages || (locale === "en" ? initialMessagesEN : initialMessagesCN);
}

export async function saveChat({ id, messages }: { id: string; messages: UIMessage[] }): Promise<void> {
  await db
    .insert(historys)
    .values({
      id: id,
      messages: messages,
    })
    .onConflictDoUpdate({
      set: {
        messages: messages,
      },
      target: historys.id,
    });
}

export async function deleteChat(id: string): Promise<void> {
  await db.delete(historys).where(eq(historys.id, id)).returning();
}
