import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Edit, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function ConnectionsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Database Connections" text="Manage your database connections.">
        <Link href="/dashboard/connections/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Connection
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Connection Cards */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Production Database</CardTitle>
              <div className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-600">Connected</div>
            </div>
            <CardDescription>PostgreSQL • Last used 2 hours ago</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                postgresql://user:***@host:5432/db
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground">Tables:</span>
                <span className="ml-1 font-medium">24</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-1 font-medium">1.2 GB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Queries:</span>
                <span className="ml-1 font-medium">156</span>
              </div>
              <div>
                <span className="text-muted-foreground">Version:</span>
                <span className="ml-1 font-medium">14.5</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-3">
            <Link href="/dashboard/chat/1">
              <Button variant="outline" size="sm">
                Chat
              </Button>
            </Link>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Development Database</CardTitle>
              <div className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-600">Connected</div>
            </div>
            <CardDescription>MySQL • Last used 1 day ago</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                postgresql://user:***@host:5432/db
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground">Tables:</span>
                <span className="ml-1 font-medium">24</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-1 font-medium">1.2 GB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Queries:</span>
                <span className="ml-1 font-medium">156</span>
              </div>
              <div>
                <span className="text-muted-foreground">Version:</span>
                <span className="ml-1 font-medium">14.5</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-3">
            <Link href="/dashboard/chat/2">
              <Button variant="outline" size="sm">
                Chat
              </Button>
            </Link>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Analytics Database</CardTitle>
              <div className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-600">
                Disconnected
              </div>
            </div>
            <CardDescription>SQL Server • Last used 5 days ago</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                postgresql://user:***@host:5432/db
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground">Tables:</span>
                <span className="ml-1 font-medium">24</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-1 font-medium">1.2 GB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Queries:</span>
                <span className="ml-1 font-medium">156</span>
              </div>
              <div>
                <span className="text-muted-foreground">Version:</span>
                <span className="ml-1 font-medium">14.5</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-3">
            <Button variant="outline" size="sm">
              Connect
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}

