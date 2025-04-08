import base64
from typing import Dict, Any, List
import openai
import anthropic
from app.core.config import settings
from app.utils.image_processing import validate_image_size

class AIService:
    """
    Service for interacting with OpenAI and Anthropic APIs for image processing.
    """
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    async def process_image(self, image_data: bytes) -> Dict[str, Any]:
        """
        Process an image using the configured VLM (Vision Language Model).
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Dictionary containing the AI's description and analysis
        """
        # Validate image size
        validate_image_size(image_data, settings.MAX_IMAGE_SIZE_MB)
        
        # Process with the configured provider
        if settings.DEFAULT_VLM_PROVIDER == "openai":
            return await self._process_with_openai(image_data)
        elif settings.DEFAULT_VLM_PROVIDER == "anthropic":
            return await self._process_with_anthropic(image_data)
        else:
            raise ValueError(f"Unsupported VLM provider: {settings.DEFAULT_VLM_PROVIDER}")
    
    async def _process_with_openai(self, image_data: bytes) -> Dict[str, Any]:
        """Process image with OpenAI's GPT-4 Vision API."""
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        response = self.openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at converting UI designs into Angular components with Angular Material and TailwindCSS. Analyze the image and provide a detailed description of the layout, components, styling, and structure that would be needed to recreate it as an Angular component."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this UI design image. Describe it in detail, identifying Angular Material components and suggesting appropriate TailwindCSS classes for styling."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ],
            max_tokens=4000
        )
        
        return {
            "description": response.choices[0].message.content,
            "model_used": settings.OPENAI_MODEL
        }
    
    async def _process_with_anthropic(self, image_data: bytes) -> Dict[str, Any]:
        """Process image with Anthropic's Claude API."""
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        response = self.anthropic_client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=4000,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this UI design image. Describe it in detail, identifying Angular Material components and suggesting appropriate TailwindCSS classes for styling."},
                        {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": base64_image}}
                    ]
                }
            ],
            system="You are an expert at converting UI designs into Angular components with Angular Material and TailwindCSS. Analyze the image and provide a detailed description of the layout, components, styling, and structure that would be needed to recreate it as an Angular component."
        )
        
        return {
            "description": response.content[0].text,
            "model_used": settings.ANTHROPIC_MODEL
        } 