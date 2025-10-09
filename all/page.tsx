"use client";

import { useChat } from "@ai-sdk/react";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  History,
  MessageSquare,
  Mic,
  MoonIcon,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings,
  SunIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Conversation {
  id: string;
  title: string;
  messages: Array<{ parts?: Array<{ type: string; text?: string }> }>;
  createdAt: Date;
}

// Helper function to extract text from message parts
const getMessageText = (message: { parts?: Array<{ type: string; text?: string }> }) => {
  if (!message?.parts) return "";
  const textPart = message.parts.find((part) => part.type === "text");
  return textPart?.text || "";
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    saved: false,
    today: false,
    yesterday: false,
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Using useChat for chat functionality
  const { messages, sendMessage, status } = useChat();

  // Manual input state since new useChat doesn't provide input helpers
  const [input, setInput] = useState("");

  const isLoading = status === "streaming" || status === "submitted";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage({ parts: [{ text: input, type: "text" }], role: "user" });
    setInput("");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Auto-save conversation when messages change
    if (messages.length > 0 && currentConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, messages: [...messages], title: getMessageText(messages[0])?.slice(0, 50) + "..." || "New Chat" }
            : conv,
        ),
      );
    }
  }, [messages, currentConversationId]);

  if (!mounted) {
    return null;
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const createNewChat = () => {
    const newConversation: Conversation = {
      createdAt: new Date(),
      id: Date.now().toString(),
      messages: [],
      title: "New Chat",
    };
    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  const selectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    // Note: In a real app, you'd need to load the conversation messages
    // For now, we'll keep using the current useChat messages
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const chatHistory = ["New Design Idea for Web App", "Smoothie Recipe Suggestion", "Tips for Daily Productivity"];

  const actionCards = [
    { icon: "📝", title: "Writing" },
    { icon: "🔍", title: "Research & Analysis" },
    { icon: "💻", title: "Programming" },
    { icon: "🎓", title: "Learning Skills" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="flex w-72 flex-col border-sidebar-border border-r bg-sidebar">
        {/* Logo */}
        <div className="flex items-center gap-2 border-sidebar-border border-b p-4">
          <Avatar>
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>EE</AvatarFallback>
          </Avatar>

          <div className="flex gap-1">
            <span className="font-semibold text-sidebar-foreground">Eeviri</span>
            <span className="text-sidebar-foreground">RAG</span>
          </div>

          <div className="ml-auto flex items-center">
            <Button
              aria-label="Toggle theme"
              className="flex size-4 items-center justify-center"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              size="icon"
              variant="secondary"
            >
              {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 space-y-4 p-4">
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-sidebar-foreground/60" />
            <Input
              className="border-sidebar-border bg-sidebar-accent pl-10 text-sidebar-foreground placeholder:text-sidebar-foreground/60"
              placeholder="Search for history"
            />
          </div>

          {/* New Chat Button */}
          <Button className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" onClick={createNewChat}>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>

          {/* Saved Section */}
          <div className="space-y-2">
            <button
              className="flex w-full items-center justify-between text-sidebar-foreground/80 text-sm hover:text-sidebar-foreground"
              onClick={() => toggleSection("saved")}
              type="button"
            >
              <span>Saved</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.saved ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.saved && (
              <div className="space-y-1">
                {chatHistory.map((chat) => (
                  <button
                    className="flex cursor-pointer items-center gap-2 p-4 py-1 text-sidebar-foreground/70 text-sm hover:text-sidebar-foreground"
                    key={`saved-${chat.replace(/\s+/g, "-")}`}
                    type="button"
                  >
                    <div className="h-1 w-1 rounded-full bg-sidebar-foreground/40"></div>
                    <span className="truncate">{chat}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Today Section */}
          {conversations.length > 0 && (
            <div className="space-y-2">
              <button
                className="flex w-full items-center justify-between text-sidebar-foreground/80 text-sm hover:text-sidebar-foreground"
                onClick={() => toggleSection("today")}
                type="button"
              >
                <span>Today</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.today ? "rotate-180" : ""}`} />
              </button>
              {expandedSections.today && (
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <button
                      className={`flex w-full cursor-pointer items-center gap-2 p-4 py-1 text-left text-sidebar-foreground/70 text-sm hover:text-sidebar-foreground ${
                        currentConversationId === conversation.id
                          ? "bg-sidebar-accent text-sidebar-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`}
                      key={conversation.id}
                      onClick={() => selectConversation(conversation.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectConversation(conversation.id);
                        }
                      }}
                      type="button"
                    >
                      <div className="h-1 w-1 rounded-full bg-sidebar-foreground/40"></div>
                      <span className="truncate">{conversation.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="border-sidebar-border border-t p-4">
          <div className="flex flex-col gap-2">
            <Button className="justify-start text-sidebar-foreground hover:bg-sidebar-accent" variant="ghost">
              <MessageSquare className="mr-3 h-4 w-4" />
              Chat
            </Button>
            <Button className="justify-start text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground" variant="ghost">
              <History className="mr-3 h-4 w-4" />
              History
            </Button>
            <Button className="justify-start text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground" variant="ghost">
              <BarChart3 className="mr-3 h-4 w-4" />
              Analytics
            </Button>
            <Button className="justify-start text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground" variant="ghost">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {messages.length > 0 ? (
          // Chat Interface
          <>
            {/* Chat Header */}
            <div className="border-border border-b p-4">
              <h2 className="font-semibold text-foreground">Chat</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {messages.map((message) => (
                <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={message.id}>
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{getMessageText(message) || "No content available"}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl rounded-lg bg-muted p-4">
                    <p className="text-muted-foreground text-sm">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // Welcome Section
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center p-8">
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-balance font-bold text-4xl text-foreground">Welcome to Eeviri RAG</h1>
              <p className="text-pretty text-lg text-muted-foreground">
                Get started by scripting a task and chat can do the rest. Not sure where to start?
              </p>
            </div>

            {/* Action Cards */}
            <div className="mb-12 grid w-full max-w-2xl grid-cols-2 gap-4">
              {actionCards.map((card) => (
                <Card className="cursor-pointer border-border bg-card p-6 transition-shadow hover:shadow-md" key={`action-${card.title}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <span className="text-primary">{card.icon}</span>
                      </div>
                      <span className="font-medium text-card-foreground">{card.title}</span>
                    </div>
                    <Button className="h-8 w-8 rounded-full bg-transparent p-0" size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="border-border border-t p-6">
          <div className="mx-auto max-w-4xl">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <textarea
                  className="min-h-32 w-full resize-none rounded-md border border-border bg-input py-4 pr-16 pl-4 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  disabled={isLoading}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything..."
                  value={input}
                />
                <Button
                  className="absolute right-4 bottom-4 h-8 w-8 transform rounded-full p-0"
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  type="submit"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Input Controls */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <Button className="text-muted-foreground hover:text-foreground" size="sm" variant="ghost">
                  <Paperclip className="h-4 w-4" />
                  Attach
                </Button>
                <Button className="text-muted-foreground hover:text-foreground" size="sm" variant="ghost">
                  <Mic className="h-4 w-4" />
                  Voice Message
                </Button>
                <Button className="text-muted-foreground hover:text-foreground" size="sm" variant="ghost">
                  <BookOpen className="h-4 w-4" />
                  Browse Prompts
                </Button>
              </div>
              <div className="text-muted-foreground text-sm">{input.length}/3,000</div>
            </div>

            {/* Disclaimer */}
            <p className="mt-4 text-center text-muted-foreground text-xs">
              Eeviri RAG may generate inaccurate information about people, places, or facts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
