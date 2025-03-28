"use client"

import { useRef } from "react"
import { useInView } from "framer-motion"
import { Database, MessageSquare, History, Lock, Zap, BarChart, Code, LineChart, Layers, Cpu } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Database,
    title: "Multiple Database Support",
    description: "Connect to PostgreSQL, MySQL, SQL Server, and more with a simple connection string.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: MessageSquare,
    title: "Natural Language Queries",
    description: "Ask questions in plain English and get answers from your database instantly.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: History,
    title: "Chat History",
    description: "Review and revisit your previous queries and results anytime.",
    color: "bg-green-500/10 text-green-500",
  },
  {
    icon: Lock,
    title: "Secure Connections",
    description: "Your database credentials are encrypted and never stored in plain text.",
    color: "bg-red-500/10 text-red-500",
  },
  {
    icon: Zap,
    title: "Fast Response Times",
    description: "Get answers quickly with our optimized query processing engine.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: BarChart,
    title: "Data Visualization",
    description: "Automatically visualize your query results with charts and graphs.",
    color: "bg-indigo-500/10 text-indigo-500",
  },
  {
    icon: Code,
    title: "SQL Preview & Editing",
    description: "View and edit the generated SQL before execution for complete control.",
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    icon: LineChart,
    title: "Advanced Analytics",
    description: "Perform complex data analysis with just a few natural language prompts.",
    color: "bg-cyan-500/10 text-cyan-500",
  },
  {
    icon: Layers,
    title: "Schema Detection",
    description: "Automatically detect and understand your database schema for accurate queries.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Cpu,
    title: "AI-Powered Insights",
    description: "Get intelligent suggestions and insights based on your data patterns.",
    color: "bg-violet-500/10 text-violet-500",
  },
]

export function FeatureSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="features" className="w-full py-20 md:py-32 bg-muted/50 scroll-mt-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            ref={ref}
          >
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything You Need to Chat with Your Data
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Our platform provides a seamless experience for interacting with your database using natural language.
            </p>
          </motion.div>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative flex flex-col items-center rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
            >
              <div className={`mb-4 rounded-full p-3 ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-sm text-muted-foreground">{feature.description}</p>

              {/* Hover effect */}
              <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 blur transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>

        {/* Feature highlight */}
        <motion.div
          className="mt-16 rounded-xl border bg-card p-6 md:p-8 lg:p-10 shadow-lg overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Featured Capability
              </div>
              <h3 className="text-2xl font-bold sm:text-3xl">Natural Language to SQL Conversion</h3>
              <p className="text-muted-foreground">
                Our advanced AI understands your intent and automatically generates optimized SQL queries. No more
                complex syntax or database expertise required.
              </p>
              <ul className="space-y-2">
                {[
                  "Supports complex queries with joins and aggregations",
                  "Understands business context and terminology",
                  "Learns from your database schema automatically",
                  "Improves with usage over time",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary flex-shrink-0" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path
                        d="M8 12l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-lg border bg-card p-4 shadow-sm overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium">Natural Language to SQL</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="font-medium mb-1">User Query:</p>
                    <p className="text-muted-foreground">
                      Show me the top 5 customers who spent the most in the last quarter, along with their total
                      purchases and average order value
                    </p>
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="font-medium mb-1">Generated SQL:</p>
                    <pre className="text-xs overflow-x-auto p-2 bg-muted rounded">
                      <code>{`SELECT 
  c.name AS customer_name,
  c.email AS customer_email,
  COUNT(o.id) AS total_orders,
  SUM(o.amount) AS total_spent,
  AVG(o.amount) AS average_order_value
FROM 
  customers c
JOIN 
  orders o ON c.id = o.customer_id
WHERE 
  o.order_date >= DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
  AND o.order_date < DATE_TRUNC('quarter', CURRENT_DATE)
GROUP BY 
  c.id, c.name, c.email
ORDER BY 
  total_spent DESC
LIMIT 5;`}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* Animated gradient border */}
              <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-xl opacity-50" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

