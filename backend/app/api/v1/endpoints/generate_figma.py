from fastapi import APIRouter, HTTPException, Depends
from app.models.figma_input import FigmaInput
from app.models.generated_code import GeneratedCode
from app.services.figma_service import FigmaService
from app.services.code_generator import CodeGenerator

router = APIRouter()

@router.post("/", response_model=GeneratedCode)
async def generate_code_from_figma(
    figma_input: FigmaInput,
    figma_service: FigmaService = Depends(),
    code_generator: CodeGenerator = Depends()
):
    """
    Generate Angular component code from a Figma design URL.
    """
    try:
        # Fetch Figma design data
        figma_data = await figma_service.fetch_figma_design(
            figma_input.file_url,
            figma_input.node_id,
            figma_input.access_token
        )
        
        # Generate code from Figma data
        component_code = await code_generator.generate_from_figma_data(figma_data)
        
        return component_code
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing Figma design: {str(e)}") 