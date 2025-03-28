import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { NewConnectionForm } from "@/components/new-connection-form"

export default function NewConnectionPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="New Database Connection" text="Connect to your database to start chatting." />
      <div className="grid gap-8">
        <NewConnectionForm />
      </div>
    </DashboardShell>
  )
}

