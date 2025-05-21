from typing import Any, Dict, List, Optional
from python_server.components.model_registry import ModelRegistry, ModelStrategy

class ModelContext:
    """
    Context class that maintains the currently selected model strategy
    and delegates operations to it.
    """
    def __init__(self, api_key: str):
        self.registry = ModelRegistry(api_key)
        self.api_key = api_key
    
    def generate_content(self, prompt: str) -> Any:
        """
        Generate content using the currently selected model
        
        Args:
            prompt: The prompt to send to the model
            
        Returns:
            The model's response
        """
        return self.registry.generate_content(prompt)
    
    def select_model(self, model_id: str) -> bool:
        """
        Select a model by its ID
        
        Args:
            model_id: The ID of the model to select
            
        Returns:
            True if the model was selected successfully, False otherwise
        """
        return self.registry.select_model(model_id)
    
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
    
    def get_current_model_info(self) -> Dict[str, str]:
        """
        Get information about the currently selected model
        
        Returns:
            Dictionary with current model info
        """
        current_model = self.get_current_model()
        return {
            "name": current_model.get_model_name(),
            "description": current_model.get_model_description()
        } 