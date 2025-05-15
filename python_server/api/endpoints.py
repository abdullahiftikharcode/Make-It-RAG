import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Optional

from python_server.api.models import QueryRequest, QueryResponse, ErrorResponse
from python_server.services.sql_service import SQLService
from python_server.services.nlp_service import NLPService
from python_server.config.config import GEMINI_API_KEY

router = APIRouter()

def get_sql_service():
    """Dependency to get SQLService instance."""
    api_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="API key not configured. Please set GEMINI_API_KEY environment variable."
        )
    return SQLService(api_key=api_key)
    
def get_nlp_service():
    """Dependency to get NLPService instance."""
    api_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="API key not configured. Please set GEMINI_API_KEY environment variable."
        )
    return NLPService(api_key=api_key)

@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    
    Returns:
        Status message
    """
    return {"status": "healthy", "service": "text-to-sql"}

@router.post("/generate", response_model=QueryResponse, responses={400: {"model": ErrorResponse}})
async def generate_sql(
    req: QueryRequest, 
    sql_service: SQLService = Depends(get_sql_service),
    nlp_service: NLPService = Depends(get_nlp_service)
):
    """
    Generate SQL query from natural language and execute it.
    
    Args:
        req: Query request containing the natural language query and DB connection
        
    Returns:
        Generated SQL query, results, and natural language explanation
    """
    if not req.query:
        raise HTTPException(status_code=400, detail="Please enter a natural language query.")
        
    if not req.db_url:
        raise HTTPException(status_code=400, detail="Please provide a database connection string.")
        
    try:
        # Get the model from settings if provided
        model: Optional[str] = None
        if req.settings and "model" in req.settings:
            model = req.settings.get("model")
        
        table_structure = sql_service.get_database_schema(req.db_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving schema: {str(e)}")
    
    # Validate the query against the schema
    is_valid = sql_service.validate_query(req.query, table_structure, model=model)
    if not is_valid:
        raise HTTPException(
            status_code=400, 
            detail="False: The query is not related to the provided table schema."
        )
    
    # Generate SQL
    result = sql_service.generate_sql(
        query=req.query,
        table_structure=table_structure,
        dialect=req.dialect,
        model=model
    )
    
    if result["sql_query"] is None:
        raise HTTPException(status_code=400, detail=result["message"])
        
    sql_query = result["sql_query"]
    
    # Execute the query
    try:
        columns, data = sql_service.execute_query(req.db_url, sql_query)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error executing SQL query: {str(e)}")
    
    # Generate natural language explanation
    explanation = nlp_service.generate_natural_language_response(
        req.query, 
        columns, 
        data,
        model=model
    )
    
    return {
        "sql_query": sql_query,
        "columns": columns,
        "data": data,
        "explanation": explanation
    }

@router.get("/schema")
async def schema_endpoint(
    db_url: str, 
    sql_service: SQLService = Depends(get_sql_service)
):
    """
    Get database schema.
    
    Args:
        db_url: Database connection string
        
    Returns:
        Database schema as JSON
    """
    if not db_url:
        raise HTTPException(status_code=400, detail="Please provide a database connection string.")
        
    try:
        schema = sql_service.get_database_schema(db_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving schema: {str(e)}")
        
    return {"schema": schema} 