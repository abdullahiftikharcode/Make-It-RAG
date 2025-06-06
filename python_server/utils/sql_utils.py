import re
from sqlalchemy import create_engine, MetaData, text
import urllib.parse

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

def format_mysql_connection_string(db_url: str) -> str:
    """
    Format a MySQL connection string to be compatible with SQLAlchemy.
    Handles special cases like ngrok TCP URLs.
    
    Args:
        db_url: Raw MySQL connection string
        
    Returns:
        SQLAlchemy-compatible connection string
    """
    # If already in SQLAlchemy format and properly encoded, return as is
    if db_url.startswith('mysql+pymysql://'):
        return db_url
        
    # Parse the connection string
    if '@' in db_url:
        auth_part, rest = db_url.split('@', 1)
        user_pass, _ = auth_part.split('://', 1)
        
        # Split into components
        if ':' in user_pass:
            user, password = user_pass.split(':', 1)
        else:
            user = user_pass
            password = ''
            
        # Handle ngrok TCP URLs
        if '.tcp.' in rest:
            host_port, db = rest.split('/', 1)
            # Convert ngrok TCP URL to regular hostname
            host, port = host_port.split(':', 1)
        else:
            if '/' in rest:
                host_port, db = rest.split('/', 1)
                if ':' in host_port:
                    host, port = host_port.split(':', 1)
                else:
                    host = host_port
                    port = '3306'
            else:
                host = rest
                port = '3306'
                db = ''
                
        # URL encode components
        user = urllib.parse.quote_plus(user)
        password = urllib.parse.quote_plus(password)
        host = urllib.parse.quote_plus(host)
        db = urllib.parse.quote_plus(db)
        
        # Construct SQLAlchemy URL
        return f'mysql+pymysql://{user}:{password}@{host}:{port}/{db}'
    else:
        raise ValueError("Invalid MySQL connection string format")

def get_db_schema(db_url: str) -> dict:
    """
    Extract database schema information from a database connection.
    
    Args:
        db_url: SQLAlchemy-compatible database connection string
        
    Returns:
        Dictionary containing table schema information
    """
    # Format the connection string if needed
    if 'mysql' in db_url.lower():
        db_url = format_mysql_connection_string(db_url)
        
    engine = create_engine(db_url)
    metadata = MetaData()
    metadata.reflect(bind=engine)
    schema = {}
    
    for table in metadata.tables.values():
        columns = [col.name for col in table.columns]
        primary_key = [col.name for col in table.columns if col.primary_key]
        foreign_keys = {}
        
        for col in table.columns:
            for fk in col.foreign_keys:
                foreign_keys[col.name] = fk.target_fullname
                
        schema[table.name] = {
            "columns": columns,
            "primary_key": primary_key,
            "foreign_keys": foreign_keys
        }
        
    return schema

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
    # Format the connection string if needed
    if 'mysql' in db_url.lower():
        db_url = format_mysql_connection_string(db_url)
        
    sql_query = clean_sql_query(sql_query)
    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        result = conn.execute(text(sql_query))
        data = [dict(row._mapping) for row in result.fetchall()]
        columns = list(result.keys())
        
    return columns, data 