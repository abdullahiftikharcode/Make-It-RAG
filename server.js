// Add new endpoint to get database schema
app.get("/api/schema/:connectionId", verifyToken, async (req, res) => {
  try {
    const { connectionId } = req.params
    const userId = req.user.id

    // Get connection details from database
    const connection = await pool.query(
      "SELECT * FROM database_connections WHERE id = $1 AND user_id = $2",
      [connectionId, userId]
    )

    if (connection.rows.length === 0) {
      return res.status(404).json({ error: "Connection not found" })
    }

    const { connection_string, dialect } = connection.rows[0]

    // Forward request to Python FastAPI server
    const response = await fetch("http://localhost:8000/schema", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        connection_string,
        dialect,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to get schema")
    }

    res.json(data)
  } catch (error) {
    console.error("Error fetching schema:", error)
    res.status(500).json({ error: error.message })
  }
})

// Add function to update connection's last used timestamp
async function updateConnectionLastUsed(connectionId, userId) {
  try {
    await pool.query(
      "UPDATE database_connections SET last_used = NOW() WHERE id = $1 AND user_id = $2",
      [connectionId, userId]
    )
  } catch (error) {
    console.error("Error updating connection last used:", error)
  }
}

// Update the chat endpoint to update last used timestamp
app.post("/api/chat", verifyToken, async (req, res) => {
  try {
    const { connectionId, query } = req.body
    const userId = req.user.id

    // Get connection details from database
    const connection = await pool.query(
      "SELECT * FROM database_connections WHERE id = $1 AND user_id = $2",
      [connectionId, userId]
    )

    if (connection.rows.length === 0) {
      return res.status(404).json({ error: "Connection not found" })
    }

    const { connection_string, dialect } = connection.rows[0]

    // Forward request to Python FastAPI server
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        connection_string,
        dialect,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to get response")
    }

    // Update last used timestamp after successful query
    await updateConnectionLastUsed(connectionId, userId)

    res.json(data)
  } catch (error) {
    console.error("Error processing chat:", error)
    res.status(500).json({ error: error.message })
  }
})

// Add new endpoint to get all connections for a user
app.get("/api/connections", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id

    // Get all connections for the user
    const result = await pool.query(
      `SELECT 
        id,
        name,
        connection_string,
        dialect,
        created_at,
        last_used,
        is_active
      FROM database_connections 
      WHERE user_id = $1 
      ORDER BY last_used DESC NULLS LAST, created_at DESC`,
      [userId]
    )

    // Transform the data to match the expected format
    const connections = result.rows.map(connection => ({
      id: connection.id,
      name: connection.name,
      connectionString: connection.connection_string,
      dialect: connection.dialect,
      createdAt: connection.created_at,
      lastUsed: connection.last_used,
      isActive: connection.is_active,
      // Add default values for fields that don't exist in database
      size: "0 MB",
      version: "Unknown",
      queries: 0,
      tables: 0
    }))

    res.json(connections)
  } catch (error) {
    console.error("Error fetching connections:", error)
    res.status(500).json({ error: error.message })
  }
})

// Add new endpoint to delete a connection
app.delete("/api/connections/:connectionId", verifyToken, async (req, res) => {
  try {
    const { connectionId } = req.params
    const userId = req.user.id

    // Delete the connection
    const result = await pool.query(
      "DELETE FROM database_connections WHERE id = $1 AND user_id = $2 RETURNING id",
      [connectionId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Connection not found" })
    }

    res.json({ message: "Connection deleted successfully" })
  } catch (error) {
    console.error("Error deleting connection:", error)
    res.status(500).json({ error: error.message })
  }
}) 