import os
from typing import Dict, List, Optional, Any
import google.generativeai as genai
from abc import ABC, abstractmethod

class ModelStrategy(ABC):
    """
    Abstract strategy interface for language models.
    Defines the contract that all model strategies must follow.
    """
    @abstractmethod
    def generate_content(self, prompt: str) -> Any:
        """Generate content using the model"""
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        """Get the name of the model"""
        pass
    
    @abstractmethod
    def get_model_description(self) -> str:
        """Get a description of the model"""
        pass

class GeminiProModel(ModelStrategy):
    """Gemini Pro model implementation"""
    
    def __init__(self, api_key: str, model_name: str = "gemini-2.0-flash-lite-001", temperature: float = 0.7):
        genai.configure(api_key=api_key)
        self.model_name = model_name
        self.model = genai.GenerativeModel(self.model_name, generation_config={
            "temperature": temperature
        })
    
    def generate_content(self, prompt: str) -> Any:
        return self.model.generate_content(prompt)
    
    def get_model_name(self) -> str:
        return self.model_name
    
    def get_model_description(self) -> str:
        return "Google's Gemini model - balanced performance"

class GeminiUltraModel(ModelStrategy):
    """Gemini Ultra model implementation"""
    
    def __init__(self, api_key: str, temperature: float = 0.2):
        genai.configure(api_key=api_key)
        self.model_name = "gemini-pro"  # Using pro as Ultra is not yet publicly available
        self.model = genai.GenerativeModel(self.model_name, generation_config={
            "temperature": temperature
        })
    
    def generate_content(self, prompt: str) -> Any:
        return self.model.generate_content(prompt)
    
    def get_model_name(self) -> str:
        return "Gemini Ultra"
    
    def get_model_description(self) -> str:
        return "Google's most capable model - highest quality, slower speed"

class MistralModel(ModelStrategy):
    """Mistral-7B model implementation"""
    
    def __init__(self, api_key: str, temperature: float = 0.8):
        genai.configure(api_key=api_key)
        # For simplicity, we're still using Gemini API under the hood,
        # but in a real implementation, this would use the Mistral API
        self.model_name = "gemini-pro"  # Simulating Mistral using Gemini
        self.model = genai.GenerativeModel(self.model_name, generation_config={
            "temperature": temperature
        })
    
    def generate_content(self, prompt: str) -> Any:
        return self.model.generate_content(prompt)
    
    def get_model_name(self) -> str:
        return "Mistral-7B"
    
    def get_model_description(self) -> str:
        return "Lightweight open-source model - fast performance"

class LlamaModel(ModelStrategy):
    """Llama-3 model implementation"""
    
    def __init__(self, api_key: str, temperature: float = 0.5):
        genai.configure(api_key=api_key)
        # For simplicity, we're still using Gemini API under the hood,
        # but in a real implementation, this would use the Llama API
        self.model_name = "gemini-pro"  # Simulating Llama using Gemini
        self.model = genai.GenerativeModel(self.model_name, generation_config={
            "temperature": temperature
        })
    
    def generate_content(self, prompt: str) -> Any:
        return self.model.generate_content(prompt)
    
    def get_model_name(self) -> str:
        return "Llama-3"
    
    def get_model_description(self) -> str:
        return "Meta's Llama-3 model - good balance of quality and speed"

class ModelRegistry:
    """
    Registry for available model strategies.
    Manages the collection of model strategies and allows for runtime selection.
    """
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.models: Dict[str, ModelStrategy] = {}
        self.current_model: Optional[ModelStrategy] = None
        self._initialize_models()
    
    def _initialize_models(self) -> None:
        """Initialize available models"""
        self.models = {
            "gemini-2.0-flash-lite-001": GeminiProModel(self.api_key, "gemini-2.0-flash-lite-001"),
            "gemini-1.5-flash": GeminiProModel(self.api_key, "gemini-1.5-flash"),
            "gemini-2.5-flash-preview-04-17": GeminiProModel(self.api_key, "gemini-2.5-flash-preview-04-17")
        }
        # Set default model
        self.current_model = self.models["gemini-2.0-flash-lite-001"]
    
    def get_available_models(self) -> List[Dict[str, str]]:
        """Get list of available models with their descriptions"""
        return [
            {
                "id": model_id,
                "name": model.get_model_name(),
                "description": model.get_model_description()
            }
            for model_id, model in self.models.items()
        ]
    
    def select_model(self, model_id: str) -> bool:
        """Select a model by ID"""
        if model_id in self.models:
            self.current_model = self.models[model_id]
            return True
        return False
    
    def get_current_model(self) -> ModelStrategy:
        """Get the currently selected model"""
        return self.current_model
    
    def generate_content(self, prompt: str) -> Any:
        """Generate content using the currently selected model"""
        if not self.current_model:
            raise ValueError("No model selected")
        return self.current_model.generate_content(prompt) 