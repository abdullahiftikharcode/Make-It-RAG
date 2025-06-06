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
import apiConfig from "@/config/api"

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
        const response = await fetch(apiConfig.getApiUrl("/api/chat-sessions"), {
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

  // Filter sessions based on search input
  const filteredSessions = sessions.filter((session) =>
    session.title?.toLowerCase().includes(search.toLowerCase())
  )

    return (
    <DashboardShell>
      <DashboardHeader
        heading="Chat History"
        text="View and manage your past chat sessions."
      />
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chat sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          ) : filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  {search ? "No matching chat sessions found." : "No chat sessions yet."}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>{session.title || "Untitled Chat"}</CardTitle>
                    <CardDescription>
                      {new Date(session.created_at).toLocaleDateString()} •{" "}
                      {session.message_count} messages
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/chat/${session.id}`}>
                      <Button variant="secondary" size="sm">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        View Chat
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
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
                          const response = await fetch(
                            apiConfig.getApiUrl(`/api/chat-sessions/${session.id}`),
                            {
                              method: "DELETE",
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          )
      if (!response.ok) {
                            throw new Error("Failed to delete chat session")
      }
                          setSessions((prev) =>
                            prev.filter((s) => s.id !== session.id)
                          )
      toast({
                            title: "Success",
        description: "Chat session deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
                            description:
                              error.message || "Failed to delete chat session",
        variant: "destructive",
      })
    }
                      }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              </Card>
            ))
          )}
                </div>
      </div>
    </DashboardShell>
  )
}
