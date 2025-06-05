"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import apiConfig from "@/config/api"

export function NewConnectionForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const name = formData.get("name") as string
      const type = formData.get("type") as string
      const connectionString = formData.get("connection-string") as string

      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to continue.",
          variant: "destructive",
        })
        return
      }

      const connectionData = {
        name,
        type,
        connectionString
      }

      const response = await fetch(apiConfig.getApiUrl("/api/connections"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(connectionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create connection")
      }

      toast({
        title: "Success",
        description: "Database connection created successfully.",
      })

      router.push("/dashboard/connections")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create connection",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Connection</CardTitle>
        <CardDescription>Add a new database connection.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Connection Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="grid gap-2">
            <Label>Database Type</Label>
            <RadioGroup defaultValue="mysql" name="type" className="grid grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="mysql" id="mysql" className="peer sr-only" />
                <Label
                  htmlFor="mysql"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  MySQL
                </Label>
              </div>
              <div>
                <RadioGroupItem value="postgresql" id="postgresql" className="peer sr-only" />
                <Label
                  htmlFor="postgresql"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  PostgreSQL
                </Label>
              </div>
              <div>
                <RadioGroupItem value="mssql" id="mssql" className="peer sr-only" />
                <Label
                  htmlFor="mssql"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  SQL Server
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="connection-string">Connection String</Label>
            <Input id="connection-string" name="connection-string" required />
            <p className="text-sm text-muted-foreground">
              Example: mysql://user:password@localhost:3306/database
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Connection"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

