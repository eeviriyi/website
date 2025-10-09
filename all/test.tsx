"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Search,
  Plus,
  MessageSquare,
  History,
  BarChart3,
  Settings,
  ChevronDown,
  Send,
  Paperclip,
  Mic,
  BookOpen,
} from "lucide-react"

export default function ChatApp() {
  const [message, setMessage] = useState("")
  const [expandedSections, setExpandedSections] = useState({
    saved: true,
    today: false,
    yesterday: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const chatHistory = ["New Design Idea for W", "Smoothie Recipe Sugg", "Tips for Dail Productiv"]

  const actionCards = [
    { title: "Write Copy", icon: "📝" },
    { title: "Write Copy", icon: "📝" },
    { title: "Write Copy", icon: "📝" },
    { title: "Write Copy", icon: "📝" },
  ]

  return (
    <div className="flex h-screen bg-background dark">
      {/* Sidebar */}
      <div className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-sidebar-primary-foreground rounded-sm"></div>
            </div>
            <span className="text-sidebar-foreground font-semibold">Board</span>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sidebar-foreground/60" />
            <Input
              placeholder="Chat"
              className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60"
            />
          </div>

          {/* New Chat Button */}
          <Button className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>

          {/* Saved Section */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection("saved")}
              className="flex items-center justify-between w-full text-sidebar-foreground/80 hover:text-sidebar-foreground text-sm"
            >
              <span>⭐ Saved</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.saved ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.saved && (
              <div className="space-y-1 ml-4">
                {chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sidebar-foreground/70 text-sm py-1 hover:text-sidebar-foreground cursor-pointer"
                  >
                    <div className="w-1 h-1 bg-sidebar-foreground/40 rounded-full"></div>
                    {chat}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today Section */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection("today")}
              className="flex items-center justify-between w-full text-sidebar-foreground/80 hover:text-sidebar-foreground text-sm"
            >
              <span>Today</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.today ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Yesterday Section */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection("yesterday")}
              className="flex items-center justify-between w-full text-sidebar-foreground/80 hover:text-sidebar-foreground text-sm"
            >
              <span>Yesterday</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${expandedSections.yesterday ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex flex-col gap-2">
            <Button variant="ghost" className="justify-start text-sidebar-foreground hover:bg-sidebar-accent">
              <MessageSquare className="w-4 h-4 mr-3" />
              Chat
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <History className="w-4 h-4 mr-3" />
              History
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Analytics
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Welcome Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Welcome to Script</h1>
            <p className="text-muted-foreground text-lg text-pretty">
              Get started by Script a task and chat can do the rest. Not sure where to start?
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-2 gap-4 mb-12 w-full max-w-2xl">
            {actionCards.map((card, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow cursor-pointer border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary">📝</span>
                    </div>
                    <span className="font-medium text-card-foreground">{card.title}</span>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full w-8 h-8 p-0 bg-transparent">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="border-t border-border p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Summarize the latest"
                className="pr-12 py-3 text-base bg-input border-border"
              />
              <Button
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Input Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Message
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Prompts
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">20/3,000</div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              Script may generate inaccurate information about people, places, or facts.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
