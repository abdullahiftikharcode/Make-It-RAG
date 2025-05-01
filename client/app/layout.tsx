import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeProviderClient } from "@/components/theme-provider-client"
// import { Toaster } from "@/components/ui/toaster"
import { NotificationContainer } from "@/components/ui/notification-bubble"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import PageTransition from "@/components/page-transition"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SQL Chat Assistant",
  description: "Chat with your database using natural language",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} transition-theme`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeProviderClient>
            <PageTransition>
              {children}
            </PageTransition>
            {/* <Toaster /> */}
            <NotificationContainer />
          </ThemeProviderClient>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'