import base64
from typing import Dict, Any, List
import openai
import anthropic
import google.generativeai as genai
from app.core.config import settings
from app.utils.image_processing import validate_image_size

class AIService:
    """
    Service for interacting with OpenAI, Anthropic, and Google Gemini APIs for image processing.
    """
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None
        
        # Initialize Gemini API if key is available
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.gemini_model = settings.GEMINI_MODEL
        else:
            self.gemini_model = None
    
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
        if settings.DEFAULT_VLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            return await self._process_with_openai(image_data)
        elif settings.DEFAULT_VLM_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY:
            return await self._process_with_anthropic(image_data)
        elif settings.DEFAULT_VLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            return await self._process_with_gemini(image_data)
        else:
            raise ValueError(f"Unsupported or unconfigured VLM provider: {settings.DEFAULT_VLM_PROVIDER}")
    
    async def _process_with_openai(self, image_data: bytes) -> Dict[str, Any]:
        """
        Process an image using OpenAI's Vision API.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Dictionary containing the OpenAI analysis
        """
        # Convert image bytes to base64 string
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        # Call OpenAI API
        response = self.openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert UI developer skilled at analyzing UI screenshots to convert them to Angular components."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this UI screenshot. Provide a detailed description of the layout, components, styling, colors, typography, and spacing."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000
        )
        
        # Extract the assistant's message content
        description = response.choices[0].message.content
        
        return {
            "description": description,
            "source": "openai"
        }
    
    async def _process_with_anthropic(self, image_data: bytes) -> Dict[str, Any]:
        """
        Process an image using Anthropic's Claude API.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Dictionary containing the Anthropic analysis
        """
        # Convert image bytes to base64
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        # Create the message with Anthropic
        response = self.anthropic_client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=1000,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this UI screenshot. Provide a detailed description of the layout, components, styling, colors, typography, and spacing."
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": base64_image
                            }
                        }
                    ]
                }
            ]
        )
        
        # Extract content from the response
        description = response.content[0].text
        
        return {
            "description": description,
            "source": "anthropic"
        }
        
    async def _process_with_gemini(self, image_data: bytes) -> Dict[str, Any]:
        """
        Process an image using Google's Gemini API.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Dictionary containing the Gemini analysis
        """
        # Get the Gemini model with optimized settings for 2.0
        model = genai.GenerativeModel(
            self.gemini_model,
            # Removing safety settings for now as they might not be supported
            # in the same format for the vision API
        )
        
        # Create prompt with image
        prompt = "Analyze this UI screenshot. Provide a detailed description of the layout, components, styling, colors, typography, and spacing."
        
        # Process with Gemini
        response = model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": image_data}
        ])
        
        # Extract the description
        description = response.text
        
        return {
            "description": description,
            "source": "gemini"
        } 