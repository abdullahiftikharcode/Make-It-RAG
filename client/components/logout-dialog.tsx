"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LogOut } from "lucide-react"
import Cookies from 'js-cookie'

export function LogoutDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    // Clear stored token and user data from both localStorage and cookies
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    Cookies.remove('auth_token')
    
    setTimeout(() => {
      setIsOpen(false)
      router.push("/")
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Out</DialogTitle>
          <DialogDescription>Are you sure you want to log out of your account?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleLogout}>Log Out</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

