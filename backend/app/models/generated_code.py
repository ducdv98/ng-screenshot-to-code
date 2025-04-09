from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class GeneratedCode(BaseModel):
    """
    Model representing generated Angular component code.
    """
    component_ts: str = Field(..., description="TypeScript code for the Angular component")
    component_html: str = Field(..., description="HTML template for the Angular component")
    component_scss: str = Field(..., description="SCSS styles for the Angular component")
    component_name: str = Field(..., description="Suggested name for the component")
    warnings: Optional[List[str]] = Field(default=None, description="Warnings related to the generated code")
    components: Optional[List[Dict[str, Any]]] = Field(default=None, description="Array of component objects when multiple components are generated")
    routing: Optional[List[Dict[str, Any]]] = Field(default=None, description="Array of routing configuration objects for the Angular application")
    
    class Config:
        schema_extra = {
            "example": {
                "component_ts": "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-button',\n  templateUrl: './button.component.html',\n  styleUrls: ['./button.component.scss']\n})\nexport class ButtonComponent {}\n",
                "component_html": "<button mat-raised-button color=\"primary\" class=\"px-4 py-2 rounded-lg\">\n  Click Me\n</button>\n",
                "component_scss": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
                "component_name": "button",
                "warnings": ["Component instance 'Button' references undefined component"],
                "components": [
                    {
                        "componentName": "button",
                        "typescript": "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-button',\n  templateUrl: './button.component.html',\n  styleUrls: ['./button.component.scss']\n})\nexport class ButtonComponent {}\n",
                        "html": "<button mat-raised-button color=\"primary\" class=\"px-4 py-2 rounded-lg\">\n  Click Me\n</button>\n",
                        "scss": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
                    }
                ],
                "routing": [
                    {
                        "path": "",
                        "componentName": "ButtonComponent"
                    }
                ]
            }
        } 