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
        
        # Attach routing information if available
        if "routing" in result and isinstance(result["routing"], list):
            generated_code.routing = result["routing"]
        
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
        
        # Attach routing information if available
        if "routing" in result and isinstance(result["routing"], list):
            generated_code.routing = result["routing"]
        
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
Apply these colors to appropriate elements using Angular Material's theming system and Tailwind CSS color utilities.
For Material components, use these as custom theme colors when appropriate.
For non-Material elements, use Tailwind's color utilities with these values.
"""
        
        # Analyze description for UI structure
        ui_structure_hints = ""
        if any(term in description.lower() for term in ["form", "input", "field", "submit", "validation"]):
            ui_structure_hints += """
UI Structure Hint - Form Detected:
Implement proper Angular reactive forms with FormControl/FormGroup.
Add appropriate validation with meaningful error messages.
Include submit/cancel buttons with proper loading states.
"""
            
        if any(term in description.lower() for term in ["list", "table", "grid", "items", "collection"]):
            ui_structure_hints += """
UI Structure Hint - Data Collection Detected:
Implement optimal rendering strategy for collection data.
Use *ngFor with trackBy function for performance.
Consider virtualization for large datasets using @angular/cdk/scrolling.
"""
            
        if any(term in description.lower() for term in ["card", "panel", "container", "section"]):
            ui_structure_hints += """
UI Structure Hint - Card/Panel Layout Detected:
Use mat-card for semantic card layouts with appropriate sections.
Implement responsive card grid using Tailwind's grid utilities.
Add appropriate motion with Angular animations if applicable.
"""
            
        if any(term in description.lower() for term in ["navigation", "menu", "sidebar", "drawer", "tabs"]):
            ui_structure_hints += """
UI Structure Hint - Navigation Pattern Detected:
Use appropriate Material navigation components (mat-toolbar, mat-drawer, mat-tabs).
Implement responsive behavior using Tailwind breakpoint utilities.
Ensure keyboard navigability and proper ARIA roles.
"""
        
        # Primary prompt
        return f"""
        
You are an expert Angular developer specializing in creating modern, accessible UIs with Angular Material and Tailwind CSS. Today your task is to convert a UI description into a complete, fully functional Angular component structure ready for integration into a downloadable project.

GOAL: Generate a complete set of Angular components that will render the UI described below. Your output will be used to populate a full, downloadable Angular project that users can run locally.

TECH STACK CONSTRAINTS:
- Angular v19+ with standalone component APIs only
- Angular Material v17+ (with Material Design Components MDC)
- Tailwind CSS v3
- TypeScript with strict typing

EXTERNAL CONFIGURATION ASSUMPTIONS:
- A standard Angular project with Angular Material and Tailwind CSS is already configured properly
- You do NOT need to generate Angular Material theme setup code
- You do NOT need to generate Tailwind configuration
- You do NOT need to generate package.json, angular.json, or any other configuration files
- The application entry point, routing setup, and overall structure exist, and you only need to provide component code

COMPONENT COMPOSITION:
- Analyze the UI description and determine if it should be split into multiple components
- Create a main parent component that hosts any child components
- Create child components when parts of the UI are logically separate, reusable, or complex enough to warrant their own component
- For each component, generate TypeScript, HTML, and SCSS files

OUTPUT FORMAT:
Your response MUST be valid JSON in the following format:
{{
  "components": [
    {{
      "componentName": "string", // kebab-case name (e.g., "user-profile")
      "typescript": "string",    // Complete TypeScript code including imports
      "html": "string",          // Complete HTML template
      "scss": "string"           // Complete SCSS styles
    }},
    // Additional components if needed
  ],
  "routing": [
    // Optional: Basic routing suggestions
    // {{ "path": "string", "componentName": "string" }}
  ]
}}

ANGULAR CODE REQUIREMENTS:
1. Components:
   - Use standalone components with explicit imports
   - Add proper typings for all properties and methods
   - Apply meaningful component/method names reflecting functionality
   - Use Angular signals for state management where appropriate
   - Include reactive behaviors with proper subscriptions and memory management
   - Use Angular's latest DI pattern with the inject() function

2. Templates:
   - Use Angular Material components with proper MDC API
   - Follow Angular template syntax best practices
   - Create responsive layouts using Tailwind CSS utilities
   - Include accessibility attributes (aria-*)
   - Apply conditional rendering as appropriate (ngIf, ngClass)
   - Use async pipe with observables to prevent memory leaks

3. Styles:
   - Focus on using Tailwind utility classes in HTML
   - Only use SCSS for styles not possible with Tailwind
   - Include responsive styling for various screen sizes
   - Apply consistent whitespace/padding/margins

