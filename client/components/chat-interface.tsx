"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  sql?: string
}

interface ColumnSchema {
  column_name: string
  data_type: string
  constraints: string[]
}

interface TableSchema {
  table_name: string
  columns: ColumnSchema[]
  primary_key: string[]
  foreign_keys: string[]
}

interface ServerSchema {
  schema: {
    [key: string]: {
      columns: string[]
      primary_key: string[]
      foreign_keys: {
        [key: string]: string
      }
    }
  }
}

interface ChatInterfaceProps {
  connectionId?: string
}

export function ChatInterface({ connectionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [schema, setSchema] = useState<TableSchema[]>([])
  const [isSchemaLoading, setIsSchemaLoading] = useState(false)
  const { toast } = useToast()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom effect
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // On component mount (or when connectionId changes), check localStorage and fetch schema if needed.
  useEffect(() => {
    if (connectionId && connectionId !== "new") {
      const storedSchema = localStorage.getItem(`schema_${connectionId}`)
      if (storedSchema) {
        try {
          const parsed = JSON.parse(storedSchema)
          setSchema(Array.isArray(parsed) ? parsed : [])
        } catch (e) {
          setSchema([])
        }
      } else {
        fetchSchema()
      }
    }
  }, [connectionId])

  // Initialize system message if none exist
  useEffect(() => {
    if (connectionId && messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "system",
          content: "Connected to your database. Ask me anything about your data!",
          timestamp: new Date(),
        },
      ])
    }
  }, [connectionId, messages.length])

  // If no connectionId is provided, show a message to select a connection
  if (!connectionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select a Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please select a database connection to start chatting.
          </p>
        </CardContent>
      </Card>
    )
  }

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

      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          connectionId,
          query: input,
        }),
      })

      const data = await response.json()
      console.log("Fetched schema data:", data)
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.error ||
          data.explanation ||
          "Sorry, I couldn't process your request.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSchema = async () => {
    if (!connectionId || connectionId === "new") return

    setIsSchemaLoading(true)
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

      const response = await fetch(`http://localhost:3001/api/schema/${connectionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error("Failed to fetch schema")
      }

      // Transform the schema data into the expected format
      const transformedSchema = Object.entries(data.schema).map(([table_name, table_info]: [string, any]) => {
        // Transform columns
        const columns = table_info.columns.map((column_name: string) => {
          const constraints = []
          // Add PRIMARY KEY constraint if column is in primary_key array
          if (table_info.primary_key.includes(column_name)) {
            constraints.push("PRIMARY KEY")
          }
          // Add FOREIGN KEY constraint if column has a foreign key
          if (table_info.foreign_keys[column_name]) {
            constraints.push(`FOREIGN KEY (${table_info.foreign_keys[column_name]})`)
          }
          return {
            column_name,
            data_type: "VARCHAR", // Since the schema doesn't provide data types, we'll use a default
            constraints
          }
        })

        // Transform foreign keys into array of strings
        const foreignKeys = Object.entries(table_info.foreign_keys).map(([key, value]) => `${key} -> ${value}`)

        return {
          table_name,
          columns,
          primary_key: table_info.primary_key,
          foreign_keys: foreignKeys
        }
      })

      setSchema(transformedSchema)
      localStorage.setItem(`schema_${connectionId}`, JSON.stringify(transformedSchema))
    } catch (error) {
      console.error("Schema fetch error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch schema",
        variant: "destructive",
      })
      setSchema([])
    } finally {
      setIsSchemaLoading(false)
    }
  }

  const handleSaveChat = async () => {
    if (!connectionId || connectionId === "new") {
      toast({
        title: "Error",
        description: "Please connect to a database first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to save chat.",
          variant: "destructive",
        });
        return;
      }

      // Get the first user message as the title
      const firstUserMessage = messages.find(m => m.role === "user")?.content || "New Chat";
      const title = firstUserMessage.length > 50 
        ? firstUserMessage.substring(0, 47) + "..." 
        : firstUserMessage;

      const response = await fetch("http://localhost:3001/api/chat-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          connectionId,
          title,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            sql: msg.sql
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save chat");
      }

      toast({
        title: "Success",
        description: "Chat session saved successfully!",
      });
    } catch (error) {
      console.error("Error saving chat:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
          </TabsList>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto"
            onClick={handleSaveChat}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Chat
          </Button>
        </div>

        {/* ---------- CHAT TAB ---------- */}
        <TabsContent value="chat" className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="p-3 sm:p-4 border-b flex-none">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">
                  {connectionId === "new" ? "New Chat" : `Chat #${connectionId}`}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent
              ref={chatContainerRef}
              className="flex-1 p-3 sm:p-4 overflow-y-auto"
            >
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
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
                      <div className="mt-1 text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
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
                {/* Invisible div to scroll to bottom */}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="p-3 sm:p-4 border-t flex-none">
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Ask a question about your database..."
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

        {/* ---------- SCHEMA TAB ---------- */}
        <TabsContent value="schema" className="h-full">
          <Card className="h-full overflow-hidden transition-theme">
            <CardHeader className="p-3 sm:p-4 border-b">
              <CardTitle className="text-base sm:text-lg">Database Schema</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 overflow-auto h-[calc(100%-5rem)]">
              {isSchemaLoading ? (
                // Loading Indicator
                <div className="flex items-center justify-center h-full">
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
              ) : schema.length === 0 ? (
                // Empty or missing schema
                <p className="text-sm text-muted-foreground">
                  No schema found or schema is empty.
                </p>
              ) : (
                // Render each table with columns, plus primary/foreign keys if available
                <div className="space-y-6">
                  {schema.map((table) => {
                    // Safely handle missing fields
                    const columns = table.columns || []
                    const primaryKey = table.primary_key || []
                    const foreignKeys = table.foreign_keys || []

                    return (
                      <div key={table.table_name} className="mb-4">
                        {/* Table Name */}
                        <h3 className="text-base sm:text-lg font-medium mb-2">
                          {table.table_name}
                        </h3>

                        {/* Primary Key (if present) */}
                        {primaryKey.length > 0 && (
                          <p className="text-sm mb-1">
                            <strong>Primary Key:</strong> {primaryKey.join(", ")}
                          </p>
                        )}

                        {/* Foreign Keys (if present) */}
                        {foreignKeys.length > 0 && (
                          <p className="text-sm mb-1">
                            <strong>Foreign Keys:</strong> {foreignKeys.join(", ")}
                          </p>
                        )}

                        {/* Columns Table */}
                        {columns.length > 0 ? (
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
                                {columns.map((col) => (
                                  <tr
                                    key={col.column_name}
                                    className="border-t dark:border-border"
                                  >
                                    <td className="p-2">{col.column_name}</td>
                                    <td className="p-2">{col.data_type}</td>
                                    <td className="p-2">
                                      {Array.isArray(col.constraints)
                                        ? col.constraints.join(", ")
                                        : ""}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-2">
                            No columns found for this table.
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
