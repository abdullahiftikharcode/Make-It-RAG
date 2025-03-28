"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Database, History, Home, MessageSquare, Settings, User } from "lucide-react"
import { LogoutDialog } from "./logout-dialog"
import { ModeToggle } from "./mode-toggle"
import { Separator } from "@/components/ui/separator"

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-2 p-4 h-full">
      <div className="py-2">
        <h2 className="px-4 text-lg font-semibold tracking-tight">SQL Chat Assistant</h2>
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <Link href="/dashboard">
          <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <Link href="/dashboard/connections">
          <Button
            variant={pathname?.startsWith("/dashboard/connections") ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <Database className="mr-2 h-4 w-4" />
            Connections
          </Button>
        </Link>
        <Link href="/dashboard/chat">
          <Button
            variant={pathname?.startsWith("/dashboard/chat") ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </Button>
        </Link>
        <Link href="/dashboard/history">
          <Button
            variant={pathname?.startsWith("/dashboard/history") ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
        </Link>
        <Link href="/dashboard/settings">
          <Button
            variant={pathname?.startsWith("/dashboard/settings") ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Link href="/dashboard/profile">
          <Button
            variant={pathname?.startsWith("/dashboard/profile") ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
        </Link>
      </div>
      <div className="mt-auto">
        <Separator className="my-2" />
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm font-medium">Theme</span>
          <ModeToggle />
        </div>
        <Separator className="my-2" />
        <LogoutDialog />
      </div>
    </div>
  )
}