REASONING STEPS:
1. Analyze the UI description to fully understand the requirements
2. Identify main sections/features that may benefit from separate components
3. Determine component hierarchy and state management needs
4. Draft component structure with component names and relationships
5. Implement each component with its TypeScript, HTML, and SCSS
6. Ensure proper integration between components through inputs/outputs

FEW-SHOT EXAMPLES (SIMPLIFIED):

Example 1 - Single Component:
{{
  "components": [
    {{
      "componentName": "product-card",
      "typescript": "import {{ Component, Input, signal }} from '@angular/core';\\nimport {{ MatButtonModule }} from '@angular/material/button';\\nimport {{ CommonModule }} from '@angular/common';\\n\\ninterface Product {{\\n  id: number;\\n  name: string;\\n  price: number;\\n  imageUrl: string;\\n}}\\n\\n@Component({{\\n  selector: 'app-product-card',\\n  standalone: true,\\n  imports: [CommonModule, MatButtonModule],\\n  templateUrl: './product-card.component.html',\\n  styleUrls: ['./product-card.component.scss']\\n}})\\nexport class ProductCardComponent {{\\n  @Input() product!: Product;\\n  quantity = signal(1);\\n\\n  increment() {{\\n    this.quantity.update(val => val + 1);\\n  }}\\n\\n  decrement() {{\\n    if (this.quantity() > 1) {{\\n      this.quantity.update(val => val - 1);\\n    }}\\n  }}\\n}}",
      "html": "<div class=\\"bg-white rounded-lg shadow-md p-4 max-w-sm\\">\\n  <img [src]=\\"product.imageUrl\\" [alt]=\\"product.name\\" class=\\"w-full h-48 object-cover rounded\\"/>\\n  <h2 class=\\"text-xl font-bold mt-2\\">{{product.name}}</h2>\\n  <p class=\\"text-gray-700 mt-1\\">{{product.price | currency}}</p>\\n  <div class=\\"flex items-center justify-between mt-4\\">\\n    <div class=\\"flex items-center\\">\\n      <button mat-icon-button (click)=\\"decrement()\\">\\n        <span class=\\"material-icons\\">remove</span>\\n      </button>\\n      <span class=\\"mx-2\\">{{quantity()}}</span>\\n      <button mat-icon-button (click)=\\"increment()\\">\\n        <span class=\\"material-icons\\">add</span>\\n      </button>\\n    </div>\\n    <button mat-raised-button color=\\"primary\\">Add to Cart</button>\\n  </div>\\n</div>",
      "scss": "/* Additional custom styles beyond Tailwind utilities */\\n:host {{\\n  display: block;\\n}}\\n"
    }}
  ]
}}

