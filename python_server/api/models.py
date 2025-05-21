from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

class QuerySettings(BaseModel):
    query_timeout: Optional[int] = 30
    model: Optional[str] = None

class ModelSelectionRequest(BaseModel):
    """Pydantic model for model selection request."""
    model_id: str = Field(..., description="ID of the selected model")

class ModelSelectionResponse(BaseModel):
    """Pydantic model for model selection response."""
    success: bool
    selected_model: Optional[Dict[str, str]] = None
    message: str

class ModelsListResponse(BaseModel):
    """Pydantic model for models list response."""
    models: List[Dict[str, str]]
    current_model: Dict[str, str]

class QueryRequest(BaseModel):
    """Pydantic model for query request."""
    query: str
    db_url: str
    dialect: str = "MYSQL"
    settings: Optional[Dict[str, Any]] = None
    subscription_tier: Optional[str] = "personal"  # Default to personal tier
    selected_model_id: Optional[str] = None  # Optional model selection
    
class QueryResponse(BaseModel):
    """Pydantic model for query response."""
    sql_query: str
    columns: List[str]
    data: List[Any]
    explanation: str
    model_used: str  # Add information about which model was used
    
class ErrorResponse(BaseModel):
    """Pydantic model for error response."""
    detail: str 