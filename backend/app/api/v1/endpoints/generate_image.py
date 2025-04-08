from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.models.image_input import ImageInput
from app.models.generated_code import GeneratedCode
from app.services.ai_service import AIService
from app.services.code_generator import CodeGenerator

router = APIRouter()

@router.post("/", response_model=GeneratedCode)
async def generate_code_from_image(
    file: UploadFile = File(...),
    ai_service: AIService = Depends(),
    code_generator: CodeGenerator = Depends()
):
    """
    Generate Angular component code from an uploaded image file.
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Process the image
        image_content = await file.read()
        
        # Get AI description of the image
        ai_description = await ai_service.process_image(image_content)
        
        # Generate code from the description
        component_code = await code_generator.generate_from_image_description(ai_description)
        
        return component_code
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}") 