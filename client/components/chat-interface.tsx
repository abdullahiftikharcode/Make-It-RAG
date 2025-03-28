"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Save } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  sql?: string
}

interface ChatInterfaceProps {
  connectionId: string
}

export function ChatInterface({ connectionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: "Connected to your database. Ask me anything about your data!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate API call to get response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Based on your database, here are the results:",
        timestamp: new Date(),
        sql: "SELECT * FROM users WHERE last_login > NOW() - INTERVAL '7 days' ORDER BY last_login DESC LIMIT 5;",
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="grid h-[calc(100vh-13rem)] grid-rows-[auto_1fr]">
      <Tabs defaultValue="chat">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Save Chat
          </Button>
        </div>
        <TabsContent value="chat" className="h-full flex flex-col">
          <Card className="flex-1 overflow-hidden transition-theme">
            <CardHeader className="p-3 sm:p-4 border-b">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">
                  {connectionId === "new" ? "New Chat" : `Chat #${connectionId}`}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 overflow-auto h-[calc(100%-8rem)]">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[90%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.role === "system"
                            ? "bg-muted text-muted-foreground"
                            : "bg-card border dark:border-border"
                      }`}
                    >
                      <p className="text-sm sm:text-base">{message.content}</p>
                      {message.sql && (
                        <div className="mt-2 pt-2 border-t dark:border-border text-xs sm:text-sm">
                          <p className="font-mono text-xs opacity-80">SQL Query:</p>
                          <pre className="bg-muted p-2 rounded-md mt-1 overflow-x-auto text-xs">
                            <code>{message.sql}</code>
                          </pre>
                        </div>
                      )}
                      <div className="mt-1 text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 bg-card border dark:border-border">
                      <div className="flex space-x-2 items-center">
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                        <div
                          className="h-2 w-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="h-2 w-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-3 sm:p-4 border-t">
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Ask a question..."
                  className="text-sm sm:text-base"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="sm:size-default"
                >
                  Send
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="h-full">
          <Card className="h-full overflow-hidden transition-theme">
            <CardHeader className="p-3 sm:p-4 border-b">
              <CardTitle className="text-base sm:text-lg">Database Schema</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 overflow-auto h-[calc(100%-5rem)]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">users</h3>
                  <div className="border rounded-md overflow-x-auto dark:border-border">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left font-medium">Column</th>
                          <th className="p-2 text-left font-medium">Type</th>
                          <th className="p-2 text-left font-medium">Constraints</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t dark:border-border">
                          <td className="p-2">id</td>
                          <td className="p-2">uuid</td>
                          <td className="p-2">PRIMARY KEY</td>
                        </tr>
                        <tr className="border-t dark:border-border">
                          <td className="p-2">name</td>
                          <td className="p-2">varchar(255)</td>
                          <td className="p-2">NOT NULL</td>
                        </tr>
                        <tr className="border-t dark:border-border">
                          <td className="p-2">email</td>
                          <td className="p-2">varchar(255)</td>
                          <td className="p-2">UNIQUE, NOT NULL</td>
                        </tr>
                        <tr className="border-t dark:border-border">
                          <td className="p-2">created_at</td>
                          <td className="p-2">timestamp</td>
                          <td className="p-2">NOT NULL</td>
                        </tr>
                        <tr className="border-t dark:border-border">
                          <td className="p-2">last_login</td>
                          <td className="p-2">timestamp</td>
                          <td className="p-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">orders</h3>
                  <div className="border rounded-md overflow-x-auto dark:border-border">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left font-medium">Column</th>
                          <th className="p-2 text-left font-medium">Type</th>
                          <th className="p-2 text-left font-medium">Constraints</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t dark:border-border">
                          <td className="p-2">id</td>
                          <td className="p-2">uuid</td>
                          <td className="p-2">PRIMARY KEY</td>
                        </tr>
                        <tr className="border-t dark:border-border">
                          <td className="p-2">user_id</td>
                          <td className="p-2">uuid</td>
                          <td className="p-2">FOREIGN KEY (users.id)</td>
                        </tr>
                        <tr className="border-t dark:border-border">
                          <td className="p-2">amount</td>
                          <td className="p-2">decimal(10,2)</td>
                          <td className="p-2">NOT NULL</td>
                        </tr>
                        <tr className="border-t dark:border-border">
                          <td className="p-2">created_at</td>
                          <td className="p-2">timestamp</td>
                          <td className="p-2">NOT NULL</td>
                        </tr>
                        <tr className="border-t dark:border-border">
                          <td className="p-2">status</td>
                          <td className="p-2">varchar(50)</td>
                          <td className="p-2">NOT NULL</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

