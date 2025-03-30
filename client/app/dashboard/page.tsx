"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalQueries: 0,
    activeConnections: 0,
    savedChats: 0,
    queriesThisWeek: 0,
    activeConnectionsThisWeek: 0,
    savedChatsThisWeek: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [recentConnections, setRecentConnections] = useState<any[]>([])
  const [recentChats, setRecentChats] = useState<any[]>([])
  const [isLoadingConns, setIsLoadingConns] = useState(true)
  const [isLoadingChats, setIsLoadingChats] = useState(true)

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          return
        }
        const response = await fetch("http://localhost:3001/api/dashboard/stats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch dashboard stats")
        }
        setStats(data)
      } catch (error: any) {
        console.error("Error fetching stats:", error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Fetch three most recent connections
  useEffect(() => {
    const fetchRecentConnections = async () => {
      setIsLoadingConns(true)
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) return
        const response = await fetch("http://localhost:3001/api/dashboard/recent-connections", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const contentType = response.headers.get("Content-Type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("Expected JSON but got:", text)
          throw new Error("Invalid JSON response from recent connections endpoint")
        }
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to load recent connections")
        }
        // Display only the three most recent connections
        const threeConnections = data.connections.slice(0, 3)
        setRecentConnections(threeConnections)
      } catch (error: any) {
        console.error("Error loading recent connections:", error.message)
      } finally {
        setIsLoadingConns(false)
      }
    }
    fetchRecentConnections()
  }, [])

  // Fetch recent chats from API
  useEffect(() => {
    const fetchRecentChats = async () => {
      setIsLoadingChats(true)
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) return
        const response = await fetch("http://localhost:3001/api/dashboard/recent-chats", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const contentType = response.headers.get("Content-Type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("Expected JSON but got:", text)
          throw new Error("Invalid JSON response from recent chats endpoint")
        }
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to load recent chats")
        }
        // Assuming the API returns a sessions array containing recent chats
        setRecentChats(data.sessions)
      } catch (error: any) {
        console.error("Error loading recent chats:", error.message)
      } finally {
        setIsLoadingChats(false)
      }
    }
    fetchRecentChats()
  }, [])

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Manage your database connections and chat history.">
        <Link href="/dashboard/connections/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Connection
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQueries}</div>
            <p className="text-xs text-muted-foreground">This week: +{stats.queriesThisWeek} queries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConnections}</div>
            <p className="text-xs text-muted-foreground">This week: +{stats.activeConnectionsThisWeek} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Chats</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.savedChats}</div>
            <p className="text-xs text-muted-foreground">This week: +{stats.savedChatsThisWeek} saved</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Connections */}
        <Card className="col-span-1 md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Connections</CardTitle>
            <CardDescription>Your recently used database connections.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingConns ? (
              <p>Loading recent connections...</p>
            ) : recentConnections.length === 0 ? (
              <p className="text-muted-foreground">No recent connections found.</p>
            ) : (
              <div className="space-y-4">
                {recentConnections.map((conn) => (
                  <div key={conn.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-md font-medium">{conn.name}</p>
                        {/* Display the type under the connection name */}
                        <p className="text-sm text-muted-foreground">{conn.type}</p>
                      </div>
                    </div>
                    <Link href={`/dashboard/chat/${conn.id}`}>
                      <Button variant="outline" size="sm">
                        Chat
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Recent Chats */}
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Chats</CardTitle>
            <CardDescription>Your recent database conversations.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingChats ? (
              <p>Loading recent chats...</p>
            ) : recentChats.length === 0 ? (
              <p className="text-muted-foreground">No recent chats found.</p>
            ) : (
              <div className="space-y-4">
                {recentChats.map((session) => (
                  <div key={session.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="text-sm font-medium">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                      {session.updated_at 
  ? new Date(session.updated_at.replace(" ", "T")).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  : "N/A"}
                      </p>
                    </div>
                    <Link href={`/dashboard/chat/sess-${session.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
