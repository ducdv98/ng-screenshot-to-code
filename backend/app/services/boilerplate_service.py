"""
Service responsible for managing Angular v19+/Material v17+ boilerplate configuration files.
These files form the base for both AI code generation assumptions and StackBlitz previews.
"""

from typing import Dict

class BoilerplateService:
    """Provides boilerplate configuration files for Angular v19+/Material v17+ projects."""

    @staticmethod
    def get_all_boilerplate_files() -> Dict[str, str]:
        """
        Returns a dictionary of all boilerplate files with their content.
        
        Returns:
            Dict[str, str]: A dictionary where keys are file paths and values are file contents.
        """
        files = {}
        
        # Add package.json
        files["package.json"] = BoilerplateService._get_package_json()
        
        # Add angular.json
        files["angular.json"] = BoilerplateService._get_angular_json()
        
        # Add tsconfig.json
        files["tsconfig.json"] = BoilerplateService._get_tsconfig_json()
        
        # Add tailwind.config.js
        files["tailwind.config.js"] = BoilerplateService._get_tailwind_config()
        
        # Add postcss.config.js
        files["postcss.config.js"] = BoilerplateService._get_postcss_config()
        
        # Add main.ts
        files["src/main.ts"] = BoilerplateService._get_main_ts()
        
        # Add index.html
        files["src/index.html"] = BoilerplateService._get_index_html()
        
        # Add styles.scss
        files["src/styles.scss"] = BoilerplateService._get_styles_scss()
        
        # Add app.config.ts
        files["src/app/app.config.ts"] = BoilerplateService._get_app_config_ts()
        
        # Add app.routes.ts
        files["src/app/app.routes.ts"] = BoilerplateService._get_app_routes_ts()
        
        # Add app component files
        files["src/app/app.component.ts"] = BoilerplateService._get_app_component_ts()
        files["src/app/app.component.html"] = BoilerplateService._get_app_component_html()
        files["src/app/app.component.scss"] = BoilerplateService._get_app_component_scss()
        
        # Add .gitignore
        files[".gitignore"] = BoilerplateService._get_gitignore()
        
        # Add tsconfig.app.json
        files["tsconfig.app.json"] = BoilerplateService._get_tsconfig_app_json()
        
        # Add tsconfig.spec.json
        files["tsconfig.spec.json"] = BoilerplateService._get_tsconfig_spec_json()
        
        # Create assets directory placeholder
        files["src/assets/.gitkeep"] = ""
        
        # Add README.md
        files["README.md"] = BoilerplateService._get_readme()
        
        return files
    
    @staticmethod
    def _get_package_json() -> str:
        """Returns the content for package.json."""
        return """{
  "name": "generated-angular-app",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch",
    "test": "ng test"
  },
  "dependencies": {
    "@angular/animations": "^19.0.0",
    "@angular/cdk": "^19.0.0",
    "@angular/common": "^19.0.0",
    "@angular/compiler": "^19.0.0",
    "@angular/core": "^19.0.0",
    "@angular/forms": "^19.0.0",
    "@angular/material": "^19.0.0",
    "@angular/platform-browser": "^19.0.0",
    "@angular/platform-browser-dynamic": "^19.0.0",
    "@angular/router": "^19.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.6.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^19.0.0",
    "@angular/cli": "^19.0.0",
    "@angular/compiler-cli": "^19.0.0",
    "@types/jasmine": "~5.1.0",
    "autoprefixer": "^10.4.14",
    "jasmine-core": "~5.1.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.3.0",
    "typescript": "~5.2.0"
  }
}"""
    
    @staticmethod
    def _get_angular_json() -> str:
        """Returns the content for angular.json."""
        return """{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "cli": {
    "packageManager": "npm",
    "analytics": false
  },
  "newProjectRoot": "projects",
  "projects": {
    "generated-angular-app": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss",
          "standalone": true
        },
        "@schematics/angular:directive": {
          "standalone": true
        },
        "@schematics/angular:pipe": {
          "standalone": true
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/generated-angular-app",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.json",
            "inlineStyleLanguage": "scss",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.scss"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "generated-angular-app:build:production"
            },
            "development": {
              "buildTarget": "generated-angular-app:build:development"
            }
          },
          "defaultConfiguration": "development"
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": ["zone.js", "zone.js/testing"],
            "tsConfig": "tsconfig.spec.json",
            "inlineStyleLanguage": "scss",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.scss"],
            "scripts": []
          }
        }
      }
    }
  }
}"""
    
    @staticmethod
    def _get_tsconfig_json() -> str:
        """Returns the content for tsconfig.json."""
        return """{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": [
      "ES2022",
      "dom"
    ],
    "paths": {
      "@app/*": ["./src/app/*"]
    }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}"""
    
    @staticmethod
    def _get_tailwind_config() -> str:
        """Returns the content for tailwind.config.js."""
        return """/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}"""
    
    @staticmethod
    def _get_postcss_config() -> str:
        """Returns the content for postcss.config.js."""
        return """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}"""
    
    @staticmethod
    def _get_main_ts() -> str:
        """Returns the content for src/main.ts."""
        return """import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
"""
    
    @staticmethod
    def _get_index_html() -> str:
        """Returns the content for src/index.html."""
        return """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Generated Angular App</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
<body class="mat-typography">
  <app-root></app-root>
</body>
</html>"""
    
    @staticmethod
    def _get_styles_scss() -> str:
        """Returns the content for src/styles.scss."""
        return """/* You can add global styles to this file, and also import other style files */
@use '@angular/material' as mat;

// Include Material core styles
@include mat.core();

// Define a theme.
$primary: mat.define-palette(mat.$indigo-palette);
$accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

// Define a light theme
$theme: mat.define-light-theme((
  color: (
    primary: $primary,
    accent: $accent,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

// Apply the Material theme
@include mat.all-component-themes($theme);

/* Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global styles */
html, body { 
  height: 100%; 
}

body { 
  margin: 0; 
  font-family: Roboto, "Helvetica Neue", sans-serif; 
}

/* Base container styles */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
"""
    
    @staticmethod
    def _get_app_config_ts() -> str:
        """Returns the content for src/app/app.config.ts."""
        return """import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync()
  ]
};
"""
    
    @staticmethod
    def _get_app_routes_ts() -> str:
        """Returns the content for src/app/app.routes.ts."""
        return """import { Routes } from '@angular/router';

// Default routes, will be updated during project assembly with generated components
export const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' }
];
"""
    
    @staticmethod
    def _get_app_component_ts() -> str:
        """Returns the content for src/app/app.component.ts."""
        return """import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'generated-angular-app';
}
"""
    
    @staticmethod
    def _get_app_component_html() -> str:
        """Returns the content for src/app/app.component.html."""
        return """<div class="app-container">
  <!-- Generated components will be inserted here during project assembly -->
</div>

<router-outlet></router-outlet>
"""
    
    @staticmethod
    def _get_app_component_scss() -> str:
        """Returns the content for src/app/app.component.scss."""
        return """// Application-level styles
.app-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
"""
    
    @staticmethod
    def _get_gitignore() -> str:
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
    
    @staticmethod
    def _get_tsconfig_app_json() -> str:
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
    
    @staticmethod
    def _get_tsconfig_spec_json() -> str:
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
    
    @staticmethod
    def _get_readme() -> str:
        """Returns the content for README.md."""
        return """# Generated Angular Application

This Angular application was automatically generated from a visual design using AI technology.

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

## Technology Stack

- Angular v19+
- Angular Material v17+
- Tailwind CSS v3+

## Project Structure

This is a standard Angular CLI project with the following structure:

- `src/app/` - Contains the main application code
  - Components are organized in their own folders
  - Routing configuration is in `app.routes.ts`
- `src/assets/` - Place for static assets like images
- Configuration files for Angular, TypeScript, and Tailwind CSS at the root

## Customization

Feel free to modify this code as needed for your project. The generated components 
provide a starting point based on the provided design.

## Further Help

To get more help on the Angular CLI use `ng help` or check out the 
[Angular CLI Overview and Command Reference](https://angular.io/cli) page.
""" 