"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface NotificationBubbleProps {
  title?: string
  description: string
  variant?: "default" | "destructive" | "success"
  duration?: number
  className?: string
}

interface NotificationState {
  id: string
  title?: string
  description: string
  variant?: "default" | "destructive" | "success"
  visible: boolean
}

let bubbleCount = 0
const notifications: NotificationState[] = []
let listeners: Array<(notifications: NotificationState[]) => void> = []

function updateNotifications() {
  listeners.forEach(listener => listener([...notifications]))
}

export function showNotification({ 
  title, 
  description, 
  variant = "default", 
  duration = 5000 
}: NotificationBubbleProps) {
  const id = String(++bubbleCount)
  
  // Ensure title is always set for better visibility
  const enhancedTitle = title || (variant === "destructive" ? "Error" : 
                      variant === "success" ? "Success" : "Notification");
  
  const notification = {
    id,
    title: enhancedTitle,
    description,
    variant,
    visible: true
  }
  
  notifications.push(notification)
  updateNotifications()
  
  setTimeout(() => {
    const index = notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications[index].visible = false
      updateNotifications()
      
      setTimeout(() => {
        const removeIndex = notifications.findIndex(n => n.id === id)
        if (removeIndex !== -1) {
          notifications.splice(removeIndex, 1)
          updateNotifications()
        }
      }, 300)
    }
  }, duration)
  
  return {
    id,
    dismiss: () => {
      const index = notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications[index].visible = false
        updateNotifications()
        
        setTimeout(() => {
          const removeIndex = notifications.findIndex(n => n.id === id)
          if (removeIndex !== -1) {
            notifications.splice(removeIndex, 1)
            updateNotifications()
          }
        }, 300)
      }
    }
  }
}

export function NotificationBubble({
  title,
  description,
  variant = "default",
  className
}: NotificationBubbleProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-4 shadow-lg transition-all min-w-[300px]",
        "border text-foreground",
        variant === "default" && "bg-background border-gray-200",
        variant === "destructive" && "border-red-500 bg-red-50 text-red-800",
        variant === "success" && "border-green-500 bg-green-50 text-green-800",
        className
      )}
    >
      {title && (
        <div className={cn(
          "font-semibold mb-1 text-base",
          variant === "destructive" && "text-red-700",
          variant === "success" && "text-green-700"
        )}>
          {title}
        </div>
      )}
      <div className={cn(
        "text-sm",
        variant === "destructive" && "text-red-600",
        variant === "success" && "text-green-600"
      )}>
        {description}
      </div>
    </div>
  )
}

export function NotificationContainer() {
  const [currentNotifications, setCurrentNotifications] = useState<NotificationState[]>([])
  
  useEffect(() => {
    const handleUpdate = (updatedNotifications: NotificationState[]) => {
      setCurrentNotifications(updatedNotifications)
    }
    
    listeners.push(handleUpdate)
    
    return () => {
      listeners = listeners.filter(listener => listener !== handleUpdate)
    }
  }, [])
  
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {currentNotifications.map(notification => (
        <div
          key={notification.id}
          className={cn(
            "transition-all duration-300 pointer-events-auto",
            notification.visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          )}
        >
          <NotificationBubble
            title={notification.title}
            description={notification.description}
            variant={notification.variant}
          />
        </div>
      ))}
    </div>
  )
} 