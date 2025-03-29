"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, MessageSquare, Plus } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

interface ChatSession {
  id: string
  title: string
  connectionName: string
  firstQuery: string
  messageCount: number
  createdAt: string
  updatedAt: string
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          toast({
            title: "Error",
            description: "Please log in to continue.",
            variant: "destructive",
          })
          return
        }

        const response = await fetch("http://localhost:3001/api/chat-sessions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to load chat sessions")
        }

        // Transform sessions data
        const transformedSessions = data.sessions.map((session: any) => ({
          id: session.id,
          title: session.title,
          connectionName: session.connection_name,
          firstQuery: session.first_query,
          messageCount: session.message_count,
          createdAt: session.created_at,
          updatedAt: session.updated_at,
        }))

        setSessions(transformedSessions)
      } catch (error) {
        console.error("Error loading sessions:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load chat sessions",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [toast])

  return (
    <DashboardShell>
      <DashboardHeader heading="Chat" text="Start a new chat or continue an existing conversation.">
        <Link href="/dashboard/chat/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/chat/new" className="block">
          <Card className="h-full border-dashed bg-muted/50 hover:bg-muted transition-colors">
            <CardContent className="flex flex-col items-center justify-center h-full py-10">
              <div className="rounded-full bg-background p-6 mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-1">Start New Chat</h3>
              <p className="text-sm text-muted-foreground text-center">
                Ask questions about your database in natural language
              </p>
            </CardContent>
          </Card>
        </Link>

        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 2 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="relative">
              <CardHeader className="pb-2">
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded mt-2" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="h-12 bg-muted animate-pulse rounded" />
              </CardContent>
              <CardFooter className="pt-2">
                <div className="h-9 w-full bg-muted animate-pulse rounded" />
              </CardFooter>
            </Card>
          ))
        ) : sessions.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="flex flex-col items-center justify-center h-full py-10">
              <p className="text-sm text-muted-foreground text-center">
                No chat sessions found. Start a new chat to begin.
              </p>
            </CardContent>
          </Card>
        ) : (
          // Display actual chat sessions
          sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">{session.title}</CardTitle>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <CardDescription className="flex items-center">
                  <Database className="h-3 w-3 mr-1" />
                  {session.connectionName}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {session.firstQuery}
                </p>
              </CardContent>
              <CardFooter className="pt-2">
                {/* Prefix the session id with "sess-" to indicate that this is a session id */}
                <Link href={`/dashboard/chat/sess-${session.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Continue Chat ({session.messageCount} messages)
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </DashboardShell>
  )
}
