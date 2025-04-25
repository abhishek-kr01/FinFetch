# """
# Financial App - FastAPI Backend
# Main application file that configures and runs the FastAPI server
# """
# import uvicorn
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse

# from app.core.config import settings
# from app.api import auth, stocks, news, chatbot, user
# from app.core.database import connect_and_init_db

# # Create FastAPI app
# app = FastAPI(
#     title=settings.APP_NAME,
#     description="A professional financial data and analysis platform",
#     version="1.0.0",
# )

# # Add CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.CORS_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Include routers
# app.include_router(auth.router, prefix="/api", tags=["Authentication"])
# app.include_router(user.router, prefix="/api", tags=["Users"])
# app.include_router(stocks.router, prefix="/api", tags=["Stocks"])
# app.include_router(news.router, prefix="/api", tags=["News"])
# app.include_router(chatbot.router, prefix="/api", tags=["Chatbot"])

# @app.on_event("startup")
# async def startup():
#     """
#     Connect to MongoDB and initialize database on startup
#     """
#     await connect_and_init_db()

# @app.get("/", tags=["Root"])
# async def root():
#     """
#     Root endpoint for the API
#     """
#     return JSONResponse(
#         status_code=200,
#         content={
#             "message": "Welcome to the Financial App API",
#             "docs": "/docs",
#             "status": "operational"
#         }
#     )

# if __name__ == "__main__":
#     # For development, use hot reload
#     uvicorn.run(
#         "main:app", 
#         host=settings.HOST, 
#         port=settings.PORT, 
#         reload=settings.DEBUG
#     )

"""
Financial App - FastAPI Backend
Main application file that configures and runs the FastAPI server
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api import auth, stocks, news, chatbot, user
from app.core.database import connect_and_init_db

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="A professional financial data and analysis platform",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(user.router, prefix="/api", tags=["Users"])
app.include_router(stocks.router, prefix="/api", tags=["Stocks"])
app.include_router(news.router, prefix="/api", tags=["News"])
app.include_router(chatbot.router, prefix="/api", tags=["Chatbot"])

@app.on_event("startup")
async def startup():
    """
    Connect to MongoDB and initialize database on startup
    """
    await connect_and_init_db()

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint for the API
    """
    return JSONResponse(
        status_code=200,
        content={
            "message": "Welcome to the Financial App API",
            "docs": "/docs",
            "status": "operational"
        }
    )

if __name__ == "__main__":
    # For development, use hot reload
    uvicorn.run(
        "main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=settings.DEBUG
    )