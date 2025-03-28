"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"

export function NewConnectionForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const connectionString = formData.get("connection-string") as string

    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to add a connection.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      const response = await fetch("http://localhost:3001/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          type,
          connectionString
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to create connection",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Connection added!",
          description: "Your database connection has been successfully added.",
        })
        // Route to the chat page with the new connection's ID
        router.push(`/dashboard/chat/${data.connection.id}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error, please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Database Information</CardTitle>
          <CardDescription>Enter your database connection details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Connection Name</Label>
              <Input id="name" name="name" placeholder="My Production Database" required disabled={isLoading} />
            </div>
            <div>
              <Label>Database Type</Label>
              <RadioGroup name="type" defaultValue="postgresql" className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <RadioGroupItem value="postgresql" id="postgresql" className="peer sr-only" disabled={isLoading} />
                  <Label
                    htmlFor="postgresql"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-6 w-6"
                    >
                      <path d="M12 3c5.5 0 10 1.5 10 3.5V17c0 2-4.5 3.5-10 3.5S2 19 2 17V6.5C2 4.5 6.5 3 12 3" />
                      <path d="M12 3v17.5" />
                      <path d="M12 13c5.5 0 10-1.5 10-3.5" />
                      <path d="M12 8c5.5 0 10-1.5 10-3.5" />
                    </svg>
                    PostgreSQL
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="mysql" id="mysql" className="peer sr-only" disabled={isLoading} />
                  <Label
                    htmlFor="mysql"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-6 w-6"
                    >
                      <path d="M2 12a5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5 5 5 0 0 0-5 5Z" />
                      <path d="M12 7v10" />
                      <path d="M22 12h-8" />
                    </svg>
                    MySQL
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="sqlserver" id="sqlserver" className="peer sr-only" disabled={isLoading} />
                  <Label
                    htmlFor="sqlserver"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-6 w-6"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M7 7h10" />
                      <path d="M7 12h10" />
                      <path d="M7 17h10" />
                    </svg>
                    SQL Server
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="connection-string">Connection String</Label>
              <Input
                id="connection-string"
                name="connection-string"
                placeholder="postgresql://username:password@localhost:5432/database"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your connection string is encrypted and securely stored.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Testing connection..." : "Connect Database"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

