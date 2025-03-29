"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Sun, Moon, Monitor } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  query_timeout: number
  auto_disconnect: boolean
  show_sql_queries: boolean
}

export default function AppearanceSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  // Effect to sync theme changes with localStorage
  useEffect(() => {
    if (settings?.theme) {
      localStorage.setItem('theme', settings.theme)
      // Update document class for theme
      if (settings.theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(systemTheme)
      } else {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(settings.theme)
      }
    }
  }, [settings?.theme])

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to continue.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('http://localhost:3001/api/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load settings')
      }

      // If no theme in settings, use the one from localStorage
      const currentTheme = localStorage.getItem('theme') as UserSettings['theme']
      const settingsWithTheme = {
        ...data,
        theme: currentTheme || data.theme || 'system'
      }

      setSettings(settingsWithTheme)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load settings",
        variant: "destructive",
      })
    }
  }

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to continue.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('http://localhost:3001/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...settings,
          ...newSettings,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }

      setSettings(prev => ({ ...prev!, ...newSettings }))
      toast({
        title: "Success",
        description: "Settings saved successfully.",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Appearance Settings" text="Customize the look and feel of your application." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Choose your preferred theme for the application.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <RadioGroup 
                value={settings?.theme || "system"} 
                onValueChange={(value) => saveSettings({ theme: value as UserSettings['theme'] })}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                  <Label
                    htmlFor="theme-light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    Light
                    <div className="mt-2 w-full h-16 rounded-md bg-[#FFFFFF] border"></div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                  <Label
                    htmlFor="theme-dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    Dark
                    <div className="mt-2 w-full h-16 rounded-md bg-[#121212] border"></div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                  <Label
                    htmlFor="theme-system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Monitor className="mb-3 h-6 w-6" />
                    System
                    <div className="mt-2 w-full h-16 rounded-md bg-gradient-to-r from-[#FFFFFF] to-[#121212] border"></div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Settings</CardTitle>
            <CardDescription>Configure how the application interacts with your databases.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show SQL Queries</Label>
                <p className="text-sm text-muted-foreground">Display the generated SQL queries in chat responses</p>
              </div>
              <RadioGroup 
                value={settings?.show_sql_queries ? "on" : "off"}
                onValueChange={(value) => saveSettings({ show_sql_queries: value === "on" })}
                className="flex"
              >
                <div className="flex items-center space-x-2">
                  <Label htmlFor="sql-queries-off">Off</Label>
                  <RadioGroupItem value="off" id="sql-queries-off" />
                  <RadioGroupItem value="on" id="sql-queries-on" />
                  <Label htmlFor="sql-queries-on">On</Label>
                </div>
              </RadioGroup>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-disconnect</Label>
                <p className="text-sm text-muted-foreground">Automatically disconnect from databases after inactivity</p>
              </div>
              <RadioGroup 
                value={settings?.auto_disconnect ? "on" : "off"}
                onValueChange={(value) => saveSettings({ auto_disconnect: value === "on" })}
                className="flex"
              >
                <div className="flex items-center space-x-2">
                  <Label htmlFor="auto-disconnect-off">Off</Label>
                  <RadioGroupItem value="off" id="auto-disconnect-off" />
                  <RadioGroupItem value="on" id="auto-disconnect-on" />
                  <Label htmlFor="auto-disconnect-on">On</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

