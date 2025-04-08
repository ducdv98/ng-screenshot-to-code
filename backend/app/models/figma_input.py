from pydantic import BaseModel, Field, HttpUrl
from typing import Optional

class FigmaInput(BaseModel):
    """
    Model representing input data for Figma-to-code generation.
    """
    file_url: HttpUrl = Field(..., description="URL to the Figma file")
    node_id: Optional[str] = Field(None, description="Optional node ID to target specific frame")
    access_token: str = Field(..., description="Figma access token") 