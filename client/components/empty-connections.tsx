"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export function EmptyConnections() {
  const container = useRef<HTMLDivElement>(null)
  const anim = useRef<any>(null)

  useEffect(() => {
    import('lottie-web').then((Lottie) => {
      if (container.current) {
        anim.current = Lottie.default.loadAnimation({
          container: container.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          // This is a nice database/connection animation
          path: "https://lottie.host/2f1445d4-4b3e-4fbe-96d2-ee5d83dfa1ec/YmBvSTbO0l.json",
        })
      }
    })

    return () => {
      if (anim.current) {
        anim.current.destroy()
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div ref={container} className="w-64 h-64 mb-8" />
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