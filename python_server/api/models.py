from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

class QuerySettings(BaseModel):
    """Query settings model."""
    query_timeout: Optional[int] = 45
    model: Optional[str] = None

class QueryRequest(BaseModel):
    """Query request model."""
    query: str
    db_url: str
    dialect: str = "MYSQL"
    settings: Optional[QuerySettings] = None
    selected_model_id: Optional[str] = None

class QueryResponse(BaseModel):
    """Query response model."""
    sql_query: str
    columns: List[str]
    data: List[Dict[str, Any]]
    explanation: str
    model_used: str

class ErrorResponse(BaseModel):
    """Error response model."""
    detail: str

class ModelInfo(BaseModel):
    """Model information."""
    id: str
    name: str
    description: str

class ModelSelectionRequest(BaseModel):
    """Model selection request."""
    model_id: str

class ModelsListResponse(BaseModel):
    """Models list response."""
    models: List[ModelInfo]
    current_model: ModelInfo

class ModelSelectionResponse(BaseModel):
    """Pydantic model for model selection response."""
    success: bool
    selected_model: Optional[Dict[str, str]] = None
    message: str 