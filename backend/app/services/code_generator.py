from typing import Dict, Any
import openai
import anthropic
import google.generativeai as genai
from app.core.config import settings
from app.models.generated_code import GeneratedCode

class CodeGenerator:
    """
    Service for generating Angular component code based on AI descriptions or Figma data.
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
    
    async def generate_from_image_description(self, ai_description: Dict[str, Any]) -> GeneratedCode:
        """
        Generate Angular component code from AI-generated description of an image.
        
        Args:
            ai_description: Dictionary containing the AI's description and analysis
            
        Returns:
            GeneratedCode object with component_ts, component_html, component_scss, and component_name
        """
        description_text = ai_description.get("description", "")
        
        # Choose the appropriate service based on the configured VLM provider
        if settings.DEFAULT_VLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            result = await self._generate_with_openai(description_text)
        elif settings.DEFAULT_VLM_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY:
            result = await self._generate_with_anthropic(description_text)
        elif settings.DEFAULT_VLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            result = await self._generate_with_gemini(description_text)
        else:
            raise ValueError(f"Unsupported or unconfigured VLM provider: {settings.DEFAULT_VLM_PROVIDER}")
        
        return GeneratedCode(
            component_ts=result.get("component_ts", ""),
            component_html=result.get("component_html", ""),
            component_scss=result.get("component_scss", ""),
            component_name=result.get("component_name", "ui-component")
        )
    
    async def generate_from_figma_data(self, figma_data: Dict[str, Any]) -> GeneratedCode:
        """
        Generate Angular component code from Figma design data.
        
        Args:
            figma_data: Dictionary containing Figma design data
            
        Returns:
            GeneratedCode object with component_ts, component_html, component_scss, and component_name
        """
        # This would involve complex logic to map Figma nodes to Angular components
        # For now, we'll send the Figma data to the AI to have it generate the code
        
        # Convert Figma data to a text description for the AI
        figma_description = self._extract_figma_description(figma_data)
        
        # Choose the appropriate service
        if settings.DEFAULT_VLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            result = await self._generate_with_openai(figma_description)
        elif settings.DEFAULT_VLM_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY:
            result = await self._generate_with_anthropic(figma_description)
        elif settings.DEFAULT_VLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            result = await self._generate_with_gemini(figma_description)
        else:
            raise ValueError(f"Unsupported or unconfigured VLM provider: {settings.DEFAULT_VLM_PROVIDER}")
        
        return GeneratedCode(
            component_ts=result.get("component_ts", ""),
            component_html=result.get("component_html", ""),
            component_scss=result.get("component_scss", ""),
            component_name=result.get("component_name", "figma-component")
        )
    
    def _extract_figma_description(self, figma_data: Dict[str, Any]) -> str:
        """Extract a textual description from Figma data for use in prompts."""
        # Simplified for now - in a real implementation, this would parse the Figma nodes
        # and create a structured text description
        return f"Figma design with {len(figma_data.get('nodes', []))} nodes."
    
    def _create_prompt(self, description: str) -> str:
        """Create a detailed prompt for code generation based on the description."""
        return f"""
Based on the following UI description, generate an Angular component with Angular Material components and TailwindCSS.

UI DESCRIPTION:
{description}

Requirements:
1. Generate TypeScript code for an Angular component with the @Component decorator and necessary imports.
2. Generate HTML template using Angular Material components where appropriate (like mat-button, mat-card, etc.) and TailwindCSS for styling.
3. Generate SCSS with any custom styles needed beyond TailwindCSS.
4. Suggest an appropriate component name.

Format your response as a JSON object with the following properties:
- component_ts: The TypeScript code for the component
- component_html: The HTML template
- component_scss: The SCSS styles
- component_name: A suggested name for the component (kebab-case)

