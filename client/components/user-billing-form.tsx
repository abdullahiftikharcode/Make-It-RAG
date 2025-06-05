"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useBubble } from "@/hooks/use-bubble"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import apiConfig from "@/config/api"

interface Plan {
  id: string
  name: string
  price: number
  billing_interval: string
  features: {
    queries_per_month: number
    db_connections: number
    chat_history_days: number
    support_level: string
  }
}

interface PaymentMethod {
  id: string
  card_type: string
  last_four: string
  expiry_month: string
  expiry_year: string
  is_default: boolean
}

interface Subscription {
  id?: string
  plan_name: string
  status: string
  current_period_end?: string
  features: {
    queries_per_month: number
    db_connections: number
    chat_history_days: number
    support_level: string
  }
}

interface Invoice {
  id: string
  amount: number
  status: string
  created_at: string
  plan_name: string
  last_four?: string
}

export function UserBillingForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [billingHistory, setBillingHistory] = useState<Invoice[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCard, setNewCard] = useState({
    card_type: "visa",
    last_four: "",
    expiry_month: "",
    expiry_year: "",
    is_default: true
  })
  const { toast } = useBubble()

  // Load initial data
  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to continue.",
          variant: "destructive",
        })
        return
      }

      // Load subscription plans
      const plansResponse = await fetch(apiConfig.getApiUrl('/api/billing/plans'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const plansData = await plansResponse.json()
      setPlans(plansData)

      // Load current subscription
      const subscriptionResponse = await fetch(apiConfig.getApiUrl('/api/billing/subscription'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const subscriptionData = await subscriptionResponse.json()
      setSubscription(subscriptionData)
      setSelectedPlan(subscriptionData.plan_name.toLowerCase())

      // Load payment methods
      const paymentMethodsResponse = await fetch(apiConfig.getApiUrl('/api/billing/payment-methods'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const paymentMethodsData = await paymentMethodsResponse.json()
      setPaymentMethods(paymentMethodsData)

      // Load billing history
      const historyResponse = await fetch(apiConfig.getApiUrl('/api/billing/history'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const historyData = await historyResponse.json()
      setBillingHistory(Array.isArray(historyData) ? historyData : [])
    } catch (error) {
      console.error('Error loading billing data:', error)
      toast({
        title: "Error",
        description: "Failed to load billing information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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

      const response = await fetch(apiConfig.getApiUrl('/api/billing/payment-methods'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCard),
      })

      if (!response.ok) {
        throw new Error('Failed to add payment method')
      }

      await loadBillingData()
      setShowAddCard(false)
      toast({
        title: "Success",
        description: "Payment method added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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

      // Get the selected plan details
      const plan = plans.find(p => p.name.toLowerCase() === selectedPlan)
      if (!plan) {
        throw new Error('Selected plan not found')
      }

      // Get default payment method
      const defaultPaymentMethod = paymentMethods.find(pm => pm.is_default)
      if (!defaultPaymentMethod && plan.price > 0) {
        toast({
          title: "Error",
          description: "Please add a payment method first.",
          variant: "destructive",
        })
        return
      }

      // Create new subscription
      const response = await fetch(apiConfig.getApiUrl('/api/billing/subscription'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: plan.id,
          paymentMethodId: defaultPaymentMethod?.id,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update subscription')
      }

      await loadBillingData()

      // Dispatch a custom event when subscription is updated
      const event = new CustomEvent('subscriptionUpdated', {
        detail: { newTier: responseData.subscription_tier }
      });
      window.dispatchEvent(event);
      
      toast({
        title: "Success",
        description: "Subscription updated successfully.",
      })
    } catch (error) {
      console.error('Subscription update error:', error)
      let errorMessage = 'Failed to update subscription. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription?.id) return

    setIsLoading(true)
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

      const response = await fetch(apiConfig.getApiUrl(`/api/billing/subscription/${subscription.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      await loadBillingData()
      toast({
        title: "Success",
        description: "Subscription cancelled successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Manage your subscription and billing information.</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateSubscription}>
          <CardContent className="space-y-6">
            {subscription && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium">Current Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    You are currently on the {subscription.plan_name} plan.
                  </p>
              </div>

              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                      <h4 className="font-semibold">{subscription.plan_name} Plan</h4>
                      {subscription.current_period_end && (
                        <p className="text-sm text-muted-foreground">
                          Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                      {subscription.status === 'trial' ? 'Trial' : 'Current'}
                  </div>
                </div>
                <Separator className="my-4" />
                  
                  <div className="space-y-2">
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
                      {subscription.features.queries_per_month === -1 
                        ? "Unlimited queries per month"
                        : `${subscription.features.queries_per_month.toLocaleString()} queries per month`}
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
                      {subscription.features.db_connections === -1
                        ? "Unlimited database connections"
                        : `${subscription.features.db_connections} database connections`}
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
                      {subscription.features.chat_history_days === -1
                        ? "Unlimited chat history"
                        : `${subscription.features.chat_history_days}-day chat history`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium mb-4">Change Plan</h3>
              <RadioGroup 
                value={selectedPlan} 
                onValueChange={setSelectedPlan}
                className="space-y-4"
              >
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`flex items-center space-x-2 rounded-lg border p-4 ${
                      plan.name.toLowerCase() === subscription?.plan_name.toLowerCase()
                        ? 'bg-muted/50'
                        : ''
                    }`}
                  >
                    <RadioGroupItem value={plan.name.toLowerCase()} id={plan.name.toLowerCase()} />
                  <div className="flex-1">
                      <Label htmlFor={plan.name.toLowerCase()} className="font-medium">
                        {plan.name}
                    </Label>
                      <p className="text-sm text-muted-foreground">
                        {plan.features.queries_per_month === -1
                          ? "Unlimited queries"
                          : `${plan.features.queries_per_month.toLocaleString()} queries per month`}
                        , {" "}
                        {plan.features.db_connections === -1
                          ? "unlimited"
                          : plan.features.db_connections}{" "}
                        database connection{plan.features.db_connections === 1 ? "" : "s"}
                      </p>
                  </div>
                    <div className="font-medium">
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {subscription?.status === 'active' && (
              <Button 
                variant="outline" 
                type="button"
                onClick={handleCancelSubscription}
                disabled={isLoading}
              >
              Cancel Subscription
            </Button>
            )}
            <Button type="submit" disabled={isLoading || selectedPlan === subscription?.plan_name.toLowerCase()}>
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
          {paymentMethods.map((method) => (
            <div key={method.id} className="rounded-lg border p-4">
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
                    <p className="font-medium">
                      {method.card_type.charAt(0).toUpperCase() + method.card_type.slice(1)} ending in {method.last_four}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.expiry_month}/{method.expiry_year}
                    </p>
                  </div>
                </div>
                {method.is_default && (
                  <div className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-600">
                    Default
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
            <DialogTrigger asChild>
          <Button variant="outline">Add Payment Method</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  Add a new credit card to your account.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCard} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="card-type">Card Type</Label>
                  <Select
                    value={newCard.card_type}
                    onValueChange={(value) => setNewCard(prev => ({ ...prev, card_type: value }))}
                  >
                    <SelectTrigger id="card-type">
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">
                        <div className="flex items-center">
                          <span className="font-medium">Visa</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mastercard">
                        <div className="flex items-center">
                          <span className="font-medium">Mastercard</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="amex">
                        <div className="flex items-center">
                          <span className="font-medium">American Express</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-four">Last 4 Digits</Label>
                  <Input
                    id="last-four"
                    maxLength={4}
                    value={newCard.last_four}
                    onChange={(e) => setNewCard(prev => ({ ...prev, last_four: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="expiry-month">Expiry Month</Label>
                    <Input
                      id="expiry-month"
                      placeholder="MM"
                      maxLength={2}
                      value={newCard.expiry_month}
                      onChange={(e) => setNewCard(prev => ({ ...prev, expiry_month: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expiry-year">Expiry Year</Label>
                    <Input
                      id="expiry-year"
                      placeholder="YYYY"
                      maxLength={4}
                      value={newCard.expiry_year}
                      onChange={(e) => setNewCard(prev => ({ ...prev, expiry_year: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Card"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and payment history.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(billingHistory) && billingHistory.length > 0 ? (
              billingHistory.map((invoice) => (
                <div key={invoice.id}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                      <p className="font-medium">{invoice.plan_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
              </div>
              <div className="flex items-center space-x-4">
                      <p className="font-medium">
                        ${typeof invoice.amount === 'number' 
                          ? invoice.amount.toFixed(2) 
                          : parseFloat(String(invoice.amount)).toFixed(2)}
                      </p>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
                  <Separator className="my-4" />
              </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No billing history available
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">View All Invoices</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

