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
import { toast } from "sonner"
import { Sun, Moon, Monitor } from "lucide-react"
import apiConfig from "@/config/api"

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

      const response = await fetch(apiConfig.getApiUrl('/api/settings'), {
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

      const response = await fetch(apiConfig.getApiUrl('/api/settings'), {
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
              <ApiKeyManager />
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

// Create a separate component for API Key management
function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewKeyValue, setShowNewKeyValue] = useState<{key: string, show: boolean} | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [error, setError] = useState('');
  const { toast: shadcnToast } = useToast();

  // Load API keys on component mount
  useEffect(() => {
    loadApiKeys();
  }, []);

  // Function to load API keys
  const loadApiKeys = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError('You need to be logged in to manage API keys');
        return;
      }

      const response = await fetch(apiConfig.getApiUrl('/api/api-keys'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load API keys');
      }

      const data = await response.json();
      // Use the data directly from the server - no need for processing
      setApiKeys(data);
    } catch (err) {
      setError('Failed to load API keys');
      console.error('Error loading API keys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate a new API key
  const generateNewKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please provide a name for your API key", {
        position: "top-right",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError('You need to be logged in to generate API keys');
        return;
      }

      const response = await fetch(apiConfig.getApiUrl('/api/api-keys'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName }),
      });

      // Get response data even if the response is not OK, as it may contain error details
      const data = await response.json();

      if (!response.ok) {
        // Extract more specific error message from the response
        const errorMessage = data.error || data.message || data.details || 'Failed to generate API key';
        throw new Error(errorMessage);
      }
      
      // Show the full key to the user (only once)
      setShowNewKeyValue({ key: data.api_key, show: true });
      setNewKeyName('');
      
      // Reload the API keys list
      loadApiKeys();
      
      toast.success("New API key created. Make sure to copy it now, you won't be able to see it again.", {
        position: "top-right",
        duration: 5000,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate API key", {
        position: "top-right",
        duration: 3000,
      });
      console.error('Error generating API key:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to revoke (delete) an API key
  const revokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError('You need to be logged in to revoke API keys');
        return;
      }

      const response = await fetch(apiConfig.getApiUrl(`/api/api-keys/${keyId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      // Reload the API keys list
      loadApiKeys();
      
      toast.success("API key revoked successfully", {
        position: "top-right",
        duration: 3000,
      });
    } catch (err) {
      toast.error("Failed to revoke API key", {
        position: "top-right",
        duration: 3000,
      });
      console.error('Error revoking API key:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to copy API key to clipboard
  const copyToClipboard = (text: string) => {
    // Try the modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          // Use sonner toast for better visibility
          toast.success("API key copied to clipboard", {
            position: "top-right",
            duration: 3000,
            style: {
              background: "green",
              color: "white",
              border: "none"
            },
          });
        })
        .catch(err => {
          console.error('Failed to copy:', err);
          // Fallback method using document.execCommand
          fallbackCopyToClipboard(text);
        });
    } else {
      // Use fallback for non-secure contexts
      fallbackCopyToClipboard(text);
    }
  };

  // Fallback clipboard method for browsers that don't support clipboard API
  const fallbackCopyToClipboard = (text: string) => {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // Select and copy
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        toast.success("API key copied to clipboard", {
          position: "top-right",
          duration: 3000,
          style: {
            background: "green",
            color: "white",
            border: "none"
          },
        });
      } else {
        throw new Error('Copy command failed');
      }
    } catch (err) {
      console.error('Fallback copy method failed:', err);
      toast.error("Failed to copy to clipboard. Please select and copy manually.", {
        position: "top-right",
        duration: 5000,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-destructive/20 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* New API key section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-key-name">Create New API Key</Label>
          <div className="flex space-x-2">
            <Input
              id="new-key-name"
              placeholder="API key name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              onClick={generateNewKey} 
              disabled={isLoading || !newKeyName.trim()}
            >
              Generate
            </Button>
          </div>
        </div>

        {/* Display newly generated key */}
        {showNewKeyValue && (
          <div className="border p-4 rounded-md bg-muted/50">
            <p className="font-medium mb-2">Your new API key (copy it now, you won't see it again):</p>
            <div className="flex space-x-2 mb-2">
              <Input
                value={showNewKeyValue.key}
                readOnly
                type={showNewKeyValue.show ? "text" : "password"}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewKeyValue({
                  ...showNewKeyValue,
                  show: !showNewKeyValue.show
                })}
              >
                {showNewKeyValue.show ? "Hide" : "Show"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  copyToClipboard(showNewKeyValue.key);
                  // Add visual feedback for the button
                  const btn = document.activeElement as HTMLButtonElement;
                  if (btn) {
                    const originalText = btn.textContent || 'Copy';
                    btn.textContent = 'Copied!';
                    btn.classList.add('bg-primary', 'text-primary-foreground');
                    setTimeout(() => {
                      btn.textContent = originalText;
                      btn.classList.remove('bg-primary', 'text-primary-foreground');
                    }, 1000);
                  }
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This key will only be displayed once. If you lose it, you'll need to generate a new one.
            </p>
          </div>
        )}
      </div>

      {/* API keys list */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Your API Keys</h3>
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : apiKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            You don't have any API keys yet. Generate one using the form above.
          </p>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div key={key.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{key.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(key.created_date).toLocaleDateString()}
                    </p>
                    {key.last_used_date && (
                      <p className="text-xs text-muted-foreground">
                        Last used: {new Date(key.last_used_date).toLocaleString()}
                      </p>
                    )}
                    <div className="mt-1 flex items-center">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {key.display_key || key.api_key}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 ml-2"
                        onClick={(e) => {
                          // Use the full key for copying
                          copyToClipboard(key.api_key);
                          // Add visual feedback
                          const btn = e.currentTarget;
                          const originalText = btn.textContent || 'Copy';
                          btn.textContent = 'Copied!';
                          btn.classList.add('bg-muted', 'text-primary');
                          setTimeout(() => {
                            btn.textContent = originalText;
                            btn.classList.remove('bg-muted', 'text-primary');
                          }, 1000);
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {key.revoked_date ? (
                      <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                        Revoked
                      </span>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => revokeKey(key.id)}
                        disabled={isLoading}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API usage section */}
      <div className="pt-6 border-t">
        <h3 className="text-lg font-medium mb-2">API Usage</h3>
        {apiKeys.length > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">This Month</span>
              <span>0 / 10,000 requests</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[0%]" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your API usage is reset on the 1st of each month.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Generate an API key to view usage statistics.
          </p>
        )}
      </div>
    </div>
  );
}

