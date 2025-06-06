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
        self.registry = ModelRegistry(api_key)
        # Initialize with the default model from registry
        self._current_model = self.registry.get_current_model()
        
    def select_model(self, model_id: str) -> bool:
        """
        Select a model by ID.
        
        Args:
            model_id: ID of the model to select
            
        Returns:
            bool: True if model was successfully selected, False otherwise
        """
        success = self.registry.select_model(model_id)
        if success:
            self._current_model = self.registry.get_current_model()
        return success
        
    def get_current_model_info(self) -> Dict[str, Any]:
        """
        Get information about the currently selected model.
        
        Returns:
            Dictionary with model information
        """
        model = self._current_model
        return {
            "name": model.get_model_name(),
            "description": model.get_model_description(),
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
        return self._current_model.generate_content(prompt)
    
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
        return self._current_model
    
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