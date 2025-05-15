import google.generativeai as genai
from python_server.config.config import GEMINI_MODEL
from python_server.utils.text_utils import safe_decode
from typing import Optional, List, Any

class NLPService:
    """Service for natural language processing with LLMs."""
    
    def __init__(self, api_key: str):
        """
        Initialize the NLP service.
        
        Args:
            api_key: Gemini API key
        """
        genai.configure(api_key=api_key)
        
    def generate_natural_language_response(self, user_query: str, columns: List[str], data: List[Any], model: Optional[str] = None):
        """
        Generate a natural language response from SQL query results.
        
        Args:
            user_query: Original natural language query
            columns: Column names from the query results
            data: Data from the query results
            model: Optional model name to use, defaults to config value
            
        Returns:
            Natural language explanation of the results
        """
        prompt = (
            "You are an expert data interpreter. Based on the following query results, provide a clear and detailed summary in bullet points. "
            "Include specific details and avoid mentioning SQL or technical details.\n\n"
            "Columns: " + ', '.join(columns) + ".\n"
            "Data: " + str(data) + ".\n"
            "User Request: " + user_query + "\n\n"
            "Provide your summary in a bullet point list format:"
        )
        
        model_name = model if model else GEMINI_MODEL
        model_instance = genai.GenerativeModel(model_name)
        response = model_instance.generate_content(prompt)
        response_text = safe_decode(response.text).strip()
        
        return response_text 