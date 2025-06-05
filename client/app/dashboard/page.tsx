"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Plus } from "lucide-react"
import Link from "next/link"
import apiConfig from "@/config/api"

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
        const response = await fetch(apiConfig.getApiUrl("/api/dashboard/stats"), {
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
        const response = await fetch(apiConfig.getApiUrl("/api/dashboard/recent-connections"), {
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
        const response = await fetch(apiConfig.getApiUrl("/api/dashboard/recent-chats"), {
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
      <DashboardHeader
        heading="Dashboard"
        text="View your database connections and recent activity."
      >
        <Link href="/dashboard/connections/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Connection
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQueries}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.queriesThisWeek} this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConnections}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.activeConnectionsThisWeek} this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Chats</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.savedChats}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.savedChatsThisWeek} this week
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Connections</CardTitle>
            <CardDescription>Your recently added database connections.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingConns ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : recentConnections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent connections found.</p>
            ) : (
              <div className="space-y-4">
                {recentConnections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{connection.name}</p>
                      <p className="text-sm text-muted-foreground">{connection.type}</p>
                    </div>
                    <Link href={`/dashboard/connections/${connection.id}`}>
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
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Chats</CardTitle>
            <CardDescription>Your recent chat sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingChats ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : recentChats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent chats found.</p>
            ) : (
              <div className="space-y-4">
                {recentChats.map((chat) => (
                  <div key={chat.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{chat.title || "Untitled Chat"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(chat.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/dashboard/chat/${chat.id}`}>
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
