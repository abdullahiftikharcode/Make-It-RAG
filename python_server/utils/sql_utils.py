import re
import logging
from sqlalchemy import create_engine, MetaData, text, exc, inspect
import urllib.parse
from urllib.parse import quote_plus, unquote

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def remove_markdown_code_fence(sql_query: str) -> str:
    """Remove markdown code fences from SQL query strings."""
    if sql_query.startswith("```"):
        lines = sql_query.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        sql_query = "\n".join(lines)
    return sql_query.strip()

def clean_sql_query(sql_query: str) -> str:
    """Clean up SQL query formatting by removing excess whitespace."""
    cleaned = re.sub(r'[\n\t]', ' ', sql_query)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def format_connection_string(db_url: str) -> str:
    """
    Format the database connection string to handle special characters and ngrok URLs.
    """
    try:
        logger.info(f"Decoded URL: {db_url}")
        
        # Handle ngrok URLs specifically
        if "ngrok.io" in db_url:
            # Extract the port number from the ngrok URL
            parts = db_url.split('@')
            if len(parts) == 2:
                credentials = parts[0]
                host_part = parts[1]
                
                # Split host part to get port and database
                host_parts = host_part.split('/')
                if len(host_parts) >= 2:
                    host_port = host_parts[0]
                    database = host_parts[1]
                    
                    # Extract the actual host and port
                    host = host_port.split(':')[0]
                    port = host_port.split(':')[1]
                    
                    # Reconstruct the URL with proper host
                    formatted_url = f"{credentials}@{host}:{port}/{database}"
                    logger.info(f"Reformatted ngrok URL: {formatted_url}")
                    return formatted_url
        
        return db_url
        
    except Exception as e:
        logger.error(f"Error formatting connection string: {str(e)}")
        return db_url

def get_db_schema(db_url: str) -> dict:
    """
    Get the schema of a database given its connection string.
    """
    try:
        # Format the connection string
        db_url = format_connection_string(db_url)
        logger.info("Using formatted MySQL connection string")
        
        # Setup SSL for MySQL connections
        connect_args = {}
        if "mysql" in db_url.lower():
            connect_args = {
                "ssl": {
                    "ssl_verify_identity": False,
                    "ssl_verify_cert": False
                }
            }
        
        # Create the engine
        engine = create_engine(db_url, connect_args=connect_args)
        
        # Get schema information
        schema = {}
        with engine.connect() as conn:
            inspector = inspect(engine)
            
            # Get all table names
            tables = inspector.get_table_names()
            
            for table in tables:
                columns = []
                for column in inspector.get_columns(table):
                    columns.append({
                        "name": column["name"],
                        "type": str(column["type"]),
                        "nullable": column["nullable"]
                    })
                
                schema[table] = {
                    "columns": columns
                }
                
                # Get primary key constraints
                pk = inspector.get_pk_constraint(table)
                if pk and "constrained_columns" in pk:
                    schema[table]["primary_keys"] = pk["constrained_columns"]
                
                # Get foreign key constraints
                fks = inspector.get_foreign_keys(table)
                if fks:
                    schema[table]["foreign_keys"] = fks
        
        return schema
        
    except Exception as e:
        logger.error(f"Unexpected error in get_db_schema: {str(e)}")
        raise

def execute_sql_query(db_url: str, sql_query: str):
    """
    Execute the SQL query using SQLAlchemy and return the fetched data and column names.
    
    Args:
        db_url: SQLAlchemy-compatible database connection string
        sql_query: SQL query to execute
        
    Returns:
        A tuple of (columns, data) where columns is a list of column names and
        data is a list of dictionaries containing the query results
    """
    try:
        # Format the connection string if needed
        if 'mysql' in db_url.lower():
            db_url = format_connection_string(db_url)
            
        sql_query = clean_sql_query(sql_query)
        
        # Create engine with explicit SSL settings for MySQL
        connect_args = {}
        if 'mysql' in db_url.lower():
            connect_args = {
                'ssl': {
                    'ssl_disabled': False,
                    'ca': None  # This allows SSL without certificate verification
                }
            }
            
        engine = create_engine(db_url, connect_args=connect_args)
        
        with engine.connect() as conn:
            result = conn.execute(text(sql_query))
            data = [dict(row._mapping) for row in result.fetchall()]
            columns = list(result.keys())
            
        return columns, data
    except Exception as e:
        logger.error(f"Error in execute_sql_query: {str(e)}")
        raise 