import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header with menu button */}
      <header className="sticky top-0 z-40 border-b bg-background md:hidden">
        <div className="flex h-14 items-center px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[280px] pr-0">
              <DashboardNav />
            </SheetContent>
          </Sheet>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-lg font-semibold">SQL Chat Assistant</h1>
          </div>
          <ModeToggle />
        </div>
      </header>

      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Desktop sidebar - hidden on mobile */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <DashboardNav />
        </aside>
        {/* Main content area */}
        <main className="flex w-full flex-col overflow-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

