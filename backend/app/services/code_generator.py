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
        
        # Create the GeneratedCode object from the main component
        generated_code = GeneratedCode(
            component_ts=result.get("component_ts", ""),
            component_html=result.get("component_html", ""),
            component_scss=result.get("component_scss", ""),
            component_name=result.get("component_name", "ui-component")
        )
        
        # Attach all components array if available
        if "components" in result and isinstance(result["components"], list):
            generated_code.components = result["components"]
        
        return generated_code
    
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
            
            # Also update the HTML in the components array if it exists
            if "components" in result and isinstance(result["components"], list) and len(result["components"]) > 0:
                # Update the first component's HTML (assumed to be the main component)
                main_component = result["components"][0]
                if "html" in main_component:
                    main_component["html"] = f"{warning_comments}\n{main_component['html']}"
        
        # Create the GeneratedCode object
        generated_code = GeneratedCode(
            component_ts=result.get("component_ts", ""),
            component_html=component_html,
            component_scss=result.get("component_scss", ""),
            component_name=result.get("component_name", "figma-component"),
            warnings=warnings if warnings else None
        )
        
        # Attach all components array if available
        if "components" in result and isinstance(result["components"], list):
            generated_code.components = result["components"]
        
        return generated_code
    
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
Contextual Hints - Color Palette:
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
        
        # Define few-shot examples for structured JSON output format with components array
        few_shot_examples = """
Few-Shot Example:
For a todo list UI with header, input form, and list of tasks, the output would be:

```json
{
  "components": [
    {
      "componentName": "todo-list",
      "typescript": "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-todo-list',\n  standalone: true,\n  imports: [TodoFormComponent, TodoItemComponent],\n  templateUrl: './todo-list.component.html',\n  styleUrl: './todo-list.component.scss'\n})\nexport class TodoListComponent {\n  todos: any[] = [\n    { title: 'Learn Angular', completed: true },\n    { title: 'Build an app', completed: false }\n  ];\n\n  addTodo(title: string) {\n    this.todos.push({ title, completed: false });\n  }\n\n  toggleComplete(index: number) {\n    this.todos[index].completed = !this.todos[index].completed;\n  }\n\n  deleteTodo(index: number) {\n    this.todos.splice(index, 1);\n  }\n}",
      "html": "<div class=\"todo-container\">\n  <h1 class=\"text-2xl font-bold mb-4\">Todo List</h1>\n  <app-todo-form (addTodo)=\"addTodo($event)\"></app-todo-form>\n  <app-todo-item\n    *ngFor=\"let todo of todos; let i = index\"\n    [todo]=\"todo\"\n    (toggleComplete)=\"toggleComplete(i)\"\n    (deleteTodo)=\"deleteTodo(i)\">\n  </app-todo-item>\n</div>",
      "scss": ".todo-container {\n  @apply max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md;\n}"
    },
    {
      "componentName": "todo-form",
      "typescript": "import { Component, Output, EventEmitter } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { MatInputModule } from '@angular/material/input';\nimport { MatButtonModule } from '@angular/material/button';\nimport { MatIconModule } from '@angular/material/icon';\n\n@Component({\n  selector: 'app-todo-form',\n  standalone: true,\n  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule],\n  templateUrl: './todo-form.component.html',\n  styleUrl: './todo-form.component.scss'\n})\nexport class TodoFormComponent {\n  @Output() addTodo = new EventEmitter<string>();\n  todoInput = new FormControl('', [Validators.required]);\n\n  submit() {\n    if (this.todoInput.valid && this.todoInput.value) {\n      this.addTodo.emit(this.todoInput.value);\n      this.todoInput.reset();\n    }\n  }\n}",
      "html": "<form (ngSubmit)=\"submit()\" class=\"todo-form\">\n  <mat-form-field appearance=\"outline\" class=\"w-full\">\n    <mat-label>Add Todo</mat-label>\n    <input matInput [formControl]=\"todoInput\" placeholder=\"What needs to be done?\">\n    <button matSuffix mat-icon-button type=\"submit\" [disabled]=\"!todoInput.valid\">\n      <mat-icon>add</mat-icon>\n    </button>\n  </mat-form-field>\n</form>",
      "scss": ".todo-form {\n  @apply mb-4;\n}"
    },
    {
      "componentName": "todo-item",
      "typescript": "import { Component, Input, Output, EventEmitter } from '@angular/core';\nimport { NgClass, NgIf } from '@angular/common';\nimport { MatCheckboxModule } from '@angular/material/checkbox';\nimport { MatButtonModule } from '@angular/material/button';\nimport { MatIconModule } from '@angular/material/icon';\n\n@Component({\n  selector: 'app-todo-item',\n  standalone: true,\n  imports: [NgClass, NgIf, MatCheckboxModule, MatButtonModule, MatIconModule],\n  templateUrl: './todo-item.component.html',\n  styleUrl: './todo-item.component.scss'\n})\nexport class TodoItemComponent {\n  @Input() todo: any;\n  @Output() toggleComplete = new EventEmitter<void>();\n  @Output() deleteTodo = new EventEmitter<void>();\n}",
      "html": "<div class=\"todo-item\">\n  <mat-checkbox\n    [checked]=\"todo.completed\"\n    (change)=\"toggleComplete.emit()\"\n    color=\"primary\">\n    <span [ngClass]=\"{'line-through': todo.completed}\">{{ todo.title }}</span>\n  </mat-checkbox>\n  <button mat-icon-button (click)=\"deleteTodo.emit()\">\n    <mat-icon>delete</mat-icon>\n  </button>\n</div>",
      "scss": ".todo-item {\n  @apply flex justify-between items-center p-2 border-b last:border-b-0;\n  \n  mat-checkbox {\n    @apply flex-grow;\n  }\n}"
    }
  ]
}
```

For a simpler UI that doesn't need to be split into multiple components:

```json
{
  "components": [
    {
      "componentName": "profile-card",
      "typescript": "import { Component } from '@angular/core';\nimport { MatButtonModule } from '@angular/material/button';\nimport { MatCardModule } from '@angular/material/card';\nimport { MatIconModule } from '@angular/material/icon';\n\n@Component({\n  selector: 'app-profile-card',\n  standalone: true,\n  imports: [MatCardModule, MatButtonModule, MatIconModule],\n  templateUrl: './profile-card.component.html',\n  styleUrl: './profile-card.component.scss'\n})\nexport class ProfileCardComponent {\n  profile = {\n    name: 'John Doe',\n    title: 'Software Engineer',\n    avatar: 'assets/avatar.jpg',\n    stats: [\n      { label: 'Posts', value: '142' },\n      { label: 'Followers', value: '562' },\n      { label: 'Following', value: '231' }\n    ]\n  };\n}",
      "html": "<mat-card class=\"profile-card\">\n  <div class=\"profile-header\">\n    <img [src]=\"profile.avatar\" alt=\"Profile picture\" class=\"avatar\">\n    <mat-card-title>{{ profile.name }}</mat-card-title>\n    <mat-card-subtitle>{{ profile.title }}</mat-card-subtitle>\n  </div>\n  \n  <div class=\"profile-stats\">\n    <div class=\"stat-item\" *ngFor=\"let stat of profile.stats\">\n      <div class=\"stat-value\">{{ stat.value }}</div>\n      <div class=\"stat-label\">{{ stat.label }}</div>\n    </div>\n  </div>\n  \n  <mat-card-actions align=\"end\">\n    <button mat-button color=\"primary\">FOLLOW</button>\n    <button mat-button>MESSAGE</button>\n  </mat-card-actions>\n</mat-card>",
      "scss": ".profile-card {\n  @apply max-w-xs mx-auto overflow-hidden;\n  \n  .profile-header {\n    @apply flex flex-col items-center p-6;\n    \n    .avatar {\n      @apply w-24 h-24 rounded-full object-cover mb-4;\n    }\n  }\n  \n  .profile-stats {\n    @apply flex justify-between px-6 py-4 bg-gray-50;\n    \n    .stat-item {\n      @apply flex flex-col items-center;\n      \n      .stat-value {\n        @apply text-xl font-bold;\n      }\n      \n      .stat-label {\n        @apply text-sm text-gray-600;\n      }\n    }\n  }\n}"
    }
  ]
}
```
"""
        
        prompt = f"""# Angular Component Generation Task

## Role
You are an expert Angular developer specializing in Material Design and Tailwind CSS with extensive experience in generating high-quality, production-ready Angular components.

## Goal
Analyze the provided UI description and generate Angular component(s) that accurately implement the described interface. If the UI is complex enough to warrant multiple components, split it logically into parent and child components.

## Technology Stack & Constraints
- Angular v19+ with standalone components API
- Angular Material v17+ (MDC-based components)
- Tailwind CSS (exclusively for styling layout, spacing, typography, colors)
- No custom CSS frameworks or utilities beyond Angular Material and Tailwind
- Generated components MUST use the latest Angular features (signals API, standalone architecture)
- Follow strict TypeScript type safety - no 'any' types unless absolutely necessary

## Configuration Assumptions
- A standard Angular project is already set up with:
  - Angular Material properly configured with typography and theme
  - Tailwind CSS configured with the default color palette
  - Angular animations enabled via provideAnimationsAsync()
  - A bootstrapped standalone application

## Design Description
{description}

{color_section}
{component_section}

## Component Requirements
- Use Angular Material components for interactive elements (buttons, inputs, cards, etc.)
- Apply Tailwind utility classes for layout, spacing, and styling
- Ensure components are responsive using Tailwind's responsive modifiers
- Use semantic HTML and ensure accessibility compliance
- Implement proper component composition if you split into multiple components
- Include appropriate Angular Material icons when needed
- Support dark mode using Angular Material's theming system

## Reasoning Process
Before you generate the final code, analyze the UI description and explicitly reason about:
1. The overall component structure needed
2. Whether this UI should be implemented as a single component or multiple components
3. How components should interact with each other (if multiple)
4. The appropriate Angular Material components to use
5. The Tailwind classes needed for layout and styling

## Output Format
Your response MUST be a JSON object containing a "components" array. Each component in the array must have:
- componentName: Kebab-case name for the component (e.g., "data-table", "user-profile")
- typescript: Complete TypeScript code including imports, component decorator, and class definition
- html: Complete HTML template
- scss: Complete SCSS styles

{few_shot_examples}

Remember to make your components fully interactive and visually accurate to the description provided.
"""
        
        return prompt
    
    async def _generate_with_openai(self, description: str) -> Dict[str, Any]:
        """
        Generate Angular component code using OpenAI.
        
        Args:
            description: The UI description to generate code for
            
        Returns:
            Dictionary containing the generated code components
        """
        try:
            # Create an appropriate prompt for OpenAI
            prompt = self._create_prompt(description)
            
            # Call OpenAI API
            response = self.openai_client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert Angular developer who specializes in creating components from UI descriptions."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000
            )
            
            # Extract content from the response
            content = response.choices[0].message.content
            
            # Parse and validate the response
            try:
                return self._parse_ai_response(content)
            except ValueError as e:
                print(f"Validation error with OpenAI response: {str(e)}")
                # If the parser detected invalid JSON format, try a simpler fallback structure
                return self._generate_fallback_component(str(e))
                
        except Exception as e:
            print(f"Error generating code with OpenAI: {str(e)}")
            return self._generate_fallback_component(f"OpenAI API error: {str(e)}")
    
    async def _generate_with_anthropic(self, description: str) -> Dict[str, Any]:
        """
        Generate Angular component code using Anthropic's Claude.
        
        Args:
            description: The UI description to generate code for
            
        Returns:
            Dictionary containing the generated code components
        """
        try:
            # Create an appropriate prompt for Anthropic
            prompt = self._create_prompt(description)
            
            # Call Anthropic API
            response = self.anthropic_client.messages.create(
                model=settings.ANTHROPIC_MODEL,
                max_tokens=4000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Extract content from the response
            content = response.content[0].text
            
            # Parse and validate the response
            try:
                return self._parse_ai_response(content)
            except ValueError as e:
                print(f"Validation error with Anthropic response: {str(e)}")
                # If the parser detected invalid JSON format, try a simpler fallback structure
                return self._generate_fallback_component(str(e))
                
        except Exception as e:
            print(f"Error generating code with Anthropic: {str(e)}")
            return self._generate_fallback_component(f"Anthropic API error: {str(e)}")
    
    async def _generate_with_gemini(self, description: str, color_hints: list = None) -> Dict[str, Any]:
        """
        Generate Angular component code using Google's Gemini.
        
        Args:
            description: The UI description to generate code for
            color_hints: Optional list of colors extracted from the uploaded image
            
        Returns:
            Dictionary containing the generated code components
        """
        try:
            # Get the Gemini model with optimized settings
            model = genai.GenerativeModel(
                self.gemini_model,
                # Safety settings could be configured here if needed
            )
            
            # Create detailed prompt with color hints
            prompt = self._create_prompt(description, color_hints)
            
            # Process with Gemini
            response = model.generate_content(prompt)
            
            # Extract the text response
            response_text = response.text
            
            # Parse and validate the response
            try:
                return self._parse_ai_response(response_text)
            except ValueError as e:
                print(f"Validation error with Gemini response: {str(e)}")
                # Retry with a simpler prompt if validation fails
                return await self._retry_gemini_generation(description, str(e))
                
        except Exception as e:
            print(f"Error generating code with Gemini: {str(e)}")
            return self._generate_fallback_component(f"Gemini API error: {str(e)}")
            
    async def _retry_gemini_generation(self, description: str, error_message: str) -> Dict[str, Any]:
        """
        Retry code generation with Gemini using a simplified prompt.
        
        Args:
            description: The UI description to generate code for
            error_message: The error message from the previous attempt
            
        Returns:
            Dictionary containing the generated code components
        """
        try:
            # Get the Gemini model
            model = genai.GenerativeModel(self.gemini_model)
            
            # Create a simplified prompt focused on a single component
            simplified_prompt = f"""
Previous attempt failed with error: {error_message}

Please generate a SINGLE Angular component based on this description:
{description}

The response should be in this format:
```json
{{
  "components": [
    {{
      "componentName": "component-name",
      "typescript": "// TypeScript code here",
      "html": "<!-- HTML code here -->",
      "scss": "/* SCSS code here */"
    }}
  ]
}}
```
Ensure all fields are properly formatted strings and the structure is valid JSON.
"""
            
            # Process with Gemini
            response = model.generate_content(simplified_prompt)
            
            # Extract and parse the response
            try:
                return self._parse_ai_response(response.text)
            except ValueError as e:
                print(f"Validation still failed after retry: {str(e)}")
                return self._generate_fallback_component("Failed to generate valid component after retry")
                
        except Exception as e:
            print(f"Error in retry generation: {str(e)}")
            return self._generate_fallback_component(f"Retry generation error: {str(e)}")
    
    def _generate_fallback_component(self, error_message: str) -> Dict[str, Any]:
        """
        Generate a fallback component when validation fails.
        
        Args:
            error_message: The error message to include in the fallback component
            
        Returns:
            Dictionary containing a basic fallback component
        """
        sanitized_error = error_message.replace('"', "'").replace('\n', ' ')
        
        component = {
            "componentName": "error-component",
            "typescript": f"""import {{ Component }} from '@angular/core';

@Component({{
  selector: 'app-error-component',
  standalone: true,
  templateUrl: './error-component.component.html',
  styleUrl: './error-component.component.scss'
}})
export class ErrorComponent {{
  errorMessage = "{sanitized_error}";
}}""",
            "html": f"""<div class="error-container">
  <h2>Component Generation Failed</h2>
  <p>{{{{ errorMessage }}}}</p>
  <p>Please try again with a different image or description.</p>
</div>""",
            "scss": """.error-container {
  border: 2px solid #f44336;
  border-radius: 8px;
  padding: 16px;
  margin: 16px;
  background-color: #ffebee;
  color: #b71c1c;
  font-family: sans-serif;
}"""
        }
        
        return {
            "components": [component],
            "component_ts": component["typescript"],
            "component_html": component["html"],
            "component_scss": component["scss"],
            "component_name": component["componentName"]
        }
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse and validate the AI response text to extract the code blocks.
        
        Args:
            response_text: The raw text response from the AI
        
        Returns:
            Dictionary with the extracted component code or components array
        
        Raises:
            ValueError: If the response format is invalid or missing required data
        """
        import json
        import re
        
        # Attempt to find JSON block in the response
        json_pattern = r"```(?:json)?\s*([\s\S]*?)```"
        json_matches = re.findall(json_pattern, response_text)
        
        # If we found JSON blocks, try to parse the first one
        if json_matches:
            try:
                cleaned_json = json_matches[0].strip()
                # Parse the JSON object
                parsed_json = json.loads(cleaned_json)
                
                # Validate the parsed JSON structure
                if not isinstance(parsed_json, dict):
                    raise ValueError("Response JSON is not an object")
                
                # Validate components array if present
                if "components" in parsed_json:
                    if not isinstance(parsed_json["components"], list):
                        raise ValueError("'components' field must be an array")
                    
                    if not parsed_json["components"]:
                        raise ValueError("'components' array cannot be empty")
                    
                    # Validate each component in the array
                    for i, component in enumerate(parsed_json["components"]):
                        if not isinstance(component, dict):
                            raise ValueError(f"Component at index {i} is not an object")
                        
                        # Check for required fields in each component
                        required_fields = ["componentName", "typescript", "html", "scss"]
                        for field in required_fields:
                            if field not in component:
                                raise ValueError(f"Component at index {i} is missing required field: '{field}'")
                            
                            if not isinstance(component[field], str):
                                raise ValueError(f"Component at index {i}: field '{field}' must be a string")
                        
                        # Basic TypeScript syntax validation
                        if "typescript" in component and "@Component" not in component["typescript"]:
                            raise ValueError(f"Component at index {i}: TypeScript code missing @Component decorator")
                        
                        # Basic HTML validation
                        if "html" in component and "<" not in component["html"]:
                            raise ValueError(f"Component at index {i}: HTML appears to be invalid")
                    
                    # Create the result structure with the validated components
                    main_component = parsed_json["components"][0]
                    return {
                        "component_ts": main_component.get("typescript", ""),
                        "component_html": main_component.get("html", ""),
                        "component_scss": main_component.get("scss", ""),
                        "component_name": main_component.get("componentName", "ui-component"),
                        "components": parsed_json["components"]
                    }
                elif all(k in parsed_json for k in ["component_ts", "component_html", "component_scss", "component_name"]):
                    # Legacy format validation - single component
                    for field in ["component_ts", "component_html", "component_scss", "component_name"]:
                        if not isinstance(parsed_json[field], str):
                            raise ValueError(f"Field '{field}' must be a string")
                    
                    # Create a component object in the new components array format for consistency
                    component = {
                        "componentName": parsed_json["component_name"],
                        "typescript": parsed_json["component_ts"],
                        "html": parsed_json["component_html"],
                        "scss": parsed_json["component_scss"]
                    }
                    
                    # Return in both formats for backward compatibility
                    parsed_json["components"] = [component]
                    return parsed_json
                else:
                    raise ValueError("JSON response missing required fields for component generation")
                
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {str(e)}")
        
        # If no JSON blocks found or parsing failed, fall back to regex-based extraction
        component_ts_pattern = r"```(?:typescript|ts)\s*([\s\S]*?)```"
        component_html_pattern = r"```(?:html)\s*([\s\S]*?)```"
        component_scss_pattern = r"```(?:scss|css)\s*([\s\S]*?)```"
        
        # Find matches
        ts_matches = re.findall(component_ts_pattern, response_text)
        html_matches = re.findall(component_html_pattern, response_text)
        scss_matches = re.findall(component_scss_pattern, response_text)
        
        # Validate that we have at least the typescript and html
        if not ts_matches:
            raise ValueError("No TypeScript code found in the AI response")
        
        if not html_matches:
            raise ValueError("No HTML template found in the AI response")
        
        # Extract component name from the TypeScript content
        component_name = "ui-component"
        if ts_matches:
            class_pattern = r"export\s+class\s+(\w+)"
            class_matches = re.findall(class_pattern, ts_matches[0])
            if class_matches:
                # Convert from PascalCase to kebab-case
                component_name = re.sub(r'(?<!^)(?=[A-Z])', '-', class_matches[0]).lower()
                if component_name.endswith("-component"):
                    component_name = component_name[:-10]
        
        # Create a component object in the new components array format
        component = {
            "componentName": component_name,
            "typescript": ts_matches[0] if ts_matches else "",
            "html": html_matches[0] if html_matches else "",
            "scss": scss_matches[0] if scss_matches else ""
        }
        
        # Return in new format with components array and in old format for backward compatibility
        return {
            "components": [component],
            "component_ts": component["typescript"],
            "component_html": component["html"],
            "component_scss": component["scss"],
            "component_name": component_name
        } 