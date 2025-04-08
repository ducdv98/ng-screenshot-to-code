from pydantic import BaseModel, Field
from typing import Optional

class ImageInput(BaseModel):
    """
    Model representing input data for image-to-code generation.
    Not used directly in the API since we're using UploadFile,
    but useful for documentation and type hinting.
    """
    additional_instructions: Optional[str] = Field(
        None, 
        description="Additional instructions for the code generation (e.g. preferences)"
    ) 