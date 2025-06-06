"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import apiConfig from "@/config/api"

export function AuthCheck() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("Please log in to continue.", {
          position: "top-right",
          duration: 5000
        });
        router.push("/login")
        return
      }

      try {
        const response = await fetch(apiConfig.getApiUrl("/api/auth/check"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Authentication failed")
        }
      } catch (error) {
        toast.error("Authentication failed. Please log in again.", {
          position: "top-right",
          duration: 5000
        });
        localStorage.removeItem("auth_token")
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  return null
} 