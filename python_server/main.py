import os
import uvicorn
from dotenv import load_dotenv

if __name__ == "__main__":
    # Load environment variables
    load_dotenv()
    
    # Get configuration from environment or use defaults
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8001"))
    reload = os.getenv("RELOAD", "True").lower() == "true"
    
    print(f"Starting text-to-SQL server on http://{host}:{port}")
    print("Press CTRL+C to quit")
    
    # Start the server
    uvicorn.run(
        "python_server.api.app:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    ) 