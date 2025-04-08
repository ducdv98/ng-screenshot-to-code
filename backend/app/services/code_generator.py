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

        # Few-shot examples to help guide the model
        examples = """
EXAMPLE 1:
UI DESCRIPTION:
A login form with email and password fields, a "Remember me" checkbox, a "Forgot password?" link, and a blue submit button that says "Log In".

CODE OUTPUT:
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Form submitted', this.loginForm.value);
      // Handle login logic
    }
  }
}
```

```html
<div class="flex justify-center items-center min-h-screen bg-gray-50">
  <div class="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
    <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">Sign In</h1>
    
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email" placeholder="your@email.com">
        <mat-error *ngIf="loginForm.controls['email'].hasError('required')">
          Email is required
        </mat-error>
        <mat-error *ngIf="loginForm.controls['email'].hasError('email')">
          Please enter a valid email
        </mat-error>
      </mat-form-field>
      
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Password</mat-label>
        <input matInput formControlName="password" type="password">
        <mat-error *ngIf="loginForm.controls['password'].hasError('required')">
          Password is required
        </mat-error>
      </mat-form-field>
      
      <div class="flex justify-between items-center">
        <mat-checkbox formControlName="rememberMe" color="primary">
          Remember me
        </mat-checkbox>
        <a href="#" class="text-blue-600 text-sm hover:underline">Forgot password?</a>
      </div>
      
      <button mat-raised-button color="primary" type="submit" class="w-full py-2">
        Log In
      </button>
    </form>
  </div>
</div>
```

```scss
:host {
  display: block;
}

/* Custom focus styles for better accessibility */
.mat-mdc-form-field-focus-overlay {
  background-color: rgba(0, 0, 255, 0.04);
}

/* Custom button styling to match design */
.mat-primary {
  background-color: #1a73e8 !important;
}
```

EXAMPLE 2:
UI DESCRIPTION:
A pricing table with three tiers (Basic, Pro, Enterprise). Each tier shows the price, a list of 4-5 features, and a "Choose plan" button. The Pro plan is highlighted as recommended.

CODE OUTPUT:
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  isRecommended: boolean;
}

@Component({
  selector: 'app-pricing-table',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatBadgeModule
  ],
  templateUrl: './pricing-table.component.html',
  styleUrls: ['./pricing-table.component.scss']
})
export class PricingTableComponent {
  plans: PricingPlan[] = [
    {
      name: 'Basic',
      price: '$9.99',
      features: [
        'Up to 5 users',
        '10GB storage',
        'Basic support',
        'Email notifications'
      ],
      isRecommended: false
    },
    {
      name: 'Pro',
      price: '$19.99',
      features: [
        'Up to 20 users',
        '50GB storage',
        'Priority support',
        'Email and SMS notifications',
        'Advanced analytics'
      ],
      isRecommended: true
    },
    {
      name: 'Enterprise',
      price: '$49.99',
      features: [
        'Unlimited users',
        '500GB storage',
        '24/7 dedicated support',
        'All notification channels',
        'Advanced analytics',
        'Custom integrations'
      ],
      isRecommended: false
    }
  ];
}
```

```html
<div class="container mx-auto py-12 px-4">
  <h2 class="text-3xl font-bold text-center mb-12">Choose your plan</h2>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <ng-container *ngFor="let plan of plans">
      <mat-card [ngClass]="{'border-2 border-primary': plan.isRecommended}" class="h-full">
        <div *ngIf="plan.isRecommended" class="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <span class="bg-primary text-white text-xs px-2 py-1 rounded-full">Recommended</span>
        </div>
        
        <mat-card-header>
          <mat-card-title class="text-xl font-bold mb-2">{{plan.name}}</mat-card-title>
          <mat-card-subtitle>
            <span class="text-3xl font-bold">{{plan.price}}</span>
            <span class="text-gray-600">/month</span>
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content class="py-4">
          <ul class="space-y-3">
            <li *ngFor="let feature of plan.features" class="flex items-start">
              <mat-icon class="text-green-500 mr-2 text-sm">check_circle</mat-icon>
              <span>{{feature}}</span>
            </li>
          </ul>
        </mat-card-content>
        
        <mat-card-actions align="end">
          <button mat-raised-button [color]="plan.isRecommended ? 'primary' : 'basic'" class="w-full">
            Choose plan
          </button>
        </mat-card-actions>
      </mat-card>
    </ng-container>
  </div>
</div>
```

```scss
.mat-mdc-card {
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  &.border-primary {
    border-color: #3f51b5;
  }
}

.bg-primary {
  background-color: #3f51b5;
}

.text-primary {
  color: #3f51b5;
}

.border-primary {
  border-color: #3f51b5;
}
```
"""
        
        # Main prompt with detailed requirements
        return f"""
Based on the following UI description, generate an Angular component with Angular Material 3 components and TailwindCSS.

UI DESCRIPTION:
{description}

{color_section}

Requirements:
1. Generate TypeScript code for an Angular standalone component with the @Component decorator and all necessary imports.
2. Generate HTML template using Angular Material 3 components where appropriate (like mat-button, mat-card, mat-table, etc.) and TailwindCSS for layout and styling.
3. Generate SCSS with any custom styles needed beyond TailwindCSS.
4. Suggest an appropriate component name in kebab-case.
5. Follow Angular best practices including:
   - Use proper TypeScript types for all variables and methods
   - Implement reactive patterns with signals where appropriate
   - Create responsive layouts with Tailwind's responsive classes
   - Include appropriate ARIA attributes for accessibility
   - Use Angular's built-in directives (*ngIf, *ngFor, etc.) effectively

Material Design Guidelines:
- Use Material 3 components like mat-button, mat-card, mat-form-field, etc.
- Follow Material Design spacing and sizing guidelines
- Prefer Material theme colors but utilize custom colors from the color palette when needed
- Use elevation appropriately for depth and hierarchy

Tailwind Usage:
- Use Tailwind for layout structure (flex, grid, positioning)
- Apply Tailwind for spacing, sizing, and typography
- Use Tailwind for responsive design breakpoints
- Only create custom SCSS when Tailwind doesn't provide the needed styles

Format your response as a JSON object with the following properties:
- component_ts: The TypeScript code for the component
- component_html: The HTML template
- component_scss: The SCSS styles
- component_name: A suggested name for the component (kebab-case)

{examples}
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