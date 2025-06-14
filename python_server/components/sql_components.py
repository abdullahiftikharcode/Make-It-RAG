import json
import google.generativeai as genai
from haystack.nodes import BaseComponent
from haystack.pipelines import Pipeline
from typing import Optional, Dict, Any, List

from python_server.config.config import (
    GEMINI_MODEL, 
    MAX_SQL_GENERATION_ATTEMPTS,
    QUERY_VERIFICATION_ITERATIONS
)
from python_server.utils.sql_utils import remove_markdown_code_fence

class QueryValidator(BaseComponent):
    """Component to validate if a natural language query is related to a database schema."""
    outgoing_edges = 1
    
    def __init__(self, api_key: str, subscription_tier: str = "personal"):
        self.api_key = api_key
        self.subscription_tier = subscription_tier
        
    def run(self, query: str, table_structure: dict, model: Optional[str] = None, **kwargs):
        """
        Validate if the query is related to the table structure.
        
        Args:
            query: Natural language query
            table_structure: Database schema as dictionary
            model: Optional model name to use, defaults to config value
            
        Returns:
            Dictionary with is_valid boolean flag
        """
        prompt = (
            "Determine if the following natural language query is related to the provided table schema. "
            "Return 'true' if it is, and 'false' if it is not.\n\n"
            "Table Schema (JSON):\n"
            f"{json.dumps(table_structure, indent=2)}\n\n"
            "Query:\n"
            f"{query}\n"
        )
        
        from python_server.components.model_factory import ModelFactory
        
        # Use model factory to get appropriate model based on subscription tier
        ai_model = ModelFactory.create_model(self.subscription_tier, self.api_key)
        response = ai_model.generate_content(prompt)
        answer = response.text.strip().lower()
        is_valid = "true" in answer
        
        return {"is_valid": is_valid}, "output"
        
    def run_batch(self, queries: list, table_structures: list, **kwargs):
        """Run validation on batches of queries."""
        results = []
        for query, table_structure in zip(queries, table_structures):
            result, _ = self.run(query, table_structure, **kwargs)
            results.append(result)
        return results, "output"

class GeminiSQLGenerator(BaseComponent):
    """Component to generate SQL queries from natural language using Gemini."""
    outgoing_edges = 1
    
    def __init__(self, api_key: str, subscription_tier: str = "personal"):
        self.api_key = api_key
        self.subscription_tier = subscription_tier
        
    def run(self, query: str, table_structure: dict, dialect: str = "generic SQL", model: Optional[str] = None, **kwargs):
        """
        Generate SQL query from natural language.
        
        Args:
            query: Natural language query
            table_structure: Database schema as dictionary
            dialect: SQL dialect to use
            model: Optional model name to use, defaults to config value
            
        Returns:
            Dictionary with generated SQL query
        """
        system_prompt = (
            f"SQL Dialect: {dialect}\n\n"
            "System Prompt: SQL Table Structure (in JSON):\n"
            f"{json.dumps(table_structure, indent=2)}\n\n"
            "User Query:\n"
            f"{query}\n\n"
            "Generate the corresponding SQL query:"
        )
        
        from python_server.components.model_factory import ModelFactory
        
        # Use model factory to get appropriate model based on subscription tier
        ai_model = ModelFactory.create_model(self.subscription_tier, self.api_key)
        response = ai_model.generate_content(system_prompt)
        sql_query = response.text.strip()
        sql_query = remove_markdown_code_fence(sql_query)
        
        return {"sql_query": sql_query}, "output"
        
    def run_batch(self, queries: list, table_structures: list, **kwargs):
        """Run SQL generation on batches of queries."""
        results = []
        for query, table_structure in zip(queries, table_structures):
            result, _ = self.run(query, table_structure, **kwargs)
            results.append(result)
        return results, "output"

