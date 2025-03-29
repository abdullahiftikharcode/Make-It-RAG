"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Sun, Moon, Monitor } from "lucide-react"

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  query_timeout: number
  auto_disconnect: boolean
  show_sql_queries: boolean
}

export default function SettingsPage() {
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
      <DashboardHeader heading="Settings" text="Manage your application preferences and account settings." />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 w-full overflow-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>Configure your language and regional preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en-US">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time (ET)</SelectItem>
                      <SelectItem value="cst">Central Time (CT)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Label htmlFor="timeout">Query Timeout</Label>
                    <p className="text-sm text-muted-foreground">Maximum time in seconds for a query to execute</p>
                  </div>
                  <Input 
                    id="timeout" 
                    type="number" 
                    value={settings?.query_timeout || 30} 
                    onChange={(e) => saveSettings({ query_timeout: parseInt(e.target.value) })}
                    className="w-20" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-disconnect</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically disconnect from databases after inactivity
                    </p>
                  </div>
                  <Switch 
                    checked={settings?.auto_disconnect} 
                    onCheckedChange={(checked) => saveSettings({ auto_disconnect: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show SQL Queries</Label>
                    <p className="text-sm text-muted-foreground">Display the generated SQL queries in chat responses</p>
                  </div>
                  <Switch 
                    checked={settings?.show_sql_queries} 
                    onCheckedChange={(checked) => saveSettings({ show_sql_queries: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
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
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications for important events</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Connection Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when database connections fail or time out
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Usage Reports</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly usage reports and insights</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Product Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new features and improvements</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for programmatic access to the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    value="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"
                    type="password"
                    readOnly
                  />
                  <Button variant="outline">Copy</Button>
                  <Button variant="outline" className="text-destructive">
                    Revoke
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This key was created on October 12, 2023. It has never been used.
                </p>
              </div>

              <div className="pt-4">
                <Button>Generate New API Key</Button>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-2">API Usage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">This Month</span>
                    <span>1,234 / 10,000 requests</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[12%]" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <p className="text-sm text-muted-foreground">
                Your API key provides full access to your account. Keep it secure and never share it publicly.
              </p>
              <Button variant="outline">View API Documentation</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

