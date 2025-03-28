import { ChatInterface } from "@/components/chat-interface"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default async function ChatPage({ params }: { params: { id: string } }) {
  // If this is a new chat, we don't need to pass a connectionId
  const connectionId = params.id === 'new' ? undefined : params.id

  return (
    <DashboardShell>
      <DashboardHeader heading="Database Chat" text="Ask questions about your database in natural language." />
      <ChatInterface connectionId={connectionId} />
    </DashboardShell>
  )
}

