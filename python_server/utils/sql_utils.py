import re
from sqlalchemy import create_engine, MetaData, text

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

def get_db_schema(db_url: str) -> dict:
    """
    Extract database schema information from a database connection.
    
    Args:
        db_url: SQLAlchemy-compatible database connection string
        
    Returns:
        Dictionary containing table schema information
    """
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
    sql_query = clean_sql_query(sql_query)
    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        result = conn.execute(text(sql_query))
        data = [dict(row._mapping) for row in result.fetchall()]
        columns = list(result.keys())
        
    return columns, data 