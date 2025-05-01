from python_server.components.sql_components import build_pipeline, QueryValidator
from python_server.utils.sql_utils import get_db_schema, execute_sql_query

class SQLService:
    """Service for SQL generation and execution."""
    
    def __init__(self, api_key: str):
        """
        Initialize the SQL service.
        
        Args:
            api_key: Gemini API key
        """
        self.api_key = api_key
        
    def validate_query(self, query: str, table_structure: dict) -> bool:
        """
        Validate if a natural language query is related to a database schema.
        
        Args:
            query: Natural language query
            table_structure: Database schema as dictionary
            
        Returns:
            Boolean indicating query validity
        """
        validator = QueryValidator(api_key=self.api_key)
        valid_result, _ = validator.run(query=query, table_structure=table_structure)
        return valid_result["is_valid"]
        
    def generate_sql(self, query: str, table_structure: dict, dialect: str = "generic SQL"):
        """
        Generate SQL from natural language.
        
        Args:
            query: Natural language query
            table_structure: Database schema as dictionary
            dialect: SQL dialect to use
            
        Returns:
            Generated SQL query or error message
        """
        pipeline = build_pipeline(self.api_key)
        result = pipeline.run(
            query=query,
            params={
                "QueryValidator": {"table_structure": table_structure},
                "AgenticSQLGenerator": {"table_structure": table_structure, "dialect": dialect}
            }
        )
        
        return result
        
    def get_database_schema(self, db_url: str):
        """
        Get database schema from a connection string.
        
        Args:
            db_url: Database connection string
            
        Returns:
            Dictionary of database schema
        """
        return get_db_schema(db_url)
        
    def execute_query(self, db_url: str, sql_query: str):
        """
        Execute SQL query and return results.
        
        Args:
            db_url: Database connection string
            sql_query: SQL query to execute
            
        Returns:
            Tuple of (columns, data)
        """
        return execute_sql_query(db_url, sql_query) 