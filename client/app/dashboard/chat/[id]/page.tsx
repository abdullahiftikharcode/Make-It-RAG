import { ChatInterface } from "@/components/chat-interface"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default function ChatPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <DashboardHeader heading="Database Chat" text="Ask questions about your database in natural language." />
      <ChatInterface connectionId={params.id} />
    </DashboardShell>
  )
}

