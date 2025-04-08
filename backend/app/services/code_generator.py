from typing import Dict, Any
import openai
import anthropic
from app.core.config import settings
from app.models.generated_code import GeneratedCode

class CodeGenerator:
    """
    Service for generating Angular component code based on AI descriptions or Figma data.
    """
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    
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
        if settings.DEFAULT_VLM_PROVIDER == "openai":
            result = await self._generate_with_openai(description_text)
        elif settings.DEFAULT_VLM_PROVIDER == "anthropic":
            result = await self._generate_with_anthropic(description_text)
        else:
            raise ValueError(f"Unsupported VLM provider: {settings.DEFAULT_VLM_PROVIDER}")
        
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
        if settings.DEFAULT_VLM_PROVIDER == "openai":
            result = await self._generate_with_openai(figma_description)
        elif settings.DEFAULT_VLM_PROVIDER == "anthropic":
            result = await self._generate_with_anthropic(figma_description)
        else:
            raise ValueError(f"Unsupported VLM provider: {settings.DEFAULT_VLM_PROVIDER}")
        
        return GeneratedCode(
            component_ts=result.get("component_ts", ""),
            component_html=result.get("component_html", ""),
            component_scss=result.get("component_scss", ""),
            component_name=result.get("component_name", "figma-component")
        )
    
    def _extract_figma_description(self, figma_data: Dict[str, Any]) -> str:
        """Extract a textual description from Figma data for AI processing."""
        # This is a simplified version that would need to be expanded
        # Here we'd parse the Figma document structure and convert it to a detailed text description
        
        file_data = figma_data.get("file_data", {})
        node_data = figma_data.get("node_data", {})
        
        # Extract document name
        document_name = file_data.get("name", "Untitled Figma Document")
        
        # If we have specific node data, describe that node
        description = f"Figma design titled '{document_name}'.\n\n"
        
        if node_data:
            node = node_data.get("document", {})
            node_name = node.get("name", "Untitled Node")
            node_type = node.get("type", "UNKNOWN")
            
            description += f"Node '{node_name}' of type {node_type}.\n"
            
            # Add more logic here to extract colors, typography, layout, etc.
            
        else:
            # Describe the whole document
            document = file_data.get("document", {})
            children = document.get("children", [])
            
            description += f"The document contains {len(children)} top-level frames/artboards.\n"
            
            # List a few frames/artboards
            for i, child in enumerate(children[:5]):
                child_name = child.get("name", "Untitled Frame")
                child_type = child.get("type", "UNKNOWN")
                description += f"- {child_name} ({child_type})\n"
            
            if len(children) > 5:
                description += f"And {len(children) - 5} more frames/artboards...\n"
        
        return description
    
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
    
    def _create_prompt(self, description: str) -> str:
        """Create a detailed prompt for code generation."""
        return f"""
        Based on the following UI description, generate an Angular component that implements this design using Angular Material components and TailwindCSS for styling:
        
        {description}
        
        Please provide:
        
        1. A TypeScript file (component.ts) using the standalone component architecture
        2. An HTML template file (component.html) using Angular Material components where appropriate
        3. A SCSS file (component.scss) with TailwindCSS utility classes
        4. A suggested component name
        
        Use Angular Material components like mat-button, mat-card, mat-form-field where appropriate. Use TailwindCSS utility classes for layout, spacing, colors, and typography.
        
        Format your response using the following JSON structure:
        
        ```json
        {{
            "component_ts": "// TypeScript code here",
            "component_html": "<!-- HTML template here -->",
            "component_scss": "/* SCSS styles here */",
            "component_name": "suggested-name"
        }}
        ```
        
        Make sure the component follows Angular best practices, using proper typing, modern Angular features, and idiomatic code.
        """
    
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