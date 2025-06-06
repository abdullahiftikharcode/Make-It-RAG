from typing import Optional
from python_server.services.sql_service import SQLService
from python_server.services.nlp_service import NLPService
from python_server.components.model_context import ModelContext
from python_server.config.config import GEMINI_API_KEY

def get_sql_service() -> SQLService:
    """Get SQL service instance."""
    return SQLService(api_key=GEMINI_API_KEY)

def get_nlp_service() -> NLPService:
    """Get NLP service instance."""
    return NLPService(api_key=GEMINI_API_KEY)

def get_subscription_tier() -> str:
    """Get user's subscription tier."""
    # For now, return default tier
    return "personal"

def get_model_context() -> ModelContext:
    """Get model context instance."""
    return ModelContext(api_key=GEMINI_API_KEY) 