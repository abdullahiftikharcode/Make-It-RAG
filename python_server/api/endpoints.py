import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Optional
import urllib.parse
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from python_server.api.models import (
    QueryRequest, 
    QueryResponse, 
    ErrorResponse, 
    ModelSelectionRequest,
    ModelSelectionResponse,
    ModelsListResponse,
    ModelInfo
)
from python_server.services.sql_service import SQLService
from python_server.services.nlp_service import NLPService
from python_server.components.model_context import ModelContext
from python_server.config.config import GEMINI_API_KEY
from python_server.dependencies import (
    get_sql_service,
    get_nlp_service,
    get_subscription_tier,
    get_model_context
)

router = APIRouter()

# Create a global model context for the application
# This allows model switching without restarting
model_context = None

def get_model_context():
    """Dependency to get ModelContext instance."""
    global model_context
    if model_context is None:
        api_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)
        if not api_key:
            raise HTTPException(
                status_code=500, 
                detail="API key not configured. Please set GEMINI_API_KEY environment variable."
            )
        model_context = ModelContext(api_key)
    return model_context

def get_sql_service(subscription_tier: str = "personal"):
    """Dependency to get SQLService instance."""
    api_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="API key not configured. Please set GEMINI_API_KEY environment variable."
        )
    return SQLService(api_key=api_key, subscription_tier=subscription_tier, model_context=get_model_context())
    
def get_nlp_service(subscription_tier: str = "personal"):
    """Dependency to get NLPService instance."""
    api_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="API key not configured. Please set GEMINI_API_KEY environment variable."
        )
    return NLPService(api_key=api_key, subscription_tier=subscription_tier, model_context=get_model_context())

def get_subscription_tier(req: QueryRequest) -> str:
    """Dependency to get subscription tier from request."""
    return req.subscription_tier

@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    
    Returns:
        Status message
    """
    return {"status": "healthy", "service": "text-to-sql"}

@router.get("/models", response_model=ModelsListResponse)
async def list_models(
    model_ctx: ModelContext = Depends(get_model_context)
):
    """
    List available models and the currently selected model
    
    Returns:
        List of available models and the current model
    """
    current_model = model_ctx.get_current_model_info()
    return {
        "models": model_ctx.get_available_models(),
        "current_model": current_model
    }

@router.post("/models/select", response_model=ModelSelectionResponse)
async def select_model(
    request: ModelSelectionRequest,
    model_ctx: ModelContext = Depends(get_model_context)
):
    """
    Select a model by ID
    
    Args:
        request: Request containing the model ID to select
        
    Returns:
        Response with success status and selected model info
    """
    success = model_ctx.select_model(request.model_id)
    if success:
        selected_model = model_ctx.get_current_model_info()
        return {
            "success": True,
            "selected_model": selected_model,
            "message": f"Successfully switched to model: {selected_model['name']}"
        }
    else:
        return {
            "success": False,
            "selected_model": None,
            "message": f"Model with ID '{request.model_id}' not found"
        }

@router.post("/generate", response_model=QueryResponse, responses={400: {"model": ErrorResponse}})
async def generate_sql(
    req: QueryRequest,
    subscription_tier: str = Depends(get_subscription_tier),
    sql_service: SQLService = Depends(get_sql_service),
    nlp_service: NLPService = Depends(get_nlp_service),
    model_ctx: ModelContext = Depends(get_model_context)
):
    """
    Generate SQL query from natural language and execute it.
    
    Args:
        req: Query request containing the natural language query and DB connection
        
    Returns:
        Generated SQL query, results, and natural language explanation
    """
    # Validate model access based on subscription tier
    if req.selected_model_id:
        if subscription_tier == 'personal' and req.selected_model_id == 'gemini-2.5-flash-preview-04-17':
            raise HTTPException(
                status_code=403,
                detail="Access to this model requires a corporate subscription"
            )
        model_ctx.select_model(req.selected_model_id)
    
    # Get the current model name for response
    current_model_info = model_ctx.get_current_model_info()
    model_name = current_model_info["name"]
    
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
        "explanation": explanation,
        "model_used": model_name
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
        # URL decode the connection string if needed
        db_url = urllib.parse.unquote(db_url)
        logger.info(f"Processing schema request for URL: {db_url}")
        
        schema = sql_service.get_database_schema(db_url)
        logger.info("Successfully retrieved schema")
        return {"schema": schema}
    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error retrieving schema: {str(e)}")
        # Get the full error details
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Full error traceback:\n{error_details}")
        raise HTTPException(status_code=400, detail=f"Error retrieving schema: {str(e)}") 