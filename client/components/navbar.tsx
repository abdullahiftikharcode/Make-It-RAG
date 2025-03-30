"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { Menu, Home } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const isHomePage = pathname === "/"

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleNavigation = (sectionId: string) => {
    if (!isHomePage) {
      // If we're not on the home page, navigate to home page first
      router.push('/')
      // Use a longer timeout to ensure the page has loaded
      setTimeout(() => {
        scrollToSection(sectionId)
      }, 500)
    } else {
      // If we're already on the home page, just scroll
      scrollToSection(sectionId)
    }
  }

  // Handle hash in URL on page load
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      // Add a small delay to ensure the page has loaded
      setTimeout(() => {
        scrollToSection(hash)
      }, 100)
    }
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">SQL Chat</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium flex items-center gap-1">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <button 
            onClick={() => handleNavigation('features')} 
            className="text-sm font-medium"
          >
            Features
          </button>
          <button 
            onClick={() => handleNavigation('pricing')} 
            className="text-sm font-medium"
          >
            Pricing
          </button>
          <Link href="/docs" className="text-sm font-medium">
            Documentation
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 py-4">
                <Link href="/" className="text-sm font-medium flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <button 
                  onClick={() => handleNavigation('features')} 
                  className="text-sm font-medium text-left"
                >
                  Features
                </button>
                <button 
                  onClick={() => handleNavigation('pricing')} 
                  className="text-sm font-medium text-left"
                >
                  Pricing
                </button>
                <Link href="/docs" className="text-sm font-medium">
                  Documentation
                </Link>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <ModeToggle />
                </div>
                <Separator className="my-2" />
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

