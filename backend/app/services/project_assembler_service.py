from typing import Dict, List, Any, Optional
from app.services.boilerplate_service import BoilerplateService

class ProjectAssemblerService:
    """
    Service responsible for assembling the complete Angular project structure in memory,
    combining predefined boilerplate files with the AI-generated component code.
    """
    
    def __init__(self):
        """Initialize the service with access to the boilerplate files."""
        self.boilerplate_service = BoilerplateService()
        
    def assemble_project(self, generated_components: List[Dict[str, Any]], routing_info: Optional[List[Dict[str, Any]]] = None) -> Dict[str, str]:
        """
        Assembles a complete Angular project by combining boilerplate files with generated components.
        
        Args:
            generated_components: List of component objects with componentName, typescript, html, scss
            routing_info: Optional list of routing objects with path and componentName
            
        Returns:
            Dict[str, str]: A dictionary representing the virtual file system where keys are file paths 
                           and values are file contents
        """
        # Get all the boilerplate files
        virtual_fs = self.boilerplate_service.get_all_boilerplate_files()
        
        # Process each component and add it to the file system
        for component in generated_components:
            component_name = component.get("componentName", "generated-component")
            # Convert component name to kebab case if it's not already
            component_name_kebab = self._to_kebab_case(component_name)
            
            # Define component directory path
            component_dir = f"src/app/{component_name_kebab}"
            
            # Add component files to the virtual file system
            virtual_fs[f"{component_dir}/{component_name_kebab}.component.ts"] = component.get("typescript", "")
            virtual_fs[f"{component_dir}/{component_name_kebab}.component.html"] = component.get("html", "")
            virtual_fs[f"{component_dir}/{component_name_kebab}.component.scss"] = component.get("scss", "")
        
        # Update the app component to use the main generated component
        if generated_components:
            main_component = generated_components[0]
            main_component_name = main_component.get("componentName", "generated-component")
            main_component_name_kebab = self._to_kebab_case(main_component_name)
            
            # Update app.component.html to use the main component selector
            app_component_html = self._generate_app_component_html(main_component_name_kebab)
            virtual_fs["src/app/app.component.html"] = app_component_html
        
        # Update routing configuration if provided
        if routing_info:
            app_routes_ts = self._generate_app_routes(routing_info, generated_components)
            virtual_fs["src/app/app.routes.ts"] = app_routes_ts
        
        # Add additional configuration files
        virtual_fs["tsconfig.app.json"] = self._get_tsconfig_app_json()
        virtual_fs["tsconfig.spec.json"] = self._get_tsconfig_spec_json()
        virtual_fs["postcss.config.js"] = self._get_postcss_config()
        virtual_fs[".gitignore"] = self._get_gitignore()
        virtual_fs["README.md"] = self._get_readme()
        
        # Create assets directory
        virtual_fs["src/assets/.gitkeep"] = ""
        
        return virtual_fs
    
    def _to_kebab_case(self, s: str) -> str:
        """
        Convert a string to kebab-case.
        
        Args:
            s: Input string, which could be in camelCase, PascalCase, etc.
            
        Returns:
            String converted to kebab-case
        """
        # Handle PascalCase and camelCase
        result = ""
        for i, char in enumerate(s):
            if char.isupper() and i > 0:
                result += "-" + char.lower()
            else:
                result += char.lower()
        
        # Replace spaces and underscores with hyphens
        result = result.replace(" ", "-").replace("_", "-")
        
        # Handle case where multiple hyphens are created
        while "--" in result:
            result = result.replace("--", "-")
        
        return result
    
    def _generate_app_component_html(self, main_component_name_kebab: str) -> str:
        """
        Generate the content for app.component.html that uses the main generated component.
        
        Args:
            main_component_name_kebab: The kebab-case name of the main component
            
        Returns:
            Content for app.component.html
        """
        selector = f"app-{main_component_name_kebab}"
        
        return f"""<div class="app-container">
  <{selector}></{selector}>
</div>

<router-outlet></router-outlet>
"""
    
    def _generate_app_routes(self, routing_info: List[Dict[str, Any]], generated_components: List[Dict[str, Any]]) -> str:
        """
        Generate the content for app.routes.ts based on the routing information.
        
        Args:
            routing_info: List of routing objects with path and componentName
            generated_components: List of component objects
            
        Returns:
            Content for app.routes.ts
        """
        routes = []
        imports = []
        
        for route in routing_info:
            path = route.get("path", "")
            component_name = route.get("componentName", "")
            
            if component_name:
                # Check if this component exists in the generated components
                component_exists = any(comp.get("componentName") == component_name for comp in generated_components)
                
                if component_exists:
                    component_name_kebab = self._to_kebab_case(component_name)
                    class_name = self._to_class_name(component_name)
                    
                    # Add import
                    imports.append(f"import {{ {class_name} }} from './{component_name_kebab}/{component_name_kebab}.component';")
                    
                    # Add route
                    routes.append(f"  {{ path: '{path}', component: {class_name} }}")
        
        # If no routes were generated but we have components, create a default route
        if not routes and generated_components:
            main_component = generated_components[0]
            main_component_name = main_component.get("componentName", "generated-component")
            main_component_name_kebab = self._to_kebab_case(main_component_name)
            main_class_name = self._to_class_name(main_component_name)
            
            imports.append(f"import {{ {main_class_name} }} from './{main_component_name_kebab}/{main_component_name_kebab}.component';")
            routes.append(f"  {{ path: '', component: {main_class_name} }}")
        
        # Join everything together
        imports_str = "\n".join(imports)
        routes_str = ",\n".join(routes)
        
        return f"""import {{ Routes }} from '@angular/router';
{imports_str}

export const routes: Routes = [
{routes_str}
];
"""
    
    def _to_class_name(self, s: str) -> str:
        """
        Convert a string to PascalCase (class name convention).
        
        Args:
            s: Input string
            
        Returns:
            String converted to PascalCase
        """
        # First convert to kebab case
        kebab = self._to_kebab_case(s)
        
        # Then convert to PascalCase
        parts = kebab.split("-")
        return "".join(part.capitalize() for part in parts)
    
    def _get_tsconfig_app_json(self) -> str:
        """Returns the content for tsconfig.app.json."""
        return """{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ]
}"""
    
    def _get_tsconfig_spec_json(self) -> str:
        """Returns the content for tsconfig.spec.json."""
        return """{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": [
      "jasmine"
    ]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}"""
    
    def _get_postcss_config(self) -> str:
        """Returns the content for postcss.config.js."""
        return """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}"""
    
    def _get_gitignore(self) -> str:
        """Returns the content for .gitignore."""
        return """# See http://help.github.com/ignore-files/ for more about ignoring files.

# Compiled output
/dist
/tmp
/out-tsc
/bazel-out

# Node
/node_modules
npm-debug.log
yarn-error.log

# IDEs and editors
.idea/
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# Visual Studio Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.history/*

# Miscellaneous
/.angular/cache
.sass-cache/
/connect.lock
/coverage
/libpeerconnection.log
testem.log
/typings

# System files
.DS_Store
Thumbs.db
"""
    
    def _get_readme(self) -> str:
        """Returns the content for README.md."""
        return """# Generated Angular Project

This Angular project was automatically generated from a UI screenshot or design using AI.

## Features

- Angular 19+
- Angular Material 17+
- Tailwind CSS integration
- Standalone components

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open your browser and navigate to `http://localhost:4200/`

## Build for Production

Run the following command to build the project for production:
```
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Running Tests

Execute the unit tests via Karma:
```
npm test
```

## Additional Information

This project uses:
- Standalone components (no NgModules)
- Angular Material for UI components
- Tailwind CSS for utility-first styling
""" 