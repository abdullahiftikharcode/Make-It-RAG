"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Edit, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Connection {
  id: string;
  name: string;
  connectionString: string;
  dialect: string;
  createdAt: string;
  lastUsed: string;
  isActive: boolean;
  size: string;
  version: string;
  queries: number;
  tables: number;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // Function to fetch connections from the server
  useEffect(() => {
    const fetchConnections = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        return;
      }
      try {
        const response = await fetch("http://localhost:3001/api/connections", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch connections");
        }
        const data = await response.json();
        setConnections(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch connections",
          variant: "destructive",
        });
      }
    };

    fetchConnections();
  }, [toast]);

  // Handler to delete a connection
  const handleDelete = async (connectionId: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast({
        title: "Error",
        description: "Please log in to continue.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/connections/${connectionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete connection");
      }
      // Remove deleted connection from the state
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      toast({
        title: "Success",
        description: data.message || "Connection deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete connection",
        variant: "destructive",
      });
    }
  };

  // Handler to start a new chat session for a connection
  const handleStartChat = async (connectionId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        return;
      }
      // Create a new chat session via the API.
      // We use an empty messages array (or you could include a default system message) and a default title.
      const response = await fetch("http://localhost:3001/api/chat-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          connectionId,
          title: "New Chat",
          messages: [] // You can provide an initial message if desired
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to start chat session");
      }
      // Navigate to the chat page using the newly created session ID.
      router.push(`/dashboard/chat/${connectionId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start chat session",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="Database Connections" text="Manage your database connections.">
        <Link href="/dashboard/connections/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Connection
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection) => (
          <Card key={connection.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">{connection.name}</CardTitle>
                <div
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    connection.isActive ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
                  }`}
                >
                  {connection.isActive ? "Connected" : "Disconnected"}
                </div>
              </div>
              <CardDescription>
                {connection.dialect} • Last used {connection.lastUsed}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs sm:text-sm text-muted-foreground truncate">
                  {connection.connectionString}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground">Tables:</span>
                  <span className="ml-1 font-medium">{connection.tables}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-1 font-medium">{connection.size}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Queries:</span>
                  <span className="ml-1 font-medium">{connection.queries}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Version:</span>
                  <span className="ml-1 font-medium">{connection.version}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-3">
              <Button variant="outline" size="sm" onClick={() => handleStartChat(connection.id)}>
                Chat
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDelete(connection.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
