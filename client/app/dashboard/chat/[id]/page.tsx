import { Button } from "@/components/ui/button"
import { ChatInterface } from "@/components/chat-interface"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Database, Plus } from "lucide-react"
import Link from "next/link"

export default async function ChatPage({ params }: { params: { id: string } }) {
  // Await the params before using them
  const resolvedParams = await Promise.resolve(params)
  const rawId = resolvedParams.id

  // If it's "new", start a new chat.
  if (rawId === "new") {
    return (
      <DashboardShell>
        <DashboardHeader heading="New Chat" text="Start a new conversation with your database." />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/50 p-10 text-center">
            <Database className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connect to a Database</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Choose a database connection to start chatting with your data in natural language.
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" className="gap-2">
                  <span>Connections</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/connections/new" className="flex items-center gap-2 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    <span>New Connection</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/connections" className="flex items-center gap-2 cursor-pointer">
                    <Database className="h-4 w-4" />
                    <span>Use Existing Connections</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ChatInterface />
        </div>
      </DashboardShell>
    )
  }

  // Distinguish based on a prefix keyword
  let isSessionId = false
  let cleanId = rawId

  // If the id starts with "sess-", treat it as a session id.
  if (rawId.startsWith("sess-")) {
    isSessionId = true
    cleanId = rawId.replace("sess-", "")
  }
  // If the id starts with "conn-", treat it as a connection id.
  else if (rawId.startsWith("conn-")) {
    cleanId = rawId.replace("conn-", "")
  }
  // Otherwise, assume it's a connection id by default.

  return (
    <DashboardShell>
      <DashboardHeader heading="Database Chat" text="Ask questions about your database in natural language." />
      {isSessionId ? (
        <ChatInterface connectionId={cleanId} sessionId={cleanId} />
      ) : (
        <ChatInterface connectionId={cleanId} />
      )}
    </DashboardShell>
  )
}

