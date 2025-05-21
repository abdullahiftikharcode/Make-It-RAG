#!/usr/bin/env python3

import os
import sys
import json
import requests
from typing import Dict, List, Any, Optional
import argparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Default API URL
DEFAULT_API_URL = "http://localhost:8001"

class TextToSQLClient:
    """Interactive client for the Text-to-SQL API with model selection."""
    
    def __init__(self, api_url: str = DEFAULT_API_URL):
        """
        Initialize the client.
        
        Args:
            api_url: URL of the Text-to-SQL API
        """
        self.api_url = api_url
        self.current_db_url = None
        self.current_model_id = None
        self.models = []
        self.current_model = {}
        self._load_models()
    
    def _load_models(self):
        """Load available models from the API."""
        try:
            response = requests.get(f"{self.api_url}/models")
            if response.status_code == 200:
                data = response.json()
                self.models = data.get("models", [])
                self.current_model = data.get("current_model", {})
                print(f"Loaded {len(self.models)} available models.")
            else:
                print(f"Error loading models: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Failed to connect to API: {str(e)}")
    
    def display_models(self):
        """Display available models."""
        if not self.models:
            print("No models available.")
            return
        
        print("\n===== Available Models =====")
        for model in self.models:
            is_current = " (CURRENT)" if model.get("name") == self.current_model.get("name") else ""
            print(f"{model['id']}. {model['name']} - {model['description']}{is_current}")
        print("===========================\n")
    
    def select_model(self, model_id: str) -> bool:
        """
        Select a model by ID.
        
        Args:
            model_id: ID of the model to select
            
        Returns:
            True if successful, False otherwise
        """
        try:
            response = requests.post(
                f"{self.api_url}/models/select",
                json={"model_id": model_id}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success", False):
                    self.current_model = data.get("selected_model", {})
                    self.current_model_id = model_id
                    print(f"Successfully selected model: {self.current_model.get('name')}")
                    return True
                else:
                    print(f"Failed to select model: {data.get('message')}")
            else:
                print(f"Error selecting model: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Failed to connect to API: {str(e)}")
        
        return False
    
    def set_database_url(self, db_url: str):
        """Set the database URL for queries."""
        self.current_db_url = db_url
        print(f"Database URL set.")
    
    def execute_query(self, query: str):
        """
        Execute a natural language query.
        
        Args:
            query: Natural language query
        """
        if not self.current_db_url:
            print("Database URL not set. Please set it first.")
            return
        
        try:
            request_data = {
                "query": query,
                "db_url": self.current_db_url,
                "dialect": "MYSQL",  # Default dialect
            }
            
            # Add the selected model if we have one
            if self.current_model_id:
                request_data["selected_model_id"] = self.current_model_id
            
            response = requests.post(
                f"{self.api_url}/generate",
                json=request_data
            )
            
            if response.status_code == 200:
                data = response.json()
                self._display_results(data, query)
            else:
                print(f"Error executing query: {response.status_code}")
                if response.headers.get("content-type") == "application/json":
                    print(f"Error details: {response.json().get('detail')}")
                else:
                    print(response.text)
        except Exception as e:
            print(f"Failed to connect to API: {str(e)}")
    
    def _display_results(self, data: Dict[str, Any], query: str):
        """Display the query results."""
        print("\n" + "=" * 80)
        print(f"Query: {query}")
        print("-" * 80)
        print(f"Model used: {data.get('model_used')}")
        print("-" * 80)
        print("Generated SQL:")
        print(f"  {data.get('sql_query')}")
        print("-" * 80)
        
        # Format the columns and result data
        columns = data.get('columns', [])
        result_data = data.get('data', [])
        
        if columns and result_data:
            # Calculate column widths
            col_widths = [len(str(col)) for col in columns]
            for row in result_data:
                for i, cell in enumerate(row):
                    col_widths[i] = max(col_widths[i], len(str(cell)))
            
            # Print header
            header = " | ".join(f"{col:<{col_widths[i]}}" for i, col in enumerate(columns))
            print(header)
            print("-" * len(header))
            
            # Print rows
            for row in result_data:
                row_str = " | ".join(f"{str(cell):<{col_widths[i]}}" for i, cell in enumerate(row))
                print(row_str)
        else:
            print("No results returned.")
        
        print("-" * 80)
        print("Explanation:")
        print(data.get('explanation', 'No explanation provided.'))
        print("=" * 80 + "\n")

    def interactive_loop(self):
        """Start an interactive loop for the client."""
        print("===== SQL Chat Assistant - Interactive Client =====")
        print(f"API URL: {self.api_url}")
        
        if not self.models:
            print("Warning: No models loaded. API may be unavailable.")
        
        while True:
            print("\nCurrent Model: ", end="")
            if self.current_model:
                print(f"{self.current_model.get('name')}")
            else:
                print("None selected")
            
            print("\nOptions:")
            print("1. Set database URL")
            print("2. List available models")
            print("3. Select model")
            print("4. Execute query")
            print("5. Exit")
            
            choice = input("\nEnter your choice (1-5): ").strip()
            
            if choice == "1":
                db_url = input("Enter database URL: ").strip()
                self.set_database_url(db_url)
            elif choice == "2":
                self.display_models()
            elif choice == "3":
                self.display_models()
                model_id = input("Enter model ID to select: ").strip()
                self.select_model(model_id)
            elif choice == "4":
                query = input("Enter your natural language query: ").strip()
                self.execute_query(query)
            elif choice == "5":
                print("Exiting. Goodbye!")
                break
            else:
                print("Invalid choice. Please try again.")

def main():
    parser = argparse.ArgumentParser(description="Text-to-SQL Interactive Client")
    parser.add_argument("--api-url", default=DEFAULT_API_URL, help="URL of the Text-to-SQL API")
    args = parser.parse_args()
    
    client = TextToSQLClient(api_url=args.api_url)
    client.interactive_loop()

if __name__ == "__main__":
    main() 