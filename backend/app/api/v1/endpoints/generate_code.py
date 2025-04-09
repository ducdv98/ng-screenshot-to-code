from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Response
from fastapi.responses import StreamingResponse
from app.models.figma_input import FigmaInput
from app.services.ai_service import AIService
from app.services.code_generator import CodeGenerator
from app.services.project_assembler_service import ProjectAssemblerService
from app.services.packaging_service import PackagingService
from app.services.figma_service import FigmaService
from typing import Dict, Any, Optional
import io

router = APIRouter()

@router.post("/image")
async def generate_project_from_image(
    file: UploadFile = File(...),
    ai_service: AIService = Depends(),
    code_generator: CodeGenerator = Depends(),
    project_assembler: ProjectAssemblerService = Depends(),
    packaging_service: PackagingService = Depends()
):
    """
    Generate a complete Angular project from an uploaded image file and return it as a downloadable ZIP archive.
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
        generated_code = await code_generator.generate_from_image_description(ai_description)
        
        # Extract components and routing information
        components = generated_code.components or []
        routing = generated_code.routing
        
        # If no components were generated, use the main component
        if not components:
            components = [{
                "componentName": generated_code.component_name,
                "typescript": generated_code.component_ts,
                "html": generated_code.component_html,
                "scss": generated_code.component_scss
            }]
        
        # Assemble the project structure
        virtual_fs = project_assembler.assemble_project(components, routing)
        
        # Create a ZIP archive
        zip_stream = packaging_service.create_zip_archive_with_stream(virtual_fs)
        
        # Return the ZIP as a downloadable file
        return StreamingResponse(
            iter([zip_stream.getvalue()]),
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=generated_angular_project.zip"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating project: {str(e)}")

@router.post("/figma")
async def generate_project_from_figma(
    figma_input: FigmaInput,
    figma_service: FigmaService = Depends(),
    code_generator: CodeGenerator = Depends(),
    project_assembler: ProjectAssemblerService = Depends(),
    packaging_service: PackagingService = Depends()
):
    """
    Generate a complete Angular project from a Figma design URL and return it as a downloadable ZIP archive.
    """
    try:
        # Fetch Figma design data
        figma_data = await figma_service.fetch_figma_design(
            figma_input.file_url,
            figma_input.node_id,
            figma_input.access_token
        )
        
        # Generate code from Figma data
        generated_code = await code_generator.generate_from_figma_data(figma_data)
        
        # Extract components and routing information
        components = generated_code.components or []
        routing = generated_code.routing
        
        # If no components were generated, use the main component
        if not components:
            components = [{
                "componentName": generated_code.component_name,
                "typescript": generated_code.component_ts,
                "html": generated_code.component_html,
                "scss": generated_code.component_scss
            }]
        
        # Assemble the project structure
        virtual_fs = project_assembler.assemble_project(components, routing)
        
        # Create a ZIP archive
        zip_stream = packaging_service.create_zip_archive_with_stream(virtual_fs)
        
        # Return the ZIP as a downloadable file
        return StreamingResponse(
            iter([zip_stream.getvalue()]),
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=generated_angular_project.zip"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating project: {str(e)}") 