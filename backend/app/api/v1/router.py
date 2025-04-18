from fastapi import APIRouter
from app.api.v1.endpoints import generate_image, generate_figma, generate_code

api_router = APIRouter()

api_router.include_router(generate_image.router, prefix="/generate-image", tags=["Image Generation"])
api_router.include_router(generate_figma.router, prefix="/generate-figma", tags=["Figma Generation"])
api_router.include_router(generate_code.router, prefix="/generate-code", tags=["Code Generation"]) 