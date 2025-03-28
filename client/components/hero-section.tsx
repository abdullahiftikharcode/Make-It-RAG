"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Database, MessageSquare, ArrowRight } from "lucide-react"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const textOptions = [
    "Show me sales from last month",
    "Find customers who spent over $1000",
    "List products with low inventory",
    "Analyze revenue by region",
  ]

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Typing animation effect
  useEffect(() => {
    if (!mounted) return

    const textToType = textOptions[currentTextIndex]
    let currentIndex = 0
    let typingInterval: NodeJS.Timeout

    // Type the current text
    const typeText = () => {
      if (currentIndex <= textToType.length) {
        setTypedText(textToType.substring(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)

        // Wait before erasing
        setTimeout(() => {
          eraseText()
        }, 2000)
      }
    }

    // Erase the current text
    const eraseText = () => {
      const eraseInterval = setInterval(() => {
        if (typedText.length > 0) {
          setTypedText((prev) => prev.substring(0, prev.length - 1))
        } else {
          clearInterval(eraseInterval)

          // Move to next text option
          setCurrentTextIndex((prev) => (prev + 1) % textOptions.length)
        }
      }, 50)
    }

    typingInterval = setInterval(typeText, 100)

    return () => {
      clearInterval(typingInterval)
    }
  }, [currentTextIndex, mounted])

  if (!mounted) return null

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-background to-background/80 py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] left-[20%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -bottom-[30%] right-[20%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute left-[40%] top-[20%] h-[300px] w-[300px] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_600px] lg:gap-16 xl:grid-cols-[1fr_750px]">
          <motion.div
            className="flex flex-col justify-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                New: Multi-database support
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Chat with Your Database in <span className="text-primary">Plain English</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                Transform complex SQL queries into natural conversations. Ask questions in plain language and get
                instant insights from your data.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline">
                  View Documentation
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4 text-primary" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M8 12l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center">
                <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4 text-primary" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M8 12l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Free plan available
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative mx-auto flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative w-full max-w-[600px] overflow-hidden rounded-xl border bg-background/80 backdrop-blur-sm shadow-2xl">
              {/* Terminal header */}
              <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="font-medium">SQL Chat Assistant</span>
                </div>
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              {/* Chat interface */}
              <div className="p-4 space-y-4">
                {/* User message */}
                <div className="ml-auto max-w-[80%] rounded-lg bg-primary p-4 text-primary-foreground">
                  <div className="flex items-center gap-2 mb-1 text-xs opacity-80">
                    <span>You</span>
                    <span>•</span>
                    <span>Just now</span>
                  </div>
                  <p>
                    {typedText || "..."}
                    <span className="animate-pulse">|</span>
                  </p>
                </div>

                {/* Assistant thinking */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">SQL Assistant is thinking</span>
                  <div className="flex space-x-1">
                    <div
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>

                {/* SQL preview */}
                <div className="max-w-[90%] rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                    <Database className="h-3 w-3" />
                    <span>Generated SQL</span>
                  </div>
                  <pre className="text-xs overflow-x-auto p-2 bg-background/50 rounded border">
                    <code className="text-xs">
                      {currentTextIndex === 0 &&
                        `SELECT * FROM sales 
WHERE date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
AND date < DATE_TRUNC('month', CURRENT_DATE)
ORDER BY amount DESC;`}
                      {currentTextIndex === 1 &&
                        `SELECT customer_id, name, email, SUM(amount) as total_spent
FROM customers
JOIN orders ON customers.id = orders.customer_id
GROUP BY customer_id, name, email
HAVING SUM(amount) > 1000
ORDER BY total_spent DESC;`}
                      {currentTextIndex === 2 &&
                        `SELECT id, name, category, quantity, 
CASE WHEN quantity < reorder_level THEN 'Low' ELSE 'OK' END as stock_status
FROM products
WHERE quantity < reorder_level
ORDER BY quantity ASC;`}
                      {currentTextIndex === 3 &&
                        `SELECT region, SUM(amount) as total_revenue,
COUNT(DISTINCT customer_id) as customer_count,
AVG(amount) as avg_order_value
FROM orders
JOIN customers ON orders.customer_id = customers.id
GROUP BY region
ORDER BY total_revenue DESC;`}
                    </code>
                  </pre>
                </div>

                {/* Results preview */}
                <div className="max-w-[90%] rounded-lg border bg-card p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Results</div>
                      <div className="text-xs text-muted-foreground">5 of 24 rows</div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            {currentTextIndex === 0 && (
                              <>
                                <th className="px-2 py-1 text-left font-medium">Date</th>
                                <th className="px-2 py-1 text-left font-medium">Product</th>
                                <th className="px-2 py-1 text-left font-medium">Amount</th>
                              </>
                            )}
                            {currentTextIndex === 1 && (
                              <>
                                <th className="px-2 py-1 text-left font-medium">Customer</th>
                                <th className="px-2 py-1 text-left font-medium">Email</th>
                                <th className="px-2 py-1 text-left font-medium">Total Spent</th>
                              </>
                            )}
                            {currentTextIndex === 2 && (
                              <>
                                <th className="px-2 py-1 text-left font-medium">Product</th>
                                <th className="px-2 py-1 text-left font-medium">Category</th>
                                <th className="px-2 py-1 text-left font-medium">Quantity</th>
                                <th className="px-2 py-1 text-left font-medium">Status</th>
                              </>
                            )}
                            {currentTextIndex === 3 && (
                              <>
                                <th className="px-2 py-1 text-left font-medium">Region</th>
                                <th className="px-2 py-1 text-left font-medium">Revenue</th>
                                <th className="px-2 py-1 text-left font-medium">Customers</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {currentTextIndex === 0 && (
                            <>
                              <tr className="border-b">
                                <td className="px-2 py-1">2023-10-15</td>
                                <td className="px-2 py-1">Premium Plan</td>
                                <td className="px-2 py-1">$2,500.00</td>
                              </tr>
                              <tr className="border-b">
                                <td className="px-2 py-1">2023-10-12</td>
                                <td className="px-2 py-1">Enterprise License</td>
                                <td className="px-2 py-1">$1,800.00</td>
                              </tr>
                              <tr className="border-b">
                                <td className="px-2 py-1">2023-10-08</td>
                                <td className="px-2 py-1">Premium Plan</td>
                                <td className="px-2 py-1">$1,200.00</td>
                              </tr>
                            </>
                          )}
                          {currentTextIndex === 1 && (
                            <>
                              <tr className="border-b">
                                <td className="px-2 py-1">Acme Corp</td>
                                <td className="px-2 py-1">contact@acme.com</td>
                                <td className="px-2 py-1">$12,450.00</td>
                              </tr>
                              <tr className="border-b">
                                <td className="px-2 py-1">Globex</td>
                                <td className="px-2 py-1">info@globex.com</td>
                                <td className="px-2 py-1">$8,720.00</td>
                              </tr>
                              <tr className="border-b">
                                <td className="px-2 py-1">Initech</td>
                                <td className="px-2 py-1">sales@initech.com</td>
                                <td className="px-2 py-1">$5,340.00</td>
                              </tr>
                            </>
                          )}
                          {currentTextIndex === 2 && (
                            <>
                              <tr className="border-b">
                                <td className="px-2 py-1">Wireless Keyboard</td>
                                <td className="px-2 py-1">Electronics</td>
                                <td className="px-2 py-1">5</td>
                                <td className="px-2 py-1 text-red-500">Low</td>
                              </tr>
                              <tr className="border-b">
                                <td className="px-2 py-1">USB-C Cable</td>
                                <td className="px-2 py-1">Accessories</td>
                                <td className="px-2 py-1">8</td>
                                <td className="px-2 py-1 text-red-500">Low</td>
                              </tr>
                              <tr className="border-b">
                                <td className="px-2 py-1">Wireless Mouse</td>
                                <td className="px-2 py-1">Electronics</td>
                                <td className="px-2 py-1">12</td>
                                <td className="px-2 py-1 text-red-500">Low</td>
                              </tr>
                            </>
                          )}
                          {currentTextIndex === 3 && (
                            <>
                              <tr className="border-b">
                                <td className="px-2 py-1">North America</td>
                                <td className="px-2 py-1">$245,800.00</td>
                                <td className="px-2 py-1">1,245</td>
                              </tr>
                              <tr className="border-b">
                                <td className="px-2 py-1">Europe</td>
                                <td className="px-2 py-1">$187,650.00</td>
                                <td className="px-2 py-1">982</td>
                              </tr>
                              <tr className="border-b">
                                <td className="px-2 py-1">Asia Pacific</td>
                                <td className="px-2 py-1">$156,720.00</td>
                                <td className="px-2 py-1">845</td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary/30 blur-xl" />
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-secondary/30 blur-xl" />
          </motion.div>
        </div>

        {/* Trusted by section */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-sm font-medium text-muted-foreground mb-6">TRUSTED BY INNOVATIVE COMPANIES</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
            {["Acme Inc", "Globex", "Initech", "Umbrella Corp", "Stark Industries"].map((company) => (
              <div
                key={company}
                className="text-xl font-semibold text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              >
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

