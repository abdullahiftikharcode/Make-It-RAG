"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language = "sql" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-4 rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b dark:border-border">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={copyToClipboard}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto bg-muted text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}

