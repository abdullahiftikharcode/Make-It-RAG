"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Database } from "lucide-react"

export function EmptyConnections() {
  const container = useRef<HTMLDivElement>(null)
  const anim = useRef<any>(null)
  const [animationFailed, setAnimationFailed] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadAnimation = async () => {
      try {
        const Lottie = (await import('lottie-web')).default
        if (!mounted || !container.current) return

        anim.current = Lottie.loadAnimation({
          container: container.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "/animations/empty-db.json",
          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
            progressiveLoad: true,
          }
        })

        anim.current.addEventListener('data_failed', () => {
          if (mounted) setAnimationFailed(true)
        })

      } catch (error) {
        if (mounted) setAnimationFailed(true)
        console.error('Failed to load animation:', error)
      }
    }

    loadAnimation()

    return () => {
      mounted = false
      if (anim.current) {
        anim.current.destroy()
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      {animationFailed ? (
        <div className="w-64 h-64 mb-8 flex items-center justify-center">
          <Database className="w-24 h-24 text-muted-foreground animate-bounce" />
        </div>
      ) : (
        <div ref={container} className="w-64 h-64 mb-8" />
      )}
      <h3 className="text-2xl font-semibold tracking-tight mb-2">No Connections Yet</h3>
      <p className="text-muted-foreground mb-8">
        Get started by connecting your first database. It only takes a minute!
      </p>
      <Link href="/dashboard/connections/new">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Connection
        </Button>
      </Link>
    </div>
  )
} 