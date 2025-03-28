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
  const { connectionId, query } = req.body;
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
        dialect: connection.type.toUpperCase()
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

        // Return only the explanation from the Python server response
        res.json({
          explanation: pythonData.explanation
        });

      } catch (error) {
        console.error('Error from Python server:', error);
        res.status(500).json({ error: 'Error processing query' });
      }
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Updated /api/schema/:connectionId endpoint remains as is (using db.promise())
app.get("/api/schema/:connectionId", verifyToken, async (req, res) => {
  try {
    console.log("Fetching schema...");
    const { connectionId } = req.params;
    const userId = req.user.userId; // Corrected from req.user.id

    // Use the promise interface of your db connection
    const promiseDb = db.promise();
    const [rows] = await promiseDb.query(
      "SELECT * FROM database_connections WHERE id = ? AND user_id = ?",
      [connectionId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Connection not found" });
    }

    // Assuming your schema uses 'connection_string' and 'type'
    const { connection_string, type } = rows[0];
    const dialect = type.toUpperCase(); // Modify this if needed

    // Forward request to Python FastAPI server
    const response = await fetch(
      `http://localhost:8000/schema?db_url=${encodeURIComponent(connection_string)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get schema");
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching schema:", error);
    res.status(500).json({ error: error.message });
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
