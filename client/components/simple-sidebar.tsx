"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SimpleNavItem {
  title: string
  href: string
  section: string
}

interface SimpleSidebarProps {
  items: SimpleNavItem[]
  className?: string
}

export function SimpleSidebar({ items, className }: SimpleSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>("overview")

  useEffect(() => {
    // Handle scroll events to update active section
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]")

      let currentSection = "overview"
      let minDistance = Number.MAX_VALUE

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const distance = Math.abs(rect.top)

        if (distance < minDistance) {
          minDistance = distance
          currentSection = section.id
        }
      })

      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
      setActiveSection(sectionId)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <nav className="flex flex-col space-y-1">
        {items.map((item) => (
          <Button
            key={item.section}
            variant={activeSection === item.section ? "secondary" : "ghost"}
            className="justify-start"
            onClick={() => scrollToSection(item.section)}
          >
            {item.title}
          </Button>
        ))}
      </nav>
    </div>
  )
}

