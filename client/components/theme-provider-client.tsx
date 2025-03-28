"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Add or remove the "dark" class on the html element
  useEffect(() => {
    setMounted(true)
    const root = window.document.documentElement

    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [theme])

  if (!mounted) {
    return null
  }

  return <>{children}</>
}

