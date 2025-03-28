import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+10% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">+1 new connection this week</p>
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
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 saved this week</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Connections</CardTitle>
            <CardDescription>Your recently used database connections.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Production Database</p>
                    <p className="text-xs text-muted-foreground">PostgreSQL</p>
                  </div>
                </div>
                <Link href="/dashboard/chat/1">
                  <Button variant="outline" size="sm">
                    Chat
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Development Database</p>
                    <p className="text-xs text-muted-foreground">MySQL</p>
                  </div>
                </div>
                <Link href="/dashboard/chat/2">
                  <Button variant="outline" size="sm">
                    Chat
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Chats</CardTitle>
            <CardDescription>Your recent database conversations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-sm font-medium">Monthly Sales Analysis</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
                <Link href="/dashboard/history/1">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-sm font-medium">Customer Demographics</p>
                  <p className="text-xs text-muted-foreground">5 days ago</p>
                </div>
                <Link href="/dashboard/history/2">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Inventory Status</p>
                  <p className="text-xs text-muted-foreground">1 week ago</p>
                </div>
                <Link href="/dashboard/history/3">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

