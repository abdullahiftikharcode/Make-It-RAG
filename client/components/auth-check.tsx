"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AuthCheck() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      try {
        // Validate token with server
        const response = await fetch("http://localhost:3001/validate-token", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          // Token is valid, redirect to dashboard
          router.push("/dashboard")
        } else {
          // Token is invalid or expired, clear storage
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
        }
      } catch (error) {
        // Network error or other issues, clear storage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      }
    }

    checkAuth()
  }, [router])

  return null
} 