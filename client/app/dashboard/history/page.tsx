"use client"

import React, { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquare, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function HistoryPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true)
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
        const response = await fetch("http://localhost:3001/api/chats", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch chat sessions")
        }
        setSessions(data.sessions)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [toast])

  // Filter sessions based on the search term
  const filteredSessions = sessions.filter((session) => {
    const lowerSearch = search.toLowerCase();
    const connectionName = session.connectionName || "";
    const firstQuery = session.firstQuery || "";
    return (
      connectionName.toLowerCase().includes(lowerSearch) ||
      firstQuery.toLowerCase().includes(lowerSearch)
    );
  });

  // Delete a chat session using its sessionId
  const handleDelete = async (sessionId: string) => {
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
      const response = await fetch(`http://localhost:3001/api/chats/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete chat session")
      }
      // Remove the deleted session from state
      setSessions(prev => prev.filter(session => session.sessionId !== sessionId))
      toast({
        title: "Deleted",
        description: "Chat session deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Chat History"
        text="View and manage your previous database conversations."
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chat history..."
            className="pl-8 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => setSearch("")}>
          Clear Filters
        </Button>
      </div>
      <div className="grid gap-4">
        {isLoading && <p>Loading...</p>}
        {!isLoading && filteredSessions.length === 0 && (
          <p className="text-center text-muted-foreground">No chat sessions found.</p>
        )}
        {!isLoading &&
          filteredSessions.map((session, index) => (
            <Card key={session.sessionId || `session-${index}`}>
              <CardHeader className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-start justify-between space-y-2 sm:space-y-0">
                <div>
                  {/* Display the database connection name instead of the session title */}
                  <CardTitle className="text-base">{session.connectionName}</CardTitle>
                  <CardDescription>
                    {new Date(session.created_at).toLocaleDateString()} · {session.messageCount} messages
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/dashboard/chat/sess-${session.sessionId}`}>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(session.sessionId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {session.firstQuery}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </DashboardShell>
  )
}
