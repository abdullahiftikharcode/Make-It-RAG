import os
from abc import ABC, abstractmethod
import google.generativeai as genai
from python_server.config.config import GEMINI_MODEL

class ModelConfig:
    """
    Configuration class for AI models.
    """
    def __init__(self, model_name, api_key, additional_params=None):
        self.model_name = model_name
        self.api_key = api_key
        self.additional_params = additional_params or {}

class AIModel(ABC):
    """
    Abstract base class for AI models.
    """
    @abstractmethod
    def generate_content(self, prompt):
        pass

    @abstractmethod
    def get_model_name(self):
        pass

class GeminiModel(AIModel):
    """
    Implementation for Google's Gemini model.
    """
    def __init__(self, config):
        genai.configure(api_key=config.api_key)
        self.model_name = config.model_name
        self.model = genai.GenerativeModel(self.model_name, generation_config=config.additional_params)

    def generate_content(self, prompt):
        return self.model.generate_content(prompt)

    def get_model_name(self):
        return self.model_name

class MistralModel(AIModel):
    """
    Implementation for Mistral 7B model.
    """
    def __init__(self, config):
        # For simplicity, we're still using Gemini API under the hood,
        # but in a real implementation, this would use the Mistral API
        genai.configure(api_key=config.api_key)
        # Using the fallback model setting
        self.model_name = "gemini-1.0-pro"  # Simulating a smaller model
        self.model = genai.GenerativeModel(self.model_name)
        self.params = config.additional_params

    def generate_content(self, prompt):
        return self.model.generate_content(prompt)

    def get_model_name(self):
        return "mistral-7b"  # Return the name we're simulating

class ModelFactory:
    """
    Factory for creating AI model instances based on subscription tier.
    """
    @staticmethod
    def create_model(subscription_tier, api_key):
        """
        Creates and returns an AI model based on the user's subscription tier.
        
        Args:
            subscription_tier: The user's subscription tier ('personal' or 'corporate')
            api_key: The API key to use for model access
            
        Returns:
            An instance of an AIModel implementation
        """
        if subscription_tier == 'corporate':
            # For corporate tier, use the most capable model
            config = ModelConfig(
                model_name="gemini-2.5-flash-preview-04-17",
                api_key=api_key,
                additional_params={"temperature": 0.2}
            )
            return GeminiModel(config)
        else:
            # For personal tier, use a more cost-effective model
            config = ModelConfig(
                model_name="gemini-1.5-flash",
                api_key=api_key,
                additional_params={"temperature": 0.7}
            )
            return GeminiModel(config) 