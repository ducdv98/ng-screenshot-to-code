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
        
        # Add main.ts
        files["src/main.ts"] = BoilerplateService._get_main_ts()
        
        # Add index.html
        files["src/index.html"] = BoilerplateService._get_index_html()
        
        # Add styles.scss
        files["src/styles.scss"] = BoilerplateService._get_styles_scss()
        
        # Add app.config.ts
        files["src/app/app.config.ts"] = BoilerplateService._get_app_config_ts()
        
        # Add app component files
        files["src/app/app.component.ts"] = BoilerplateService._get_app_component_ts()
        files["src/app/app.component.html"] = BoilerplateService._get_app_component_html()
        files["src/app/app.component.scss"] = BoilerplateService._get_app_component_scss()
        
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
    def _get_main_ts() -> str:
        """Returns the content for src/main.ts."""
        return """import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
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
</html>
"""
    
    @staticmethod
    def _get_styles_scss() -> str:
        """Returns the content for src/styles.scss."""
        return """/* You can add global styles to this file, and also import other style files */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import Angular Material themes */
@use '@angular/material' as mat;
@include mat.core();

/* Define a custom theme */
$primary: mat.define-palette(mat.$indigo-palette);
$accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
$warn: mat.define-palette(mat.$red-palette);

$theme: mat.define-light-theme((
  color: (
    primary: $primary,
    accent: $accent,
    warn: $warn,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

@include mat.all-component-themes($theme);

html, body { height: 100%; }
body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }
"""
    
    @staticmethod
    def _get_app_config_ts() -> str:
        """Returns the content for src/app/app.config.ts."""
        return """import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    provideAnimationsAsync()
  ]
};
"""
    
    @staticmethod
    def _get_app_component_ts() -> str:
        """Returns the content for src/app/app.component.ts."""
        return """import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import additional generated components here
// The dynamic ID will be replaced with the actual component

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    // Import additional generated components here
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Generated Angular App';
}
"""
    
    @staticmethod
    def _get_app_component_html() -> str:
        """Returns the content for src/app/app.component.html."""
        return """<div class="app-container">
  <!-- Generated content will be rendered here -->
  <!-- The placeholder will be replaced with the actual component -->
</div>
"""
    
    @staticmethod
    def _get_app_component_scss() -> str:
        """Returns the content for src/app/app.component.scss."""
        return """.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
""" 