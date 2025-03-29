const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js'); 
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Load your private key from a file
const privateKey = fs.readFileSync(path.join(__dirname, 'private.key'), 'utf8');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
db.connect((err) => {
  if (err) {
      console.error('Error connecting to MySQL:', err.code, err.sqlMessage);
      return;
  }
  console.log('Connected to MySQL');
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, privateKey, { algorithms: ['RS256'] });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Token validation endpoint
app.get('/validate-token', verifyToken, (req, res) => {
  // If we get here, the token is valid
  res.json({ 
    message: 'Token is valid',
    user: {
      userId: req.user.userId,
      role: req.user.role
    }
  });
});

// New database connection endpoint
app.post('/api/connections', verifyToken, async (req, res) => {
  const { name, type, connectionString } = req.body;
  const userId = req.user.userId;

  // Validate required fields
  if (!name || !type || !connectionString) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate database type
  const validTypes = ['postgresql', 'mysql', 'sqlserver'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid database type' });
  }

  try {
    // Generate a unique ID for the connection
    const connectionId = uuidv4();

    // Insert the new connection
    const query = `
      INSERT INTO database_connections 
      (id, user_id, name, type, connection_string, is_active)
      VALUES (?, ?, ?, ?, ?, true)
    `;

    db.query(query, [connectionId, userId, name, type, connectionString], (err, results) => {
      if (err) {
        console.error('Error creating connection:', err);
        return res.status(500).json({ error: 'Error creating database connection' });
      }

      res.json({
        message: 'Database connection created successfully',
        connection: {
          id: connectionId,
          name,
          type,
          isActive: true
        }
      });
    });
  } catch (error) {
    console.error('Error in connection creation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  
  // Basic input validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if user already exists using the email
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const passwordHash = CryptoJS.SHA256(password).toString();
    const userId = uuidv4();

    // Insert the new user
    const insertQuery = `
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (?, ?, ?, ?, 'user')
    `;
    
    db.query(insertQuery, [userId, name, email, passwordHash], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error creating user' });
      }

      // Create default user settings
      const settingsQuery = `
        INSERT INTO user_settings (user_id)
        VALUES (?)
      `;
      db.query(settingsQuery, [userId], (err) => {
        if (err) {
          console.error('Error creating user settings:', err);
        }
      });

      // Generate a JWT token for the new user
      const token = jwt.sign(
        { userId, role: 'user' },
        privateKey,
        { algorithm: 'RS256', expiresIn: '1h' }
      );

      res.json({
        message: 'User created successfully',
        user: {
          userId,
          name,
          email,
          role: 'user'
        },
        token
      });
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Hash the provided password
  const passwordHash = CryptoJS.SHA256(password).toString();

  // Query to fetch the user
  const query = `
    SELECT id, name, email, role, is_active 
    FROM users 
    WHERE email = ? AND password_hash = ?
  `;

  db.query(query, [email, passwordHash], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length > 0) {
      const user = results[0];
      
      if (!user.is_active) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      // Update last login timestamp
      const updateQuery = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
      db.query(updateQuery, [user.id]);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        privateKey,
        { algorithm: 'RS256', expiresIn: '1h' }
      );

      res.json({
        message: 'Successfully logged in',
        token,
        user: {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Chat endpoint
app.post('/api/chat', verifyToken, async (req, res) => {
  const { connectionId, query, sessionId, settings } = req.body;
  const userId = req.user.userId;

  if (!connectionId || !query) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get connection details from database
    const connectionQuery = `
      SELECT connection_string, type 
      FROM database_connections 
      WHERE id = ? AND user_id = ? AND is_active = true
    `;

    db.query(connectionQuery, [connectionId, userId], async (err, results) => {
      if (err) {
        console.error('Error fetching connection:', err);
        return res.status(500).json({ error: 'Error fetching connection details' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Connection not found or inactive' });
      }

      const connection = results[0];
      
      // Prepare request to Python FastAPI server
      const pythonRequest = {
        query: query,
        db_url: connection.connection_string,
        dialect: connection.type.toUpperCase(),
        settings: {
          query_timeout: settings?.query_timeout || 30
        }
      };

      try {
        // Forward request to Python FastAPI server
        const pythonResponse = await fetch('http://localhost:8000/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pythonRequest)
        });

        const pythonData = await pythonResponse.json();

        if (!pythonResponse.ok) {
          throw new Error(pythonData.error || 'Error from Python server');
        }

        // Start a transaction
        db.beginTransaction(async (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error starting transaction' });
          }

          let currentSessionId = sessionId;

          // If no sessionId provided, create a new session
          if (!currentSessionId) {
            currentSessionId = uuidv4();
            const title = query.length > 50 ? query.substring(0, 47) + "..." : query;

            const sessionQuery = `
              INSERT INTO chat_sessions 
              (id, user_id, connection_id, title)
              VALUES (?, ?, ?, ?)
            `;

            await new Promise((resolve, reject) => {
              db.query(sessionQuery, [currentSessionId, userId, connectionId, title], (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          }

          // Insert the user's message first
          const userMessageId = uuidv4();
          const userMessageQuery = `
            INSERT INTO chat_messages 
            (id, session_id, role, content, sql_query, created_at)
            VALUES (?, ?, ?, ?, NULL, NOW())
          `;

          await new Promise((resolve, reject) => {
            db.query(userMessageQuery, [userMessageId, currentSessionId, 'user', query], (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });

          // Then insert the assistant's response
          const assistantMessageId = uuidv4();
          const assistantMessageQuery = `
            INSERT INTO chat_messages 
            (id, session_id, role, content, sql_query, created_at)
            VALUES (?, ?, ?, ?, ?, NOW() + INTERVAL 1 SECOND)
          `;

          await new Promise((resolve, reject) => {
            db.query(
              assistantMessageQuery,
              [
                assistantMessageId,
                currentSessionId,
                'assistant',
                pythonData.explanation,
                settings?.show_sql_queries ? pythonData.sql_query : null
              ],
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });

          // Commit the transaction
          db.commit((err) => {
            if (err) {
              db.rollback(() => {
                console.error('Error committing transaction:', err);
                return res.status(500).json({ error: 'Error saving messages' });
              });
              return;
            }

            // Return the response with sessionId
        res.json({
              explanation: pythonData.explanation,
              sql_query: settings?.show_sql_queries ? pythonData.sql_query : null,
              sessionId: currentSessionId
            });
          });
        });

      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Error processing query' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Error processing query' });
  }
});

// Updated /api/schema/:connectionId endpoint with better timeout handling
app.get("/api/schema/:connectionId", verifyToken, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.userId;

    const promiseDb = db.promise();
    const [rows] = await promiseDb.query(
      "SELECT * FROM database_connections WHERE id = ? AND user_id = ?",
      [connectionId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Connection not found" });
    }

    const { connection_string, type } = rows[0];
    const dialect = type.toUpperCase();

    try {
      // Forward request to Python FastAPI server with both db_url and dialect
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      try {
    const response = await fetch(
      `http://localhost:8000/schema?db_url=${encodeURIComponent(connection_string)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
            signal: controller.signal
      }
    );

        clearTimeout(timeout);
    const data = await response.json();

    if (!response.ok) {
          throw new Error(data.error || "Failed to get schema from Python server");
        }

        // Update last_used timestamp for the connection
        await promiseDb.query(
          "UPDATE database_connections SET last_used = NOW() WHERE id = ?",
          [connectionId]
        );

    res.json(data);
      } catch (error) {
        if (error.name === 'AbortError') {
          return res.status(504).json({
            error: "Schema fetch timed out",
            details: "The database took too long to respond. This might happen if the database is under heavy load or if there are many tables to analyze."
          });
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    } catch (pythonError) {
      console.error("Error from Python server:", pythonError);
      // Check if Python server is not running
      if (pythonError.name === 'TypeError' && pythonError.message.includes('Failed to fetch')) {
        return res.status(503).json({ 
          error: "Database service is not available",
          details: "The schema service requires the Python FastAPI server to be running on port 8000."
        });
      }
      // Handle other Python server errors
      return res.status(500).json({
        error: "Failed to fetch schema",
        details: pythonError.message || "An error occurred while fetching the database schema."
      });
    }
  } catch (error) {
    console.error("Error fetching schema:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: "There was an error processing your request. Please try again later."
    });
  }
});

// Updated /api/connections endpoint using db.promise() instead of pool.query()
app.get("/api/connections", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    // Use the promise interface from your db connection
    const promiseDb = db.promise();
    const [rows] = await promiseDb.query(
      `SELECT 
          id,
          name,
          connection_string,
          type AS dialect,
          created_at,
          last_used,
          is_active
       FROM database_connections
       WHERE user_id = ?
       ORDER BY last_used DESC, created_at DESC`,
      [userId]
    );

    // Transform the data to include dummy fields
    const connections = rows.map(connection => ({
      id: connection.id,
      name: connection.name,
      connectionString: connection.connection_string,
      dialect: connection.dialect,
      createdAt: connection.created_at,
      lastUsed: connection.last_used,
      isActive: connection.is_active,
      // Dummy fields (adjust as needed)
      size: "1.2 GB",
      version: "14.5",
      queries: 156,
      tables: 24,
    }));

    res.json(connections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE endpoint for a connection (MySQL version)
app.delete("/api/connections/:connectionId", verifyToken, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.userId || req.user.id; // Ensure we get the user ID

    // Use promise interface for MySQL from your db connection
    const promiseDb = db.promise();
    const [result] = await promiseDb.query(
      "DELETE FROM database_connections WHERE id = ? AND user_id = ?",
      [connectionId, userId]
    );

    // Check result.affectedRows to see if a row was deleted
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Connection not found" });
    }

    res.json({ message: "Connection deleted successfully" });
  } catch (error) {
    console.error("Error deleting connection:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/profile endpoint to fetch user profile details
app.get('/api/profile', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const query = `
    SELECT id, name, email, bio, company, 
           IF(image IS NOT NULL, CONCAT('data:image/jpeg;base64,', TO_BASE64(image)), null) as image
    FROM users
    WHERE id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).json({ error: 'Error fetching profile.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(results[0]);
  });
});

// PUT /api/profile endpoint to update user profile details
app.put('/api/profile', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const { firstName, lastName, email, bio, company, image } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Missing required fields: firstName, lastName, and email are required.' });
  }

  // Combine first and last name for the users.name column
  const name = `${firstName} ${lastName}`;

  // Process the image field:
  // If an image is provided, remove any data URI prefix and convert to a Buffer.
  let imageBuffer = null;
  if (image) {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    imageBuffer = Buffer.from(base64Data, 'base64');
  }

  const updateQuery = `
    UPDATE users
    SET name = ?,
        email = ?,
        bio = ?,
        company = ?,
        image = ?
    WHERE id = ?
  `;

  db.query(updateQuery, [name, email, bio, company, imageBuffer, userId], (err, result) => {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ error: 'Error updating profile.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: 'Profile updated successfully.' });
  });
});


// Add new endpoint to save chat session
app.post('/api/chat-sessions', verifyToken, async (req, res) => {
  const { connectionId, title, messages } = req.body;
  const userId = req.user.userId;

  if (!connectionId || !title || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Start a transaction
    db.beginTransaction(async (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error starting transaction' });
      }

      // Generate a unique ID for the chat session
      const sessionId = uuidv4();

      // Insert the chat session
      const sessionQuery = `
        INSERT INTO chat_sessions 
        (id, user_id, connection_id, title)
        VALUES (?, ?, ?, ?)
      `;

      db.query(sessionQuery, [sessionId, userId, connectionId, title], async (err) => {
        if (err) {
          db.rollback(() => {
            console.error('Error creating chat session:', err);
            res.status(500).json({ error: 'Error creating chat session' });
          });
          return;
        }

        // Insert all messages
        const messageQuery = `
          INSERT INTO chat_messages 
          (id, session_id, role, content, sql_query)
          VALUES (?, ?, ?, ?, ?)
        `;

        let messageError = null;
        for (const message of messages) {
          const messageId = uuidv4();
          await new Promise((resolve, reject) => {
            db.query(
              messageQuery,
              [
                messageId,
                sessionId,
                message.role,
                message.content,
                message.sql || null
              ],
              (err) => {
                if (err) {
                  messageError = err;
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });

          if (messageError) {
            db.rollback(() => {
              console.error('Error inserting message:', messageError);
              res.status(500).json({ error: 'Error saving chat messages' });
            });
            return;
          }
        }

        // Commit the transaction
        db.commit((err) => {
          if (err) {
            db.rollback(() => {
              console.error('Error committing transaction:', err);
              res.status(500).json({ error: 'Error saving chat session' });
            });
            return;
          }

          res.json({
            message: 'Chat session saved successfully',
            sessionId
          });
        });
      });
    });
  } catch (error) {
    console.error('Error in chat session creation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add endpoint to fetch a chat session by ID
app.get('/api/chat-sessions/:sessionId', verifyToken, async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.userId;
  try {
    // Revised query with clearer aliases
    const sessionQuery = `
      SELECT 
        cs.id AS sessionId,
        cs.title,
        cs.created_at,
        cs.updated_at,
        dc.id AS connectionId,
        dc.name AS connectionName,
        dc.connection_string AS connectionString,
        dc.type AS connectionType
      FROM chat_sessions cs
      JOIN database_connections dc ON cs.connection_id = dc.id
      WHERE cs.id = ? AND cs.user_id = ?
    `;

    db.query(sessionQuery, [sessionId, userId], async (err, results) => {
      if (err) {
        console.error('Error fetching chat session:', err);
        return res.status(500).json({ error: 'Error fetching chat session' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Chat session not found' });
      }

      const session = results[0];

      // Fetch all messages for this session
      const messagesQuery = `
        SELECT id, role, content, sql_query, created_at
        FROM chat_messages
        WHERE session_id = ?
        ORDER BY created_at ASC, id ASC
      `;

      db.query(messagesQuery, [sessionId], (err, messages) => {
        if (err) {
          console.error('Error fetching messages:', err);
          return res.status(500).json({ error: 'Error fetching messages' });
        }

        res.json({
          sessionId: session.sessionId,
          title: session.title,
          connectionId: session.connectionId,
          connectionName: session.connectionName,
          connectionString: session.connectionString,
          connectionType: session.connectionType,
          createdAt: session.created_at,
          updatedAt: session.updated_at,
          messages: messages
        });
      });
    });
  } catch (error) {
    console.error('Error in chat session fetch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add endpoint to fetch chat sessions for a specific connection
app.get('/api/chat-sessions/connection/:connectionId', verifyToken, async (req, res) => {
  const { connectionId } = req.params;
  const userId = req.user.userId;

  try {
    // Verify that the connection belongs to the user
    const connectionQuery = `
      SELECT id FROM database_connections 
      WHERE id = ? AND user_id = ? AND is_active = true
    `;

    db.query(connectionQuery, [connectionId, userId], async (err, results) => {
      if (err) {
        console.error('Error verifying connection:', err);
        return res.status(500).json({ error: 'Error verifying connection' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Connection not found or inactive' });
      }

      // Fetch all chat sessions for this connection
      const sessionsQuery = `
        SELECT 
          cs.id,
          cs.title,
          cs.created_at,
          cs.updated_at,
          dc.name as connection_name,
          (
            SELECT content 
            FROM chat_messages 
            WHERE session_id = cs.id AND role = 'user' 
            ORDER BY created_at ASC 
            LIMIT 1
          ) as first_query,
          (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as message_count
        FROM chat_sessions cs
        JOIN database_connections dc ON cs.connection_id = dc.id
        WHERE cs.connection_id = ?
        ORDER BY cs.updated_at DESC
      `;

      db.query(sessionsQuery, [connectionId], (err, sessions) => {
        if (err) {
          console.error('Error fetching chat sessions:', err);
          return res.status(500).json({ error: 'Error fetching chat sessions' });
        }

        res.json({ sessions });
      });
    });
  } catch (error) {
    console.error('Error in chat sessions fetch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all chat sessions for the user
app.get('/api/chat-sessions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Query to get all chat sessions with connection names and message counts
    const query = `
    SELECT 
      cs.id,
      cs.title,
      cs.created_at,
      cs.updated_at,
      dc.name as connection_name,
      (
        SELECT content 
        FROM chat_messages 
        WHERE session_id = cs.id AND role = 'user' 
        ORDER BY created_at ASC 
        LIMIT 1
      ) as first_query,
      (
        SELECT COUNT(*) 
        FROM chat_messages 
        WHERE session_id = cs.id
      ) as message_count
    FROM chat_sessions cs
    JOIN database_connections dc ON cs.connection_id = dc.id
    WHERE cs.user_id = ?
    ORDER BY cs.updated_at DESC
  `;
  
    db.query(query, [userId], (err, sessions) => {
      if (err) {
        console.error('Error fetching chat sessions:', err);
        return res.status(500).json({ error: 'Failed to fetch chat sessions' });
      }
      res.json({ sessions });
    });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// Get user settings
app.get('/api/settings', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const query = `
      SELECT query_timeout, show_sql_queries, theme
      FROM user_settings
      WHERE user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user settings:', err);
        return res.status(500).json({ error: 'Error fetching user settings' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'User settings not found' });
      }

      res.json(results[0]);
    });
  } catch (error) {
    console.error('Error in settings fetch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user settings
app.put('/api/settings', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query_timeout, show_sql_queries, theme } = req.body;

    const query = `
      UPDATE user_settings
      SET 
        query_timeout = ?,
        show_sql_queries = ?,
        theme = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;

    db.query(
      query,
      [query_timeout, show_sql_queries, theme, userId],
      (err, results) => {
        if (err) {
          console.error('Error updating user settings:', err);
          return res.status(500).json({ error: 'Error updating user settings' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'User settings not found' });
        }

        res.json({ message: 'Settings updated successfully' });
      }
    );
  } catch (error) {
    console.error('Error in settings update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add endpoint to reconnect to a database
app.post('/api/connections/:connectionId/reconnect', verifyToken, async (req, res) => {
  const { connectionId } = req.params;
  const userId = req.user.userId;

  try {
    // First verify that the connection belongs to the user
    const connectionQuery = `
      SELECT * FROM database_connections 
      WHERE id = ? AND user_id = ?
    `;

    db.query(connectionQuery, [connectionId, userId], async (err, results) => {
      if (err) {
        console.error('Error verifying connection:', err);
        return res.status(500).json({ error: 'Error verifying connection' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Connection not found' });
      }

      const connection = results[0];

      // Test the connection by trying to fetch the schema
      try {
        const response = await fetch(
          `http://localhost:8000/schema?db_url=${encodeURIComponent(connection.connection_string)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(10000)
          }
        );

        if (!response.ok) {
          throw new Error('Failed to connect to database');
        }

        // If we get here, the connection is working, so update it to active
        const updateQuery = `
          UPDATE database_connections 
          SET is_active = true, last_used = NOW() 
          WHERE id = ?
        `;

        db.query(updateQuery, [connectionId], (err, result) => {
          if (err) {
            console.error('Error updating connection:', err);
            return res.status(500).json({ error: 'Error updating connection status' });
          }

          res.json({ 
            message: 'Connection reactivated successfully',
            connection: {
              id: connection.id,
              name: connection.name,
              type: connection.type,
              isActive: true
            }
          });
        });
      } catch (error) {
        console.error('Error testing connection:', error);
        res.status(400).json({ 
          error: 'Failed to reconnect',
          details: 'Could not establish a connection to the database. Please verify your connection details.'
        });
      }
    });
  } catch (error) {
    console.error('Error in connection reconnect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
