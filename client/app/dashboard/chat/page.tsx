import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, MessageSquare, Plus } from "lucide-react"
import Link from "next/link"

export default function ChatPage() {
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

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Monthly Sales Analysis</CardTitle>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <span>2 days ago</span>
              </div>
            </div>
            <CardDescription className="flex items-center">
              <Database className="h-3 w-3 mr-1" />
              Production Database
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground line-clamp-3">
              What were our top selling products last month? How do they compare to the previous month?
            </p>
          </CardContent>
          <CardFooter className="pt-2">
            <Link href="/dashboard/chat/1" className="w-full">
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Continue Chat
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Customer Demographics</CardTitle>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <span>5 days ago</span>
              </div>
            </div>
            <CardDescription className="flex items-center">
              <Database className="h-3 w-3 mr-1" />
              Production Database
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground line-clamp-3">
              Can you break down our customer base by age group and location? Which demographic spends the most?
            </p>
          </CardContent>
          <CardFooter className="pt-2">
            <Link href="/dashboard/chat/2" className="w-full">
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Continue Chat
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Inventory Status</CardTitle>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <span>1 week ago</span>
              </div>
            </div>
            <CardDescription className="flex items-center">
              <Database className="h-3 w-3 mr-1" />
              Development Database
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground line-clamp-3">
              Show me items that are low in stock. Which products have the highest turnover rate?
            </p>
          </CardContent>
          <CardFooter className="pt-2">
            <Link href="/dashboard/chat/3" className="w-full">
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Continue Chat
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}

