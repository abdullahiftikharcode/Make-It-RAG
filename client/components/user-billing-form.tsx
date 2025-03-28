"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export function UserBillingForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    // This would be replaced with your actual API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Plan updated",
        description: "Your subscription plan has been updated successfully.",
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Manage your subscription and billing information.</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium">Current Plan</h3>
                <p className="text-sm text-muted-foreground">You are currently on the Pro plan.</p>
              </div>

              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">Pro Plan</h4>
                    <p className="text-sm text-muted-foreground">$29/month • Renews on November 15, 2023</p>
                  </div>
                  <div className="rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">Current</div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    1,000 queries per month
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    5 database connections
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    30-day chat history
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Change Plan</h3>
              <RadioGroup defaultValue="pro" className="space-y-4">
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="free" id="free" />
                  <div className="flex-1">
                    <Label htmlFor="free" className="font-medium">
                      Free
                    </Label>
                    <p className="text-sm text-muted-foreground">100 queries per month, 1 database connection</p>
                  </div>
                  <div className="font-medium">$0</div>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-4 bg-muted/50">
                  <RadioGroupItem value="pro" id="pro" />
                  <div className="flex-1">
                    <Label htmlFor="pro" className="font-medium">
                      Pro
                    </Label>
                    <p className="text-sm text-muted-foreground">1,000 queries per month, 5 database connections</p>
                  </div>
                  <div className="font-medium">$29</div>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="enterprise" id="enterprise" />
                  <div className="flex-1">
                    <Label htmlFor="enterprise" className="font-medium">
                      Enterprise
                    </Label>
                    <p className="text-sm text-muted-foreground">Unlimited queries, unlimited database connections</p>
                  </div>
                  <div className="font-medium">Custom</div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button">
              Cancel Subscription
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Plan"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Update your payment information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-muted p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                </div>
              </div>
              <div className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-600">Default</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Add Payment Method</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and payment history.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-medium">Pro Plan - Monthly</p>
                <p className="text-sm text-muted-foreground">October 15, 2023</p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-medium">$29.00</p>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-medium">Pro Plan - Monthly</p>
                <p className="text-sm text-muted-foreground">September 15, 2023</p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-medium">$29.00</p>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-medium">Pro Plan - Monthly</p>
                <p className="text-sm text-muted-foreground">August 15, 2023</p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-medium">$29.00</p>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">View All Invoices</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

