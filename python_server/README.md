# Text to SQL API

A FastAPI service for converting natural language queries to SQL and executing them against a database.

## Features

- Convert natural language to SQL queries using Google's Gemini AI
- Validate queries against database schema
- Execute SQL queries and return results
- Generate natural language explanations of query results
- Retrieve database schema information

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Create a `.env` file based on this template:
   ```
   # API Keys
   GEMINI_API_KEY=your_gemini_api_key_here

   # Model configuration
   GEMINI_MODEL=gemini-2.0-flash-lite-001

   # Service settings
   MAX_SQL_GENERATION_ATTEMPTS=5
   QUERY_VERIFICATION_ITERATIONS=3

   # Server settings
   HOST=0.0.0.0
   PORT=8001
   RELOAD=True
   ```

3. Run the server:
   ```
   python -m python_server.main
   ```

## API Endpoints

### Generate SQL Query

```
POST /generate
```

Request body:
```json
{
  "query": "Show me all customers from New York",
  "db_url": "sqlite:///example.db",
  "dialect": "SQLite"
}
```

Response:
```json
{
  "sql_query": "SELECT * FROM customers WHERE city = 'New York'",
  "columns": ["id", "name", "email", "city", "state"],
  "data": [
    {"id": 1, "name": "John Doe", "email": "john@example.com", "city": "New York", "state": "NY"},
    {"id": 5, "name": "Jane Smith", "email": "jane@example.com", "city": "New York", "state": "NY"}
  ],
  "explanation": "• There are 2 customers from New York\n• Their names are John Doe and Jane Smith\n• Their IDs are 1 and 5 respectively"
}
```

### Get Database Schema

```
GET /schema?db_url=sqlite:///example.db
```

Response:
```json
{
  "schema": {
    "customers": {
      "columns": ["id", "name", "email", "city", "state"],
      "primary_key": ["id"],
      "foreign_keys": {}
    },
    "orders": {
      "columns": ["id", "customer_id", "amount", "date"],
      "primary_key": ["id"],
      "foreign_keys": {
        "customer_id": "customers.id"
      }
    }
  }
}
```

## Dependencies

- FastAPI - Web framework
- SQLAlchemy - Database toolkit
- Google GenerativeAI - AI language model
- Haystack - Pipeline framework
- Pydantic - Data validation
- Uvicorn - ASGI server 