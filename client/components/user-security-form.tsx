"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"

export function UserSecurityForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    // This would be replaced with your actual API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" disabled={isLoading} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" disabled={isLoading} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" disabled={isLoading} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Require a verification code when signing in</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Recovery Codes</Label>
              <p className="text-sm text-muted-foreground">
                Generate backup codes to use if you lose access to your authenticator
              </p>
            </div>
            <Button variant="outline" disabled>
              Generate Codes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Manage your active sessions and sign out from other devices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">Current Session</p>
                <div className="text-sm text-muted-foreground">
                  <p>Chrome on Windows</p>
                  <p>IP: 192.168.1.1 • Last active: Just now</p>
                </div>
              </div>
              <div className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-600">Current</div>
            </div>
            <Separator />
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">Safari on iPhone</p>
                <div className="text-sm text-muted-foreground">
                  <p>IP: 192.168.1.2 • Last active: 2 hours ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-destructive">
                Sign Out
              </Button>
            </div>
            <Separator />
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">Firefox on MacBook</p>
                <div className="text-sm text-muted-foreground">
                  <p>IP: 192.168.1.3 • Last active: Yesterday</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-destructive">
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="text-destructive">
            Sign Out All Other Sessions
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