Example 2 - Multiple Components:
{{
  "components": [
    {{
      "componentName": "task-dashboard",
      "typescript": "import {{ Component, inject }} from '@angular/core';\\nimport {{ CommonModule }} from '@angular/common';\\nimport {{ MatCardModule }} from '@angular/material/card';\\nimport {{ MatButtonModule }} from '@angular/material/button';\\nimport {{ Task }} from './task.model';\\nimport {{ TaskListComponent }} from './task-list/task-list.component';\\nimport {{ TaskFormComponent }} from './task-form/task-form.component';\\n\\n@Component({{\\n  selector: 'app-task-dashboard',\\n  standalone: true,\\n  imports: [CommonModule, MatCardModule, MatButtonModule, TaskListComponent, TaskFormComponent],\\n  templateUrl: './task-dashboard.component.html',\\n  styleUrls: ['./task-dashboard.component.scss']\\n}})\\nexport class TaskDashboardComponent {{\\n  tasks: Task[] = [\\n    {{ id: 1, title: 'Learn Angular', completed: true }},\\n    {{ id: 2, title: 'Build task app', completed: false }},\\n    {{ id: 3, title: 'Deploy to production', completed: false }}\\n  ];\\n\\n  addTask(title: string) {{\\n    if (title.trim()) {{\\n      const newTask: Task = {{\\n        id: Date.now(),\\n        title: title.trim(),\\n        completed: false\\n      }};\\n      this.tasks = [...this.tasks, newTask];\\n    }}\\n  }}\\n\\n  toggleComplete(taskId: number) {{\\n    this.tasks = this.tasks.map(task => \\n      task.id === taskId ? {{ ...task, completed: !task.completed }} : task\\n    );\\n  }}\\n\\n  deleteTask(taskId: number) {{\\n    this.tasks = this.tasks.filter(task => task.id !== taskId);\\n  }}\\n}}",
      "html": "<div class=\\"container mx-auto p-4\\">\\n  <mat-card class=\\"mb-4\\">\\n    <mat-card-header>\\n      <mat-card-title>Task Management Dashboard</mat-card-title>\\n    </mat-card-header>\\n    <mat-card-content>\\n      <app-task-form (taskAdded)=\\"addTask($event)\\"></app-task-form>\\n    </mat-card-content>\\n  </mat-card>\\n  \\n  <app-task-list\\n    [tasks]=\\"tasks\\"\\n    (taskToggled)=\\"toggleComplete($event)\\"\\n    (taskDeleted)=\\"deleteTask($event)\\">\\n  </app-task-list>\\n</div>",
      "scss": "/* Custom styles if needed */\\n"
    }},
    {{
      "componentName": "task-list",
      "typescript": "import {{ Component, Input, Output, EventEmitter }} from '@angular/core';\\nimport {{ CommonModule }} from '@angular/common';\\nimport {{ MatListModule }} from '@angular/material/list';\\nimport {{ MatCheckboxModule }} from '@angular/material/checkbox';\\nimport {{ MatButtonModule }} from '@angular/material/button';\\nimport {{ MatIconModule }} from '@angular/material/icon';\\nimport {{ Task }} from '../task.model';\\n\\n@Component({{\\n  selector: 'app-task-list',\\n  standalone: true,\\n  imports: [CommonModule, MatListModule, MatCheckboxModule, MatButtonModule, MatIconModule],\\n  templateUrl: './task-list.component.html',\\n  styleUrls: ['./task-list.component.scss']\\n}})\\nexport class TaskListComponent {{\\n  @Input() tasks: Task[] = [];\\n  @Output() taskToggled = new EventEmitter<number>();\\n  @Output() taskDeleted = new EventEmitter<number>();\\n\\n  toggleTask(id: number) {{\\n    this.taskToggled.emit(id);\\n  }}\\n\\n  deleteTask(id: number) {{\\n    this.taskDeleted.emit(id);\\n  }}\\n\\n  trackByTaskId(index: number, task: Task): number {{\\n    return task.id;\\n  }}\\n}}",
      "html": "<mat-list role=\\"list\\" class=\\"bg-white rounded-lg shadow\\">\\n  <div class=\\"p-4 border-b border-gray-200\\">\\n    <h2 class=\\"text-xl font-medium\\">Tasks ({{tasks.length}})</h2>\\n  </div>\\n  \\n  <mat-list-item *ngFor=\\"let task of tasks; trackBy: trackByTaskId\\" role=\\"listitem\\" class=\\"border-b border-gray-100 hover:bg-gray-50\\">\\n    <div class=\\"flex items-center justify-between w-full p-2\\">\\n      <div class=\\"flex items-center\\">\\n        <mat-checkbox\\n          [checked]=\\"task.completed\\"\\n          (change)=\\"toggleTask(task.id)\\"\\n          color=\\"primary\\">\\n        </mat-checkbox>\\n        <span class=\\"ml-2\\" [class.line-through]=\\"task.completed\\" [class.text-gray-500]=\\"task.completed\\">\\n          {{task.title}}\\n        </span>\\n      </div>\\n      <button mat-icon-button (click)=\\"deleteTask(task.id)\\" aria-label=\\"Delete task\\">\\n        <mat-icon>delete</mat-icon>\\n      </button>\\n    </div>\\n  </mat-list-item>\\n  \\n  <div *ngIf=\\"tasks.length === 0\\" class=\\"p-4 text-center text-gray-500\\">\\n    No tasks available. Add one above!\\n  </div>\\n</mat-list>",
      "scss": "/* Additional styles if needed */\\n"
    }},
    {{
      "componentName": "task-form",
      "typescript": "import {{ Component, Output, EventEmitter }} from '@angular/core';\\nimport {{ CommonModule }} from '@angular/common';\\nimport {{ FormsModule }} from '@angular/forms';\\nimport {{ MatInputModule }} from '@angular/material/input';\\nimport {{ MatButtonModule }} from '@angular/material/button';\\nimport {{ MatFormFieldModule }} from '@angular/material/form-field';\\n\\n@Component({{\\n  selector: 'app-task-form',\\n  standalone: true,\\n  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule, MatFormFieldModule],\\n  templateUrl: './task-form.component.html',\\n  styleUrls: ['./task-form.component.scss']\\n}})\\nexport class TaskFormComponent {{\\n  @Output() taskAdded = new EventEmitter<string>();\\n  newTaskTitle = '';\\n\\n  addTask() {{\\n    this.taskAdded.emit(this.newTaskTitle);\\n    this.newTaskTitle = '';\\n  }}\\n}}",
      "html": "<form (ngSubmit)=\\"addTask()\\" class=\\"flex gap-2\\">\\n  <mat-form-field class=\\"flex-grow\\">\\n    <mat-label>New Task</mat-label>\\n    <input matInput [(ngModel)]=\\"newTaskTitle\\" name=\\"title\\" placeholder=\\"Enter task title\\" required>\\n  </mat-form-field>\\n  <button mat-raised-button color=\\"primary\\" type=\\"submit\\" [disabled]=\\"!newTaskTitle.trim()\\">\\n    Add Task\\n  </button>\\n</form>",
      "scss": "/* Additional styles if needed */\\n"
    }}
  ],
  "routing": [
    {{ "path": "", "componentName": "task-dashboard" }}
  ]
}}

