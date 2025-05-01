"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useBubble } from "@/hooks/use-bubble"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Debounce function to prevent excessive state updates
function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function UserProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    bio: ""
  })
  const { toast } = useBubble()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [initialLoad, setInitialLoad] = useState(true)

  // Handle input changes in a way that doesn't trigger re-renders excessively
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Fetch the current user details on component mount only
  useEffect(() => {
    let isMounted = true;
    
    const fetchProfile = async () => {
      if (!initialLoad) return; // Only fetch on initial load
      
      setIsLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
          duration: 5000
        })
        return
      }
      try {
        const response = await fetch('http://localhost:3001/api/profile', {
          method: 'GET',
          headers: {
             Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile')
        }
        
        if (isMounted) {
        // Assuming the API returns { name, email, company, bio, image }
        // Split the full name into first and last names.
        const fullName = data.name || ""
        const [fName = "", ...rest] = fullName.split(" ")
        const lName = rest.join(" ")
          
          setFormData({
            firstName: fName,
            lastName: lName,
            email: data.email || "",
            company: data.company || "",
            bio: data.bio || ""
          })
          
        setImage(data.image || null)
          setInitialLoad(false) // Mark initial load as complete
        }
      } catch (error: any) {
        if (isMounted) {
        toast({
            title: "Error Loading Profile",
            description: error.message || "Failed to load profile data. Please try again.",
            variant: "destructive",
            duration: 5000
          })
        }
      } finally {
        if (isMounted) {
        setIsLoading(false)
        }
      }
    }

    fetchProfile()
    
    return () => {
      isMounted = false; // Cleanup to prevent state updates after unmount
    }
  }, [toast, initialLoad]) // Only depend on toast and initialLoad

  // Handle image upload change
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        // The result is a base64 string (including data URI prefix)
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleRemoveImage = useCallback(() => {
    setImage(null)
  }, [])

  const handleChangeAvatar = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      company: formData.company,
      bio: formData.bio,
      image, // base64 encoded string (or null if no image is selected)
    }

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to continue.",
          variant: "destructive",
        })
        return
      }
      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }
      
      // Update toast with proper styling and ensure content is visible
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
        variant: "success",
        duration: 3000
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }, [formData, image, toast])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Update your personal information and public profile.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  {image ? (
                    <AvatarImage src={image} alt="Profile" />
                  ) : (
                    <>
                      <AvatarImage
                        src="/placeholder.svg?height=96&width=96"
                        alt="Profile"
                      />
                      <AvatarFallback>JD</AvatarFallback>
                    </>
                  )}
                </Avatar>
              </div>
              <div className="flex flex-col justify-center space-y-2">
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={handleChangeAvatar}
                >
                  Change Avatar
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={handleRemoveImage}
                >
                  Remove Avatar
                </Button>
                {/* Hidden file input for image upload */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
