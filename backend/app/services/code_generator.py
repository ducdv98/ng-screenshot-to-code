from typing import Dict, Any, List
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
        
        # Extract color hints if available
        color_hints = ai_description.get("colors", [])
        
        # Choose the appropriate service based on the configured VLM provider
        if settings.DEFAULT_VLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            result = await self._generate_with_openai(description_text)
        elif settings.DEFAULT_VLM_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY:
            result = await self._generate_with_anthropic(description_text)
        elif settings.DEFAULT_VLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            result = await self._generate_with_gemini(description_text, color_hints)
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
        # Extract component definitions from figma data if they exist
        component_definitions = {}
        if 'file_data' in figma_data and 'components' in figma_data['file_data']:
            component_definitions = figma_data['file_data'].get('components', {})
        
        # Parse figma nodes to extract component structure
        warnings = []
        
        # This would involve complex logic to map Figma nodes to Angular components
        # For now, we'll extract a description that includes component recognition
        figma_description = self._extract_figma_description(figma_data, component_definitions, warnings)
        
        # Choose the appropriate service
        if settings.DEFAULT_VLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            result = await self._generate_with_openai(figma_description)
        elif settings.DEFAULT_VLM_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY:
            result = await self._generate_with_anthropic(figma_description)
        elif settings.DEFAULT_VLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            result = await self._generate_with_gemini(figma_description)
        else:
            raise ValueError(f"Unsupported or unconfigured VLM provider: {settings.DEFAULT_VLM_PROVIDER}")
        
        # If we have warnings from the node parsing, inject them into the HTML as comments
        component_html = result.get("component_html", "")
        if warnings:
            warning_comments = "\n".join([f"<!-- Warning: {warning} -->" for warning in warnings])
            component_html = f"{warning_comments}\n{component_html}"
        
        return GeneratedCode(
            component_ts=result.get("component_ts", ""),
            component_html=component_html,
            component_scss=result.get("component_scss", ""),
            component_name=result.get("component_name", "figma-component"),
            warnings=warnings if warnings else None
        )
    
    def _extract_figma_description(self, figma_data: Dict[str, Any], component_definitions: Dict[str, Any] = None, warnings: List[str] = None) -> str:
        """
        Extract a textual description from Figma data for use in prompts.
        
        Args:
            figma_data: The Figma API response data
            component_definitions: Dictionary of component definitions from Figma
            warnings: List to collect warnings during processing
            
        Returns:
            A detailed description of the Figma design
        """
        if warnings is None:
            warnings = []
        
        # Basic structure info
        basic_info = f"Figma design with {len(figma_data.get('file_data', {}).get('document', {}).get('children', []))} pages."
        
        # Extract component instances information if available
        component_info = []
        
        # If we have node data (when a specific node was requested)
        if 'node_data' in figma_data and figma_data['node_data']:
            node_data = figma_data['node_data']
            component_info.extend(self._extract_component_instances(node_data, component_definitions, warnings))
        # Otherwise, try to process the entire document
        elif 'file_data' in figma_data and 'document' in figma_data['file_data']:
            document = figma_data['file_data']['document']
            for page in document.get('children', []):
                for frame in page.get('children', []):
                    component_info.extend(self._extract_component_instances(frame, component_definitions, warnings))
        
        # Create a detailed description including component information
        component_description = ""
        if component_info:
            component_description = "\n\nComponent Instances Found:\n" + "\n".join(component_info)
        
        return f"{basic_info}{component_description}"
    
    def _extract_component_instances(self, node: Dict[str, Any], component_definitions: Dict[str, Any], warnings: List[str]) -> List[str]:
        """
        Recursively extract component instances from a Figma node tree.
        
        Args:
            node: The current Figma node to process
            component_definitions: Dictionary of component definitions from Figma
            warnings: List to collect warnings during processing
            
        Returns:
            List of component instance descriptions
        """
        component_info = []
        
        # Check if this node is a component instance
        if node.get('type') == 'INSTANCE':
            component_id = node.get('componentId')
            if component_id and component_definitions and component_id in component_definitions:
                # Get information about the component this instance is based on
                component_def = component_definitions[component_id]
                component_name = component_def.get('name', 'Unknown Component')
                component_info.append(f"- {node.get('name', 'Unnamed')} is an instance of component '{component_name}'")
            else:
                # Instance without defined component or component not found
                warnings.append(f"Component instance '{node.get('name', 'Unnamed')}' references undefined component")
                component_info.append(f"- {node.get('name', 'Unnamed')} is an instance of an unknown component")
        
        # Recursively process children
        for child in node.get('children', []):
            component_info.extend(self._extract_component_instances(child, component_definitions, warnings))
        
        return component_info
    
    def _create_prompt(self, description: str, color_hints: list = None) -> str:
        """
        Create a detailed prompt for code generation based on the description.
        
        Args:
            description: The UI description to generate code for
            color_hints: Optional list of colors extracted from the uploaded image
        
        Returns:
            A detailed prompt with examples and requirements
        """
        # Format color hints if provided
        color_section = ""
        if color_hints and len(color_hints) > 0:
            color_list = ", ".join([f'"{color}"' for color in color_hints])
            color_section = f"""
Color Palette:
Use these colors extracted from the image as a starting point for your design: [{color_list}]
Apply these colors to appropriate elements to maintain visual consistency with the original design.
"""
        
        # Check if description contains component instances
        component_section = ""
        if "Component Instances Found:" in description:
            component_section = """
Component Instances:
The Figma design contains component instances which should be reflected in the HTML.
For each component instance mentioned, add an HTML comment above the corresponding element with the format:
<!-- Figma Component: ComponentName -->

Additionally, add a data attribute to the element: data-figma-component="ComponentName"
For example: <div data-figma-component="ButtonPrimary" class="...">...</div>
"""
        
        prompt = f"""Your task is to generate a precise Angular component based on the following design description:

{description}

{color_section}
{component_section}

Requirements:
1. Utilize Angular Material components and Tailwind CSS classes for styling.
2. Generate a standalone Angular component (use the latest Angular syntax).
3. The response should include three separate code blocks:
   - component_ts: Component TypeScript code with imports and decorator.
   - component_html: Component template (HTML).
   - component_scss: Component styles (SCSS).
   - component_name: A suggestive name for the component.

Component Guidelines:
- Create a reusable component with appropriate inputs for customization.
- Use semantic HTML and ensure accessibility.
- Apply Tailwind CSS for layout, spacing, colors, and responsive design.
- Use Angular Material components for complex UI elements (buttons, inputs, cards, etc.).
- Use Flex or Grid layout appropriately for element positioning.
- Include responsive design considerations.

Important Implementation Details:
- For Material components, use the appropriate directives and import statements.
- Use Tailwind class naming conventions consistently.
- Any icons should use Material Icons.
- Ensure text content matches the design as closely as possible.

Your output must be in the following valid JSON format:
```json
{{
  "component_ts": "// TypeScript code here...",
  "component_html": "<!-- HTML code here... -->",
  "component_scss": "/* SCSS styles here... */",
  "component_name": "suggested-component-name"
}}
```
"""
        
        return prompt
    
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
        
    async def _generate_with_gemini(self, description: str, color_hints: list = None) -> Dict[str, Any]:
        """
        Generate code using Google Gemini 2.0.
        
        Args:
            description: The UI description to generate code for
            color_hints: Optional list of colors extracted from the uploaded image
            
        Returns:
            Dictionary containing the generated code components
        """
        prompt = self._create_prompt(description, color_hints)
        
        # Add the system prompt to the beginning of the user prompt
        system_prompt = "You are an expert Angular developer who specializes in creating components with Angular Material and TailwindCSS. Generate clean, organized code that follows Angular best practices."
        combined_prompt = f"{system_prompt}\n\n{prompt}"
        
        # Get the Gemini model for text generation with optimized settings
        model = genai.GenerativeModel(
            self.gemini_model,
            generation_config={
                "temperature": 0.3,  # Lowered for more consistent results
                "top_p": 0.85,       # Adjusted for better focus on high-probability tokens
                "top_k": 40,
                "max_output_tokens": 8192  # Ensure we have enough tokens for complex components
            }
        )
        
        # Generate with Gemini
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