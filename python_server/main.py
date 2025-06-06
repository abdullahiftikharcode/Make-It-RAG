import os
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from python_server.api.endpoints import router
from python_server.dependencies import setup_dependencies

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup dependencies
setup_dependencies()

# Include routers
app.include_router(router)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}

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