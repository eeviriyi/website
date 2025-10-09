"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Chat({ id, initialMessages }: { id?: string | undefined; initialMessages?: UIMessage[] } = {}) {
  const t = useTranslations("Chat");
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { sendMessage, messages } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest({ messages, id }) {
        return { body: { id, message: messages[messages.length - 1] } };
      },
    }),
  });

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    };
    scrollToBottom();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const max = 240; // px
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, max);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  };

  return (
    <div className="w-full border bg-card text-card-foreground">
      <div className="flex items-center gap-2 p-4">
        <Avatar className="size-10">
          <AvatarImage src="avatar.png" />
          <AvatarFallback>E</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="font-medium">Eeviriyi</p>
          <p className="text-muted-foreground text-xs">eeviriyi@outlook.com</p>
        </div>
      </div>
      <div className="max-h-120 space-y-4 overflow-y-auto scroll-smooth p-4 pt-0" ref={scrollContainerRef}>
        {messages.map((message) => (
          <div
            className={`flex max-w-[75%] flex-col whitespace-pre-wrap break-words ${message.role === "user" ? "ml-auto items-end" : "items-start"}`}
            key={message.id}
          >
            {message.parts.map((part, index) => {
              switch (part.type) {
                case "text":
                  return (
                    <p
                      className={`px-3 py-2 leading-relaxed ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-left text-secondary-foreground"}`}
                      key={`${message.id}-${index}`}
                    >
                      {part.text}
                    </p>
                  );
                case "tool-sendNotification":
                  return (
                    <div className="mb-2 max-w-[125%] overflow-x-auto bg-muted p-2" key={`${message.id}-${index}`}>
                      <p>
                        Call{part.state === "output-available" ? "ed" : "ing"} tool: {part.type}
                      </p>
                      <pre className="p-2">{JSON.stringify(part.input, null, 2)}</pre>
                    </div>
                  );
                case "tool-getInformation":
                  return (
                    <div className="mb-2 max-w-[125%] overflow-x-auto bg-muted p-2" key={`${message.id}-${index}`}>
                      <p>
                        Call{part.state === "output-available" ? "ed" : "ing"} tool: {part.type}
                      </p>
                      <pre className="p-2">{JSON.stringify(part.input, null, 2)}</pre>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
        ))}
      </div>

      <form className="border-border border-t" onSubmit={handleSubmit}>
        <div className="flex items-center">
          <textarea
            className="max-h-20 flex-1 resize-none overflow-y-auto bg-background px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
            onChange={(e) => setInput(e.target.value)}
            onInput={handleTextareaInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder={t("inputPlaceholder")}
            rows={1}
            value={input}
          />
          <button
            className="inline-flex items-center justify-center gap-1 self-stretch bg-primary px-5 py-2 text-primary-foreground text-sm hover:opacity-90"
            type="submit"
          >
            <p>{t("send")}</p>
          </button>
        </div>
      </form>
    </div>
  );
}
