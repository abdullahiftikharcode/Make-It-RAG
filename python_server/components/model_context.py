import google.generativeai as genai
from typing import Any, Dict, List, Optional
from python_server.components.model_registry import ModelRegistry, ModelStrategy

class ModelContext:
    """Context manager for model selection and configuration."""
    
    def __init__(self, api_key: str):
        """
        Initialize the model context.
        
        Args:
            api_key: Gemini API key
        """
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self._current_model = "gemini-pro"
        self.registry = ModelRegistry(api_key)
        
    def select_model(self, model_id: str) -> None:
        """
        Select a model by ID.
        
        Args:
            model_id: ID of the model to select
        """
        self._current_model = model_id
        
    def get_current_model_info(self) -> Dict[str, Any]:
        """
        Get information about the currently selected model.
        
        Returns:
            Dictionary with model information
        """
        return {
            "name": self._current_model,
            "description": "Gemini Pro model for natural language processing",
            "capabilities": ["text-generation", "code-generation"]
        }
        
    def generate_content(self, prompt: str) -> Any:
        """
        Generate content using the selected model.
        
        Args:
            prompt: Input prompt
            
        Returns:
            Generated content
        """
        model = genai.GenerativeModel(self._current_model)
        return model.generate_content(prompt)
    
    def get_available_models(self) -> List[Dict[str, str]]:
        """
        Get a list of available models with their descriptions
        
        Returns:
            List of available models with their details
        """
        return self.registry.get_available_models()
    
    def get_current_model(self) -> ModelStrategy:
        """
        Get the currently selected model
        
        Returns:
            The currently selected model
        """
        return self.registry.get_current_model()
    
    def format_model_options(self) -> str:
        """
        Format the available models as a string for display
        
        Returns:
            Formatted string of model options
        """
        models = self.get_available_models()
        return " | ".join([f"{model['id']}. {model['name']}" for model in models])
    
    def format_model_details(self) -> List[str]:
        """
        Format the available models with detailed descriptions
        
        Returns:
            List of formatted model details
        """
        models = self.get_available_models()
        return [
            f"{model['id']}. {model['name']} - {model['description']}"
            for model in models
        ] 