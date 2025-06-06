"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import apiConfig from "@/config/api"

export function UserSecurityForm() {
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    // Extract values from the form using FormData
    const formData = new FormData(event.currentTarget)
    const currentPassword = formData.get("current-password") as string
    const newPassword = formData.get("new-password") as string
    const confirmPassword = formData.get("confirm-password") as string

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.", {
        position: "top-right",
        duration: 5000,
      });
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("Please log in to continue.", {
          position: "top-right",
          duration: 5000,
        });
        return
      }

      const response = await fetch(apiConfig.getApiUrl("/api/change-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      // Clear form
      event.currentTarget.reset()

      toast.success("Your password has been updated.", {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password", {
        position: "top-right",
        duration: 5000,
      });
    } finally {
      setIsLoading(false)
    }
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
              <Input id="current-password" name="current-password" type="password" disabled={isLoading} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" name="new-password" type="password" disabled={isLoading} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" name="confirm-password" type="password" disabled={isLoading} required />
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
            {/* Implement switch functionality as needed */}
            <input type="checkbox" />
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
