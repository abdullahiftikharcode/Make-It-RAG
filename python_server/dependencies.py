from typing import Optional
from python_server.services.sql_service import SQLService
from python_server.services.nlp_service import NLPService
from python_server.components.model_context import ModelContext
from python_server.config.config import GEMINI_API_KEY
import subprocess
import sys
import importlib

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

def install_package(package_name):
    try:
        importlib.import_module(package_name)
    except ImportError:
        print(f"Installing {package_name}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])

def setup_dependencies():
    """Ensure all required dependencies are installed."""
    required_packages = [
        "pymysql",
        "cryptography",  # Required for PyMySQL's SSL support
    ]
    
    for package in required_packages:
        install_package(package) 