class QueryVerifier(BaseComponent):
    """Component to verify generated SQL queries for correctness."""
    outgoing_edges = 1
    
    def __init__(self, api_key: str, subscription_tier: str = "personal"):
        self.api_key = api_key
        self.subscription_tier = subscription_tier
        
    def run(self, sql_query: str, user_query: str, table_structure: dict, dialect: str = "generic SQL", model: Optional[str] = None, **kwargs):
        """
        Verify if the generated SQL query is correct.
        
        Args:
            sql_query: Generated SQL query
            user_query: Original natural language query
            table_structure: Database schema as dictionary
            dialect: SQL dialect used
            model: Optional model name to use, defaults to config value
            
        Returns:
            Dictionary with is_valid boolean flag
        """
        valid_count = 0
        for _ in range(QUERY_VERIFICATION_ITERATIONS):
            prompt = (
                f"SQL Dialect: {dialect}\n\n"
                "Validate the following SQL query for correctness with respect to the provided natural language query "
                "and table schema. Return 'true' if the query is correct, and 'false' if it is not.\n\n"
                "Table Schema (JSON):\n"
                f"{json.dumps(table_structure, indent=2)}\n\n"
                "Natural Language Query:\n"
                f"{user_query}\n\n"
                "SQL Query:\n"
                f"{sql_query}\n"
            )
            
            from python_server.components.model_factory import ModelFactory
            
            # Use model factory to get appropriate model based on subscription tier
            ai_model = ModelFactory.create_model(self.subscription_tier, self.api_key)
            response = ai_model.generate_content(prompt)
            answer = response.text.strip().lower()
            
            if "false" in answer:
                return {"is_valid": False}, "output"
            elif "true" in answer:
                valid_count += 1
                
        is_valid = valid_count == QUERY_VERIFICATION_ITERATIONS
        return {"is_valid": is_valid}, "output"
        
    def run_batch(self, sql_queries: list, user_queries: list, table_structures: list, **kwargs):
        """Run verification on batches of queries."""
        results = []
        for sql_query, user_query, table_structure in zip(sql_queries, user_queries, table_structures):
            result, _ = self.run(sql_query, user_query, table_structure, **kwargs)
            results.append(result)
        return results, "output"

class AgenticSQLGenerator(BaseComponent):
    """Component that combines SQL generation and verification in an agentic approach."""
    outgoing_edges = 1
    
    def __init__(self, api_key: str, subscription_tier: str = "personal"):
        self.api_key = api_key
        self.subscription_tier = subscription_tier
        self.sql_generator = GeminiSQLGenerator(api_key, subscription_tier)
        self.query_verifier = QueryVerifier(api_key, subscription_tier)
        
    def run(self, query: str, table_structure: dict, dialect: str = "generic SQL", model: Optional[str] = None, **kwargs):
        """
        Generate and verify SQL queries from natural language.
        
        Args:
            query: Natural language query
            table_structure: Database schema as dictionary
            dialect: SQL dialect to use
            model: Optional model name to use, defaults to config value
            
        Returns:
            Dictionary with valid SQL query or error message
        """
        max_attempts = MAX_SQL_GENERATION_ATTEMPTS
        attempt = 0
        valid_sql = None
        
        while attempt < max_attempts:
            result, _ = self.sql_generator.run(query, table_structure, dialect=dialect, model=model, **kwargs)
            generated_sql = result["sql_query"]
            
            verifier_result, _ = self.query_verifier.run(
                sql_query=generated_sql,
                user_query=query,
                table_structure=table_structure,
                dialect=dialect,
                model=model,
                **kwargs
            )
            
            if verifier_result["is_valid"]:
                valid_sql = generated_sql
                break
                
            attempt += 1
            
        if valid_sql is None:
            return {
                "sql_query": None, 
                "message": f"False: Unable to generate a valid SQL query after {MAX_SQL_GENERATION_ATTEMPTS} attempts."
            }, "output"
        else:
            return {
                "sql_query": valid_sql, 
                "message": "Generated SQL Query successfully."
            }, "output"
            
    def run_batch(self, queries: list, table_structures: list, **kwargs):
        """Run agentic SQL generation on batches of queries."""
        results = []
        for query, table_structure in zip(queries, table_structures):
            result, _ = self.run(query, table_structure, **kwargs)
            results.append(result)
        return results, "output"

def build_pipeline(api_key: str, subscription_tier: str = "personal") -> Pipeline:
    """
    Build a Haystack pipeline for SQL generation.
    
    Args:
        api_key: Gemini API key
        subscription_tier: User's subscription tier
        
    Returns:
        Configured Haystack pipeline
    """
    pipeline = Pipeline()
    validator_node = QueryValidator(api_key=api_key, subscription_tier=subscription_tier)
    agentic_node = AgenticSQLGenerator(api_key=api_key, subscription_tier=subscription_tier)
    
    pipeline.add_node(component=validator_node, name="QueryValidator", inputs=["Query"])
    pipeline.add_node(component=agentic_node, name="AgenticSQLGenerator", inputs=["Query"])
    
    return pipeline 