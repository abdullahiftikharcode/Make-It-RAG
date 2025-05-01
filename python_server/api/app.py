import os
os.environ["TRANSFORMERS_NO_TF"] = "1"  # Disable TensorFlow integration in Transformers

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from python_server.api.endpoints import router
from python_server.config.config import APP_TITLE, APP_DESCRIPTION, APP_VERSION

def create_app():
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=APP_TITLE,
        description=APP_DESCRIPTION,
        version=APP_VERSION
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allows all origins
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
    )
    
    # Add router
    app.include_router(router)
    
    # Exception handlers
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=400,
            content={"detail": str(exc)},
        )
        
    return app
    
app = create_app() 