Make sure the code follows best practices:
- Use Angular's standalone components
- Apply proper TypeScript types
- Use TailwindCSS for styling as much as possible
- Implement responsive design
- Keep accessibility in mind
"""
    
    async def _generate_with_openai(self, description: str) -> Dict[str, Any]:
        """Generate code using OpenAI."""
        prompt = self._create_prompt(description)
        
        response = self.openai_client.chat.completions.create(
            model="gpt-4",  # Using GPT-4 for code generation (could be different from vision model)
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert Angular developer who specializes in creating components with Angular Material and TailwindCSS. Generate clean, organized code that follows Angular best practices."
                },
                {"role": "user", "content": prompt}
            ],
            max_tokens=4000
        )
        
        return self._parse_ai_response(response.choices[0].message.content)
    
    async def _generate_with_anthropic(self, description: str) -> Dict[str, Any]:
        """Generate code using Anthropic."""
        prompt = self._create_prompt(description)
        
        response = self.anthropic_client.messages.create(
            model="claude-3-opus-20240229",  # Could be different from vision model
            max_tokens=4000,
            messages=[
                {"role": "user", "content": prompt}
            ],
            system="You are an expert Angular developer who specializes in creating components with Angular Material and TailwindCSS. Generate clean, organized code that follows Angular best practices."
        )
        
        return self._parse_ai_response(response.content[0].text)
        
    async def _generate_with_gemini(self, description: str) -> Dict[str, Any]:
        """Generate code using Google Gemini 2.0."""
        prompt = self._create_prompt(description)
        
        # Add the system prompt to the beginning of the user prompt
        system_prompt = "You are an expert Angular developer who specializes in creating components with Angular Material and TailwindCSS. Generate clean, organized code that follows Angular best practices."
        combined_prompt = f"{system_prompt}\n\n{prompt}"
        
        # Get the Gemini model for text generation with optimized settings for 2.0
        model = genai.GenerativeModel(
            self.gemini_model,
            generation_config={
                "temperature": 0.2,
                "top_p": 0.95,
                "top_k": 40
            }
            # Removing safety settings for now as they might be causing issues
        )
        
        # Generate with Gemini 2.0
        response = model.generate_content(combined_prompt)
        
        return self._parse_ai_response(response.text)
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the AI response to extract the generated code components."""
        # Simple approach: Look for JSON block in the response
        try:
            import json
            import re
            
            # Find JSON block - looking for content between ```json and ```
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', response_text)
            if json_match:
                json_str = json_match.group(1)
                return json.loads(json_str)
                
            # If no JSON block with explicit marker, try to find any JSON object
            json_match = re.search(r'({[\s\S]*})', response_text)
            if json_match:
                json_str = json_match.group(1)
                return json.loads(json_str)
            
            # Fallback: Parse structured response
            component_ts_match = re.search(r'```typescript\s*([\s\S]*?)\s*```', response_text)
            component_html_match = re.search(r'```html\s*([\s\S]*?)\s*```', response_text)
            component_scss_match = re.search(r'```scss\s*([\s\S]*?)\s*```', response_text)
            component_name_match = re.search(r'component name:\s*([a-z0-9-]+)', response_text, re.IGNORECASE)
            
            result = {}
            if component_ts_match:
                result["component_ts"] = component_ts_match.group(1).strip()
            if component_html_match:
                result["component_html"] = component_html_match.group(1).strip()
            if component_scss_match:
                result["component_scss"] = component_scss_match.group(1).strip()
            if component_name_match:
                result["component_name"] = component_name_match.group(1).strip()
                
            if result:
                return result
            
            # Last resort: return empty structure with error message
            return {
                "component_ts": "// Error parsing AI response",
                "component_html": "<!-- Error parsing AI response -->",
                "component_scss": "/* Error parsing AI response */",
                "component_name": "error-component"
            }
            
        except Exception as e:
            # Return error message embedded in the code
            return {
                "component_ts": f"// Error parsing AI response: {str(e)}",
                "component_html": f"<!-- Error parsing AI response: {str(e)} -->",
                "component_scss": f"/* Error parsing AI response: {str(e)} */",
                "component_name": "error-component"
            } 