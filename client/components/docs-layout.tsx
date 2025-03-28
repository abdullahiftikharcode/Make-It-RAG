import type React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

interface DocsLayoutProps {
  children: React.ReactNode
}

export function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-6 md:py-12 max-w-7xl">{children}</main>
      <Footer />
    </div>
  )
}

