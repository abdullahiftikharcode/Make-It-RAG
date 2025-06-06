from python_server.utils.sql_utils import (
    get_db_schema,
    format_connection_string,
    execute_sql_query,
    clean_sql_query
)
from python_server.components.model_factory import ModelFactory
from typing import Optional, Dict, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SQLService:
    """Service for SQL generation and execution."""
    
    def __init__(self, api_key: str, subscription_tier: str = "personal", model_context=None):
        """
        Initialize the SQL service.
        
        Args:
            api_key: Gemini API key
            subscription_tier: User's subscription tier
            model_context: Optional model context for model selection
        """
        self.api_key = api_key
        self.subscription_tier = subscription_tier
        self.model_context = model_context
        
    def validate_query(self, query: str, table_structure: dict, model: Optional[str] = None) -> bool:
        """
        Validate if a natural language query is related to a database schema.
        
        Args:
            query: Natural language query
            table_structure: Database schema as dictionary
            model: Optional model name to use
            
        Returns:
            Boolean indicating query validity
        """
        # Create validation prompt
        validation_prompt = (
            "Determine if the following natural language query is related to the provided table schema. "
            "Return 'true' if it is, and 'false' if it is not.\n\n"
            "Table Schema:\n"
            f"{str(table_structure)}\n\n"
            "Query:\n"
            f"{query}\n"
        )
        
        # Use the model context if available, otherwise use the model factory directly
        if self.model_context:
            response = self.model_context.generate_content(validation_prompt)
        else:
            ai_model = ModelFactory.create_model(self.subscription_tier, self.api_key)
            response = ai_model.generate_content(validation_prompt)
        
        # Extract response
        if hasattr(response, 'text'):
            answer = response.text.strip().lower()
        else:
            answer = str(response).strip().lower()
            
        return "true" in answer
        
    def generate_sql(self, query: str, table_structure: dict, dialect: str = "generic SQL", model: Optional[str] = None):
        """
        Generate SQL from natural language.
        
        Args:
            query: Natural language query
            table_structure: Database schema as dictionary
            dialect: SQL dialect to use
            model: Optional model name to use
            
        Returns:
            Generated SQL query or error message
        """
        # Create SQL generation prompt
        generation_prompt = (
            f"SQL Dialect: {dialect}\n\n"
            "Generate an accurate SQL query for the following natural language request and database schema.\n"
            "Do not include any explanation, only provide the SQL query.\n\n"
            "Database Schema:\n"
            f"{str(table_structure)}\n\n"
            "Request:\n"
            f"{query}\n\n"
            "SQL query:"
        )
        
        # Use the model context if available, otherwise use the model factory directly
        if self.model_context:
            response = self.model_context.generate_content(generation_prompt)
        else:
            ai_model = ModelFactory.create_model(self.subscription_tier, self.api_key)
            response = ai_model.generate_content(generation_prompt)
            
        # Extract response
        if hasattr(response, 'text'):
            sql_query = response.text.strip()
        else:
            sql_query = str(response).strip()
            
        # Clean up the SQL query (remove markdown code blocks if present)
        if sql_query.startswith('```'):
            lines = sql_query.split('\n')
            sql_query = '\n'.join(lines[1:-1] if lines[-1].startswith('```') else lines[1:])
        
        # Verification
        is_valid = self.verify_sql_query(sql_query, query, table_structure, dialect, model)
        
        if is_valid:
            return {
                "sql_query": sql_query,
                "message": "Generated SQL Query successfully."
            }
        else:
            return {
                "sql_query": None,
                "message": "Failed to generate a valid SQL query."
            }
    
    def verify_sql_query(self, sql_query: str, user_query: str, table_structure: dict, 
                       dialect: str = "generic SQL", model: Optional[str] = None) -> bool:
        """
        Verify if the generated SQL query is correct.
        
        Args:
            sql_query: Generated SQL query
            user_query: Original natural language query
            table_structure: Database schema as dictionary
            dialect: SQL dialect used
            model: Optional model name to use
            
        Returns:
            Boolean indicating if the SQL query is valid
        """
        verification_prompt = (
            f"SQL Dialect: {dialect}\n\n"
            "Validate the following SQL query for correctness with respect to the provided "
            "natural language query and table schema. Return 'true' if the query is correct, "
            "and 'false' if it is not.\n\n"
            "Table Schema:\n"
            f"{str(table_structure)}\n\n"
            "Natural Language Query:\n"
            f"{user_query}\n\n"
            "Generated SQL Query:\n"
            f"{sql_query}\n"
        )
        
        # Use the model context if available, otherwise use the model factory directly
        if self.model_context:
            response = self.model_context.generate_content(verification_prompt)
        else:
            ai_model = ModelFactory.create_model(self.subscription_tier, self.api_key)
            response = ai_model.generate_content(verification_prompt)
            
        # Extract response
        if hasattr(response, 'text'):
            answer = response.text.strip().lower()
        else:
            answer = str(response).strip().lower()
            
        return "true" in answer
        
    def get_database_schema(self, db_url: str) -> dict:
        """Get the schema of a database."""
        try:
            logger.info("Attempting to get schema for database")
            schema = get_db_schema(db_url)
            return schema
        except Exception as e:
            logger.error(f"Error getting database schema: {str(e)}")
            logger.error("Full traceback:", exc_info=True)
            raise
        
    def execute_query(self, db_url: str, sql_query: str):
        """
        Execute SQL query and return results.
        
        Args:
            db_url: Database connection string
            sql_query: SQL query to execute
            
        Returns:
            Tuple of (columns, data)
        """
        try:
            logger.info("Attempting to execute query")
            result = execute_sql_query(db_url, sql_query)
            logger.info("Query executed successfully")
            return result
        except Exception as e:
            logger.error(f"Error executing query: {str(e)}")
            import traceback
            logger.error(f"Full traceback:\n{traceback.format_exc()}")
            raise 