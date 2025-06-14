import re
import logging
from sqlalchemy import create_engine, MetaData, text, exc, inspect
import urllib.parse
from urllib.parse import quote_plus, unquote, urlparse, quote

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
        logger.info(f"Received URL: {db_url}")
        
        # If it's already a SQLAlchemy URL, parse and reformat it
        if db_url.startswith(('mysql+pymysql://', 'postgresql://', 'mssql://')):
            # Parse the URL
            parsed = urlparse(db_url)
            
            # Extract components
            user = parsed.username
            password = parsed.password
            host = parsed.hostname
            port = parsed.port
            database = parsed.path.lstrip('/')
            
            # Handle special characters in password
            if password and '@' in password:
                # URL encode the @ in the password
                password = quote(password, safe='')
            
            # Reconstruct the URL
            if port:
                return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
            else:
                return f"mysql+pymysql://{user}:{password}@{host}/{database}"
            
        # Handle simple connection string format
        parts = db_url.split('@')
        if len(parts) > 2:  # Handle case where password contains @
            credentials = '@'.join(parts[:-1])
            host_part = parts[-1]
        else:
            credentials, host_part = parts[0], parts[1]
        
        user_pass = credentials.split(':')
        if len(user_pass) != 2:
            raise ValueError("Invalid credentials format")
            
        user = user_pass[0]
        password = quote(user_pass[1], safe='')  # URL encode the password
        
        # Split host part into host:port/database
        host_parts = host_part.split('/')
        if len(host_parts) != 2:
            raise ValueError("Invalid host format")
            
        host_port = host_parts[0].split(':')
        host = host_port[0]
        port = host_port[1] if len(host_port) > 1 else '3306'
        database = host_parts[1]
        
        # Construct SQLAlchemy URL
        return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
        
    except Exception as e:
        logger.error(f"Error formatting connection string: {str(e)}")
        raise ValueError(f"Invalid connection string format: {str(e)}")

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
                    "ssl_verify_cert": True,
                    "ssl_verify_identity": True,
                    "ssl_ca": None  # TiDB Cloud uses a well-known CA
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
                # Get column names
                column_names = []
                for column in inspector.get_columns(table):
                    column_names.append(column["name"])
                
                # Initialize table schema
                schema[table] = {
                    "columns": column_names
                }
                
                # Get primary key constraints
                pk = inspector.get_pk_constraint(table)
                if pk and "constrained_columns" in pk:
                    schema[table]["primary_key"] = pk["constrained_columns"]
                
                # Get foreign key constraints
                fks = inspector.get_foreign_keys(table)
                if fks:
                    foreign_keys = {}
                    for fk in fks:
                        for local_col, ref_col in zip(fk["constrained_columns"], fk["referred_columns"]):
                            foreign_keys[local_col] = f"{fk['referred_table']}.{ref_col}"
                    schema[table]["foreign_keys"] = foreign_keys
        
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
                    'ssl_verify_cert': True,
                    'ssl_verify_identity': True,
                    'ssl_ca': None  # TiDB Cloud uses a well-known CA
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