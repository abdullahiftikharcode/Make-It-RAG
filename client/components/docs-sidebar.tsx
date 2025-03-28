"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function DocsSidebar() {
  const searchParams = useSearchParams()
  const section = searchParams.get("section")
  const [activeSection, setActiveSection] = useState<string>(section || "overview")
  const isMobile = useMobile()

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
    <div className="w-full pr-4">
      <SidebarProvider defaultOpen={!isMobile}>
        <Sidebar variant="floating" collapsible={isMobile ? "offcanvas" : "icon"} className="relative h-auto">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Documentation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeSection === "overview"}
                      onClick={() => scrollToSection("overview")}
                    >
                      Overview
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeSection === "prerequisites"}
                      onClick={() => scrollToSection("prerequisites")}
                    >
                      Prerequisites
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeSection === "connecting"}
                      onClick={() => scrollToSection("connecting")}
                    >
                      Connecting Your Database
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeSection === "chat-interface"}
                      onClick={() => scrollToSection("chat-interface")}
                    >
                      Using the Chat Interface
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeSection === "security"}
                      onClick={() => scrollToSection("security")}
                    >
                      Security & Privacy
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeSection === "troubleshooting"}
                      onClick={() => scrollToSection("troubleshooting")}
                    >
                      Troubleshooting
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeSection === "faq"} onClick={() => scrollToSection("faq")}>
                      FAQ
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeSection === "help"} onClick={() => scrollToSection("help")}>
                      Getting Help
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeSection === "resources"}
                      onClick={() => scrollToSection("resources")}
                    >
                      Additional Resources
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  )
}

