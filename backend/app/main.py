from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title="Screenshot to Angular Code API",
    description="API for converting screenshots/mockups to Angular components",
    version="0.1.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Screenshot to Angular Code API is running"}

@app.get("/health", tags=["Health Check"])
async def health_check():
    """Check if the application is running."""
    return {"status": "ok"} 