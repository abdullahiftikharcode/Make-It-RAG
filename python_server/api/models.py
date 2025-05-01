from pydantic import BaseModel

class QueryRequest(BaseModel):
    """Pydantic model for query request."""
    query: str
    db_url: str
    dialect: str = "generic SQL"
    
class QueryResponse(BaseModel):
    """Pydantic model for query response."""
    sql_query: str
    columns: list
    data: list
    explanation: str
    
class ErrorResponse(BaseModel):
    """Pydantic model for error response."""
    detail: str 