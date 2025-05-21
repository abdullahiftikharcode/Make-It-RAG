import google.generativeai as genai
from python_server.config.config import GEMINI_MODEL
from python_server.utils.text_utils import safe_decode
from python_server.components.model_factory import ModelFactory
from typing import Optional, List, Any

class NLPService:
    """Service for natural language processing with LLMs."""
    
    def __init__(self, api_key: str, subscription_tier: str = "personal", model_context=None):
        """
        Initialize the NLP service.
        
        Args:
            api_key: Gemini API key
            subscription_tier: User's subscription tier
            model_context: Optional model context for model selection
        """
        self.api_key = api_key
        self.subscription_tier = subscription_tier
        self.model_context = model_context
        
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
        
        # Use the model context if available, otherwise fallback to the model factory
        if self.model_context:
            response = self.model_context.generate_content(prompt)
        else:
            # Use the model factory to get the appropriate model based on subscription tier
            ai_model = ModelFactory.create_model(self.subscription_tier, self.api_key)
            response = ai_model.generate_content(prompt)
        
        # Extract text from the response
        if hasattr(response, 'text'):
            response_text = safe_decode(response.text).strip()
        else:
            # Handle different response format if needed
            response_text = str(response)
        
        return response_text 