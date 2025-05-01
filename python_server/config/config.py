import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

# Model configurations
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash-lite-001')

# Service settings
MAX_SQL_GENERATION_ATTEMPTS = int(os.getenv('MAX_SQL_GENERATION_ATTEMPTS', '5'))
QUERY_VERIFICATION_ITERATIONS = int(os.getenv('QUERY_VERIFICATION_ITERATIONS', '3'))

# App settings
APP_TITLE = "Text to SQL API"
APP_DESCRIPTION = "A FastAPI service for converting natural language to SQL queries using Gemini AI"
APP_VERSION = "1.0.0" 