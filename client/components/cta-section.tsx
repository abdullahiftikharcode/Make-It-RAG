"use client"

import { useRef } from "react"
import { useInView } from "framer-motion"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="w-full py-20 md:py-32 bg-primary/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          ref={ref}
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Transform How You Work with Data?
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed">
              Join thousands of data professionals who are already using SQL Chat Assistant to simplify their database
              interactions.
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

          <div className="text-sm text-muted-foreground">No credit card required. Start with our free plan today.</div>
        </motion.div>
      </div>
    </section>
  )
}

