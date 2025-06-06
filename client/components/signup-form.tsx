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
    if (isRedirecting.current) return;

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      const response = await fetch(apiConfig.getApiUrl("/signup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error === "Email already exists"
          ? "An account with this email already exists. Please log in instead."
          : data.error === "Invalid email format"
          ? "Please enter a valid email address."
          : data.error === "Password too short"
          ? "Password must be at least 8 characters long."
          : data.error || "Something went wrong. Please try again.", {
            position: "top-right",
            duration: 5000,
          });
      } else {
        // Mark as redirecting to prevent multiple redirects
        isRedirecting.current = true;
        
        // Store the token and user data in localStorage
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        
        toast.success("You've successfully signed up for SQL Chat Assistant.", {
          position: "top-right",
          duration: 3000,
        });
        
        // Short timeout to ensure toast has time to appear
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
      }
    } catch (error) {
      toast.error("Unable to connect to the server. Please check your internet connection and try again.", {
        position: "top-right",
        duration: 5000,
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              autoCapitalize="none"
              autoComplete="name"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
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
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <Button disabled={isLoading || isRedirecting.current}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </div>
      </form>
    </div>
  )
}
