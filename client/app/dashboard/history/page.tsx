import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquare, Search, Trash2 } from "lucide-react"
import Link from "next/link"

export default function HistoryPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Chat History" text="View and manage your previous database conversations." />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search chat history..." className="pl-8 w-full" />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          Clear Filters
        </Button>
      </div>
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((id) => (
          <Card key={id}>
            <CardHeader className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-start justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle className="text-base">
                  {id === 1 && "Monthly Sales Analysis"}
                  {id === 2 && "Customer Demographics"}
                  {id === 3 && "Inventory Status"}
                  {id === 4 && "Employee Performance"}
                  {id === 5 && "Marketing Campaign Results"}
                </CardTitle>
                <CardDescription>
                  {new Date(2023, 11, 30 - id * 2).toLocaleDateString()} · {id * 3 + 2} messages
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Link href={`/dashboard/chat/${id}`}>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Continue
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-sm text-muted-foreground line-clamp-2">
                {id === 1 &&
                  "What were our top selling products last month? How do they compare to the previous month?"}
                {id === 2 &&
                  "Can you break down our customer base by age group and location? Which demographic spends the most?"}
                {id === 3 && "Show me items that are low in stock. Which products have the highest turnover rate?"}
                {id === 4 &&
                  "Who are our top performing sales representatives this quarter? What's their average deal size?"}
                {id === 5 &&
                  "How effective was our last email campaign? What was the conversion rate compared to social media?"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  )
}

