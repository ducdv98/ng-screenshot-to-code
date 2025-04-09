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
        
        # Check if description contains component instances
        component_section = ""
        if "Component Instances Found:" in description:
            component_section = """
Component Instances:
The Figma design contains component instances which should be reflected in the component architecture.
Follow these guidelines for component composition:
1. Create separate Angular components for each logical UI section
2. Implement parent-child communication using @Input/@Output where appropriate
3. Ensure each component has a single responsibility
4. Use content projection with ng-content for flexible component templates
5. Implement proper change detection strategy for performance optimization
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
      "typescript": "import { Component, signal } from '@angular/core';\nimport { TodoFormComponent } from './todo-form/todo-form.component';\nimport { TodoItemComponent } from './todo-item/todo-item.component';\nimport { Todo } from './todo.model';\n\n@Component({\n  selector: 'app-todo-list',\n  standalone: true,\n  imports: [TodoFormComponent, TodoItemComponent],\n  templateUrl: './todo-list.component.html',\n  styleUrl: './todo-list.component.scss'\n})\nexport class TodoListComponent {\n  todos = signal<Todo[]>([\n    { id: '1', title: 'Learn Angular', completed: true },\n    { id: '2', title: 'Build an app', completed: false }\n  ]);\n\n  addTodo(title: string) {\n    this.todos.update(currentTodos => [\n      ...currentTodos,\n      { id: crypto.randomUUID(), title, completed: false }\n    ]);\n  }\n\n  toggleComplete(id: string) {\n    this.todos.update(currentTodos => \n      currentTodos.map(todo => \n        todo.id === id ? { ...todo, completed: !todo.completed } : todo\n      )\n    );\n  }\n\n  deleteTodo(id: string) {\n    this.todos.update(currentTodos => \n      currentTodos.filter(todo => todo.id !== id)\n    );\n  }\n}",
      "html": "<section class=\"todo-container\">\n  <h1 class=\"text-2xl font-bold mb-4\">Todo List</h1>\n  <app-todo-form (addTodo)=\"addTodo($event)\"></app-todo-form>\n  <div class=\"todo-list\">\n    <app-todo-item\n      *ngFor=\"let todo of todos(); trackBy: todoTrackBy\"\n      [todo]=\"todo\"\n      (toggleComplete)=\"toggleComplete(todo.id)\"\n      (deleteTodo)=\"deleteTodo(todo.id)\">\n    </app-todo-item>\n    <p *ngIf=\"todos().length === 0\" class=\"empty-state\">\n      No tasks yet. Add one above!\n    </p>\n  </div>\n</section>",
      "scss": ".todo-container {\n  @apply max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md;\n\n  .todo-list {\n    @apply mt-4;\n  }\n\n  .empty-state {\n    @apply text-gray-500 text-center py-4;\n  }\n}"
    },
    {
      "componentName": "todo-form",
      "typescript": "import { Component, Output, EventEmitter } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { MatInputModule } from '@angular/material/input';\nimport { MatButtonModule } from '@angular/material/button';\nimport { MatIconModule } from '@angular/material/icon';\n\n@Component({\n  selector: 'app-todo-form',\n  standalone: true,\n  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule],\n  templateUrl: './todo-form.component.html',\n  styleUrl: './todo-form.component.scss'\n})\nexport class TodoFormComponent {\n  @Output() addTodo = new EventEmitter<string>();\n  todoInput = new FormControl('', [Validators.required, Validators.minLength(3)]);\n\n  submit() {\n    if (this.todoInput.valid && this.todoInput.value) {\n      this.addTodo.emit(this.todoInput.value);\n      this.todoInput.reset();\n      this.todoInput.markAsPristine();\n    }\n  }\n\n  get errorMessage(): string {\n    if (this.todoInput.hasError('required')) {\n      return 'Task description is required';\n    }\n    if (this.todoInput.hasError('minlength')) {\n      return 'Task description must be at least 3 characters';\n    }\n    return '';\n  }\n}",
      "html": "<form (ngSubmit)=\"submit()\" class=\"todo-form\">\n  <mat-form-field appearance=\"outline\" class=\"w-full\">\n    <mat-label>Add Todo</mat-label>\n    <input matInput [formControl]=\"todoInput\" placeholder=\"What needs to be done?\">\n    <mat-error *ngIf=\"todoInput.invalid\">{{ errorMessage }}</mat-error>\n    <button matSuffix mat-icon-button type=\"submit\" [disabled]=\"!todoInput.valid\" aria-label=\"Add todo\">\n      <mat-icon>add</mat-icon>\n    </button>\n  </mat-form-field>\n</form>",
      "scss": ".todo-form {\n  @apply mb-4;\n}"
    },
    {
      "componentName": "todo-item",
      "typescript": "import { Component, Input, Output, EventEmitter, signal } from '@angular/core';\nimport { NgClass, NgIf } from '@angular/common';\nimport { MatCheckboxModule } from '@angular/material/checkbox';\nimport { MatButtonModule } from '@angular/material/button';\nimport { MatIconModule } from '@angular/material/icon';\nimport { Todo } from '../todo.model';\n\n@Component({\n  selector: 'app-todo-item',\n  standalone: true,\n  imports: [NgClass, NgIf, MatCheckboxModule, MatButtonModule, MatIconModule],\n  templateUrl: './todo-item.component.html',\n  styleUrl: './todo-item.component.scss'\n})\nexport class TodoItemComponent {\n  @Input({ required: true }) todo!: Todo;\n  @Output() toggleComplete = new EventEmitter<void>();\n  @Output() deleteTodo = new EventEmitter<void>();\n  isHovered = signal(false);\n  \n  setHovered(state: boolean): void {\n    this.isHovered.set(state);\n  }\n}",
      "html": "<div class=\"todo-item\" \n     (mouseenter)=\"setHovered(true)\" \n     (mouseleave)=\"setHovered(false)\">\n  <mat-checkbox\n    [checked]=\"todo.completed\"\n    (change)=\"toggleComplete.emit()\"\n    color=\"primary\">\n    <span [ngClass]=\"{'line-through text-gray-500': todo.completed}\">{{ todo.title }}</span>\n  </mat-checkbox>\n  <button mat-icon-button \n          (click)=\"deleteTodo.emit()\" \n          [class.visible]=\"isHovered()\" \n          aria-label=\"Delete todo\">\n    <mat-icon>delete</mat-icon>\n  </button>\n</div>",
      "scss": ".todo-item {\n  @apply flex justify-between items-center p-2 border-b last:border-b-0;\n  \n  mat-checkbox {\n    @apply flex-grow;\n  }\n\n  button {\n    @apply opacity-0 transition-opacity duration-200;\n    \n    &.visible {\n      @apply opacity-100;\n    }\n  }\n\n  &:hover button {\n    @apply opacity-100;\n  }\n}"
    },
    {
      "componentName": "todo.model",
      "typescript": "export interface Todo {\n  id: string;\n  title: string;\n  completed: boolean;\n}",
      "html": "",
      "scss": ""
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
      "typescript": "import { Component, signal } from '@angular/core';\nimport { MatButtonModule } from '@angular/material/button';\nimport { MatCardModule } from '@angular/material/card';\nimport { MatIconModule } from '@angular/material/icon';\nimport { MatBadgeModule } from '@angular/material/badge';\nimport { NgFor } from '@angular/common';\n\ninterface ProfileStat {\n  label: string;\n  value: string;\n}\n\n@Component({\n  selector: 'app-profile-card',\n  standalone: true,\n  imports: [MatCardModule, MatButtonModule, MatIconModule, MatBadgeModule, NgFor],\n  templateUrl: './profile-card.component.html',\n  styleUrl: './profile-card.component.scss'\n})\nexport class ProfileCardComponent {\n  isFollowing = signal(false);\n  profile = signal({\n    name: 'John Doe',\n    title: 'Software Engineer',\n    avatar: 'assets/avatar.jpg',\n    stats: [\n      { label: 'Posts', value: '142' },\n      { label: 'Followers', value: '562' },\n      { label: 'Following', value: '231' }\n    ] as ProfileStat[]\n  });\n\n  toggleFollow(): void {\n    this.isFollowing.update(current => !current);\n    \n    // In a real app, you would call a service here\n    if (this.isFollowing()) {\n      // Update follower count when following\n      this.updateFollowerCount(1);\n    } else {\n      // Update follower count when unfollowing\n      this.updateFollowerCount(-1);\n    }\n  }\n  \n  private updateFollowerCount(change: number): void {\n    this.profile.update(current => {\n      const updatedStats = current.stats.map(stat => \n        stat.label === 'Followers' \n          ? { ...stat, value: (parseInt(stat.value) + change).toString() }\n          : stat\n      );\n      \n      return {\n        ...current,\n        stats: updatedStats\n      };\n    });\n  }\n}",
      "html": "<mat-card class=\"profile-card\">\n  <div class=\"profile-header\">\n    <img [src]=\"profile().avatar\" alt=\"Profile picture\" class=\"avatar\">\n    <mat-card-title>{{ profile().name }}</mat-card-title>\n    <mat-card-subtitle>{{ profile().title }}</mat-card-subtitle>\n  </div>\n  \n  <div class=\"profile-stats\">\n    <div class=\"stat-item\" *ngFor=\"let stat of profile().stats\">\n      <div class=\"stat-value\">{{ stat.value }}</div>\n      <div class=\"stat-label\">{{ stat.label }}</div>\n    </div>\n  </div>\n  \n  <mat-card-actions align=\"end\">\n    <button mat-button color=\"primary\" (click)=\"toggleFollow()\">\n      <mat-icon>{{ isFollowing() ? 'person_remove' : 'person_add' }}</mat-icon>\n      {{ isFollowing() ? 'UNFOLLOW' : 'FOLLOW' }}\n    </button>\n    <button mat-button>\n      <mat-icon>message</mat-icon>\n      MESSAGE\n    </button>\n  </mat-card-actions>\n</mat-card>",
      "scss": ".profile-card {\n  @apply max-w-xs mx-auto overflow-hidden;\n  \n  .profile-header {\n    @apply flex flex-col items-center p-6;\n    \n    .avatar {\n      @apply w-24 h-24 rounded-full object-cover mb-4 border-2 border-primary;\n    }\n  }\n  \n  .profile-stats {\n    @apply flex justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800;\n    \n    .stat-item {\n      @apply flex flex-col items-center;\n      \n      .stat-value {\n        @apply text-xl font-bold;\n      }\n      \n      .stat-label {\n        @apply text-sm text-gray-600 dark:text-gray-300;\n      }\n    }\n  }\n  \n  mat-card-actions button {\n    @apply flex items-center gap-1;\n    \n    mat-icon {\n      @apply text-base;\n    }\n  }\n}"
    }
  ]
}
```
"""
        
        prompt = f"""# Angular Component Generation Task

## Role
You are an expert Angular developer specializing in Material Design and Tailwind CSS with extensive experience in generating high-quality, production-ready Angular components.

## Goal
Analyze the provided UI description and generate Angular component(s) that accurately implement the described interface. Split complex UIs into logical parent and child components for better maintainability and reusability.

## Technology Stack Requirements
- Angular v19+ with standalone component architecture
- Angular Material v17+ (MDC-based components)
- Tailwind CSS for layout, spacing, typography, and colors
- Signal-based state management (use Angular's signals API)
- TypeScript with strict typing (no 'any' types except when absolutely necessary)
- Reactive forms with validation (for form components)
- Angular CDK for advanced UI behaviors when needed

## Configuration Assumptions
- Angular project with standalone bootstrapping
- Angular Material properly configured with typography and theme
- Tailwind CSS configured with the default color palette
- Form controls using Angular Material's form field components
- Animations enabled via provideAnimationsAsync()

## UI Description
{description}

{color_section}
{ui_structure_hints}
{component_section}

## Technical Implementation Requirements
1. **Structure & Architecture**
   - Follow single responsibility principle for each component
   - Use appropriate component composition with parent-child relationships
   - Create TypeScript interfaces for data models and strong typing
   - Use Angular's signal-based reactivity instead of BehaviorSubject/Observable where possible

2. **UI Components & Styling**
   - Use Angular Material components for interactive elements (inputs, buttons, cards, etc.)
   - Apply Tailwind utility classes for layout, spacing, colors, and typography
   - Ensure responsive design using Tailwind's responsive modifiers
   - Follow Material Design guidelines for component usage
   - Implement proper dark mode support using both Material theming and Tailwind

3. **Accessibility & Best Practices**
   - Use semantic HTML elements (headings, sections, etc.)
   - Include proper ARIA attributes for custom interactions
   - Ensure keyboard navigability for interactive elements
   - Add meaningful alt text for images and icons
   - Implement focus management for modal dialogs or custom widgets

4. **Performance Considerations**
   - Add trackBy functions for *ngFor directives
   - Use OnPush change detection where appropriate
   - Optimize component template expressions to avoid unnecessary calculations
   - Consider virtualization for large lists using Angular CDK

## Component Implementation Analysis
Before writing code, explicitly reason about these aspects:

1. Overall component structure needed for this UI
2. Data flow and state management approach
3. Appropriate Material components to use
4. How to structure the component hierarchy
5. Where to apply reactive forms or animations
6. How to split complex components into smaller parts

## Output Format
Your response MUST be a JSON object containing a "components" array. Each component in the array must have:
- componentName: Kebab-case name for the component (e.g., "data-table", "user-profile")
- typescript: Complete TypeScript code including imports, component decorator, class definition with signals
- html: Complete HTML template with proper bindings and event handlers
- scss: Complete SCSS styles with Tailwind utilities

{few_shot_examples}

## Schema Validation Requirements
Ensure your generated code follows these rules:
- All component TypeScript must include proper imports 
- Component decorators must specify standalone: true and import any dependencies
- Signals must be used for reactive state management
- Type safety must be maintained throughout
- HTML templates must contain proper bindings and directives
- SCSS should leverage Tailwind utilities via @apply where appropriate
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