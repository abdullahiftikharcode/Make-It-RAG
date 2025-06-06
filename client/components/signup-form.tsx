"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import apiConfig from "@/config/api"

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const isRedirecting = useRef(false) // Add ref to track redirect status

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    // Prevent multiple submissions
    if (isRedirecting.current) return

    try {
      const formData = new FormData(event.currentTarget)
      const email = formData.get("email")
      const password = formData.get("password")
      const confirmPassword = formData.get("confirmPassword")

      // Basic validation
      if (password !== confirmPassword) {
        toast.error("Passwords do not match", {
          position: "top-right",
          duration: 5000
        });
        return;
      }

      const response = await fetch(apiConfig.getApiUrl("/api/auth/signup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Signup failed")
      }

      // Store token
      localStorage.setItem("auth_token", data.token)
      
      // Set success flag and redirect
      isRedirecting.current = true
      toast.success("Account created successfully!", {
        position: "top-right",
        duration: 3000
      });
      router.push("/dashboard")
    } catch (error) {
      setIsLoading(false)
      toast.error(error instanceof Error ? error.message : "Signup failed", {
        position: "top-right",
        duration: 5000
      });
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
            Sign Up
          </Button>
        </div>
      </form>
    </div>
  )
}
