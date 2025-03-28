"use client"

import { useRef } from "react"
import { useInView } from "framer-motion"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="pricing" className="w-full py-20 md:py-32 bg-muted/30 scroll-mt-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[60%] left-[10%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-[30%] right-[20%] h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          ref={ref}
        >
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">Pricing</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Simple, Transparent Pricing</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Choose the plan that's right for you and start chatting with your database today.
            </p>
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          {/* Free Plan */}
          <motion.div
            className="flex flex-col rounded-xl border bg-card p-6 shadow-sm relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Free</h3>
                <p className="text-muted-foreground">Perfect for trying out the platform</p>
              </div>
              <div className="text-4xl font-bold">$0</div>
              <p className="text-sm text-muted-foreground">Free forever</p>
              <ul className="space-y-2 pt-4 text-sm">
                {[
                  "100 queries per month",
                  "1 database connection",
                  "7-day chat history",
                  "Basic SQL generation",
                  "Community support",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Link href="/signup" className="w-full">
                <Button className="w-full" variant="outline">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            className="flex flex-col rounded-xl border bg-card p-6 shadow-lg relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute top-0 right-0">
              <Badge className="rounded-tl-none rounded-br-none rounded-tr-lg rounded-bl-lg bg-primary text-primary-foreground">
                Most Popular
              </Badge>
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="text-muted-foreground">For individuals and small teams</p>
              </div>
              <div className="text-4xl font-bold">$29</div>
              <p className="text-sm text-muted-foreground">per month, billed annually</p>
              <ul className="space-y-2 pt-4 text-sm">
                {[
                  "1,000 queries per month",
                  "5 database connections",
                  "30-day chat history",
                  "Advanced SQL generation",
                  "Data visualization",
                  "Email support",
                  "SQL editing and customization",
                  "Export results to CSV/Excel",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Link href="/signup" className="w-full">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            className="flex flex-col rounded-xl border bg-card p-6 shadow-sm relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Enterprise</h3>
                <p className="text-muted-foreground">For organizations with advanced needs</p>
              </div>
              <div className="text-4xl font-bold">Custom</div>
              <p className="text-sm text-muted-foreground">Contact us for pricing</p>
              <ul className="space-y-2 pt-4 text-sm">
                {[
                  "Unlimited queries",
                  "Unlimited database connections",
                  "Unlimited chat history",
                  "Advanced security features",
                  "Custom integrations",
                  "Dedicated support",
                  "SSO authentication",
                  "Custom AI model training",
                  "SLA guarantees",
                  "On-premise deployment option",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Link href="/contact" className="w-full">
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          className="mt-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Can I change plans at any time?",
                a: "Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the start of your next billing cycle.",
              },
              {
                q: "Is there a limit to the size of my database?",
                a: "No, there's no limit to the size of your database. However, larger databases may require more processing time for complex queries.",
              },
              {
                q: "How secure is my database connection?",
                a: "We use industry-standard encryption for all database connections. Your credentials are encrypted at rest and in transit.",
              },
              {
                q: "Do you offer a free trial of the Pro plan?",
                a: "Yes, we offer a 14-day free trial of the Pro plan with no credit card required.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-lg border p-4 bg-card">
                <h4 className="font-medium mb-2">{faq.q}</h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