UI Description:
{description}

{color_section}
{ui_structure_hints}
"""
    
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
        Parse the AI response to extract TypeScript, HTML, and SCSS code blocks.
        This method has been updated to handle the new JSON format for the full Angular project generation.
        
        Args:
            response_text: The raw text response from the AI
            
        Returns:
            Dictionary with component_ts, component_html, component_scss, component_name, 
            components array, and routing information
        """
        try:
            # First try to parse the entire response as JSON
            import json
            import re
            
            # Clean up the response text in case there's markdown or explanatory text
            # Look for JSON blocks in the response
            json_match = re.search(r'```json\s*(.+?)\s*```', response_text, re.DOTALL)
            if json_match:
                json_content = json_match.group(1)
            else:
                # Try to find just a raw JSON object
                json_match = re.search(r'(\{\s*"components"\s*:.+\})', response_text, re.DOTALL)
                if json_match:
                    json_content = json_match.group(1)
                else:
                    json_content = response_text  # Assume the entire response might be JSON
            
            # Try to parse the JSON
            try:
                parsed_data = json.loads(json_content)
                
                # Validate the expected structure: must have 'components' array
                if 'components' not in parsed_data or not isinstance(parsed_data['components'], list) or len(parsed_data['components']) == 0:
                    raise ValueError("Invalid JSON structure: missing or empty 'components' array")
                
                # Extract the components
                components = parsed_data['components']
                primary_component = components[0]  # First component is primary
                
                # Validate required properties in the primary component
                required_props = ['componentName', 'typescript', 'html', 'scss']
                for prop in required_props:
                    if prop not in primary_component:
                        raise ValueError(f"Primary component missing required property: {prop}")
                
                # Set up the result dictionary with primary component data
                result = {
                    'component_name': primary_component['componentName'],
                    'component_ts': primary_component['typescript'],
                    'component_html': primary_component['html'],
                    'component_scss': primary_component['scss'],
                    'components': components
                }
                
                # Add routing information if available
                if 'routing' in parsed_data and isinstance(parsed_data['routing'], list):
                    result['routing'] = parsed_data['routing']
                
                return result
                
            except json.JSONDecodeError:
                # If JSON parsing failed, fall back to the regular parsing method
                return self._extract_code_blocks_fallback(response_text)
                
        except Exception as e:
            # Fall back to the original parsing method if any exception occurs
            print(f"Error parsing JSON response: {str(e)}")
            return self._extract_code_blocks_fallback(response_text)

    def _extract_code_blocks_fallback(self, response_text: str) -> Dict[str, Any]:
        """
        Extract code blocks from the response text using traditional methods.
        
        Args:
            response_text: The raw response from the AI service
            
        Returns:
            Dictionary containing the extracted component code
        """
        import re
        
        # Extract code blocks using regex patterns
        component_ts_pattern = r"```(?:typescript|ts)\s*([\s\S]*?)```"
        component_html_pattern = r"```(?:html)\s*([\s\S]*?)```"
        component_scss_pattern = r"```(?:scss|css)\s*([\s\S]*?)```"
        
        # Find matches
        ts_matches = re.findall(component_ts_pattern, response_text)
        html_matches = re.findall(component_html_pattern, response_text)
        scss_matches = re.findall(component_scss_pattern, response_text)
        
        # Set default values
        component_ts = ts_matches[0] if ts_matches else ""
        component_html = html_matches[0] if html_matches else ""
        component_scss = scss_matches[0] if scss_matches else ""
        
        # Extract component name from the TypeScript content
        component_name = "generated-component"
        if component_ts:
            # Try to extract component name from the class declaration
            class_pattern = r"export\s+class\s+(\w+)"
            class_matches = re.findall(class_pattern, component_ts)
            if class_matches:
                # Convert from PascalCase to kebab-case
                component_name = re.sub(r'(?<!^)(?=[A-Z])', '-', class_matches[0]).lower()
                if component_name.endswith("-component"):
                    component_name = component_name[:-10]  # Remove "-component" suffix
        
        # Create a component object for the components array
        component = {
            "componentName": component_name,
            "typescript": component_ts,
            "html": component_html,
            "scss": component_scss
        }
        
        # Return in both new and legacy formats for compatibility
        return {
            "component_ts": component_ts,
            "component_html": component_html,
            "component_scss": component_scss,
            "component_name": component_name,
            "components": [component]  # Include the components array
        } 