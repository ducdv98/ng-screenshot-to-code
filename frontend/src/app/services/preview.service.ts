import { Injectable } from '@angular/core';
import { GeneratedCode, GeneratedComponent } from '../models/generated-code.model';
import * as LZString from 'lz-string';

@Injectable({
  providedIn: 'root'
})
export class PreviewService {
  
  /**
   * Generate HTML content for preview iframe
   */
  generatePreviewHtml(generatedCode: GeneratedCode): string {
    // Create a robust HTML structure with the component HTML and styles
    // Include both CDN and local assets for maximum compatibility
    
    const mainComponent = generatedCode.components[0];
    
    const previewHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Component Preview - ${mainComponent.componentName}</title>
        
        <!-- Material Design Icons -->
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
        
        <!-- Google Fonts - Roboto -->
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" rel="stylesheet">
        
        <!-- Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        
        <!-- Configure Tailwind -->
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: {
                    50: '#e8eaf6',
                    100: '#c5cae9',
                    200: '#9fa8da',
                    300: '#7986cb',
                    400: '#5c6bc0',
                    500: '#3f51b5',
                    600: '#3949ab',
                    700: '#303f9f',
                    800: '#283593',
                    900: '#1a237e',
                  },
                  accent: {
                    50: '#fce4ec',
                    100: '#f8bbd0',
                    200: '#f48fb1',
                    300: '#f06292',
                    400: '#ec407a',
                    500: '#e91e63',
                    600: '#d81b60',
                    700: '#c2185b',
                    800: '#ad1457',
                    900: '#880e4f',
                  }
                }
              }
            }
          }
        </script>
        
        <!-- Angular Material Theme -->
        <link href="/assets/themes/indigo-pink.css" rel="stylesheet">
        
        <!-- Fallback to CDN if local asset fails -->
        <script>
          (function() {
            const link = document.querySelector('link[href="/assets/themes/indigo-pink.css"]');
            link.addEventListener('error', function() {
              const fallbackLink = document.createElement('link');
              fallbackLink.rel = 'stylesheet';
              // Angular Material 19 themes are in @angular/material
              fallbackLink.href = 'https://cdn.jsdelivr.net/npm/@angular/material@19.2.8/core/theming/prebuilt/indigo-pink.css';
              document.head.appendChild(fallbackLink);
              console.log('Using fallback Angular Material theme from CDN');
            });
          })();
        </script>
        
        <style>
          /* Base styles */
          body { 
            margin: 0; 
            font-family: Roboto, "Helvetica Neue", sans-serif; 
            padding: 16px;
            color: rgba(0, 0, 0, 0.87);
            background: #fafafa;
          }
          
          /* Component specific styles */
          ${mainComponent.scss}
          
          /* Mat Typography classes */
          .mat-typography {
            font: 400 14px/20px Roboto, "Helvetica Neue", sans-serif;
            letter-spacing: normal;
          }
          
          .mat-headline-1 {font-size: 96px; font-weight: 300; letter-spacing: -0.015625em;}
          .mat-headline-2 {font-size: 60px; font-weight: 300; letter-spacing: -0.0083em;}
          .mat-headline-3 {font-size: 48px; font-weight: 400; letter-spacing: normal;}
          .mat-headline-4 {font-size: 34px; font-weight: 400; letter-spacing: 0.0073em;}
          .mat-headline-5 {font-size: 24px; font-weight: 400; letter-spacing: normal;}
          .mat-headline-6 {font-size: 20px; font-weight: 500; letter-spacing: 0.0125em;}
          .mat-subtitle-1 {font-size: 16px; font-weight: 400; letter-spacing: 0.009375em;}
          .mat-subtitle-2 {font-size: 14px; font-weight: 500; letter-spacing: 0.0071em;}
          .mat-body-1 {font-size: 14px; font-weight: 400; letter-spacing: 0.0179em;}
          .mat-body-2 {font-size: 14px; font-weight: 500; letter-spacing: 0.0179em;}
          .mat-caption {font-size: 12px; font-weight: 400; letter-spacing: 0.0333em;}
          
          /* Material 3 styling helpers */
          .mat-elevation-z1 { box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12); }
          .mat-elevation-z2 { box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12); }
          .mat-elevation-z3 { box-shadow: 0 3px 3px -2px rgba(0,0,0,.2), 0 3px 4px 0 rgba(0,0,0,.14), 0 1px 8px 0 rgba(0,0,0,.12); }
          .mat-elevation-z4 { box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12); }
          .mat-elevation-z6 { box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12); }
          .mat-elevation-z8 { box-shadow: 0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12); }
          
          /* Card styles */
          mat-card, .mat-mdc-card {
            display: block;
            position: relative;
            padding: 16px;
            border-radius: 4px;
            background-color: white;
            color: rgba(0, 0, 0, 0.87);
            box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
          }
          
          .mat-mdc-card-header {
            display: flex;
            padding: 16px 16px 0;
          }
          
          .mat-mdc-card-title {
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 12px;
          }
          
          .mat-mdc-card-subtitle {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.54);
            margin-bottom: 12px;
          }
          
          .mat-mdc-card-content {
            padding: 16px;
            font-size: 14px;
          }
          
          .mat-mdc-card-actions {
            display: flex;
            padding: 8px;
          }
          
          /* Button styles */
          [mat-button], [mat-raised-button], [mat-stroked-button], [mat-flat-button], [mat-icon-button], .mat-mdc-button, .mat-mdc-raised-button, .mat-mdc-stroked-button, .mat-mdc-flat-button, .mat-mdc-icon-button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 64px;
            padding: 0 16px;
            border-radius: 4px;
            font-family: Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0.0892857143em;
            height: 36px;
            margin: 0;
            overflow: hidden;
            line-height: 36px;
            cursor: pointer;
            transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            white-space: nowrap;
            border: none;
          }
          
          [mat-raised-button], .mat-mdc-raised-button {
            box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
          }
          
          [mat-stroked-button], .mat-mdc-stroked-button {
            padding: 0 15px;
            border: 1px solid rgba(0,0,0,.12);
            line-height: 34px;
          }
          
          [mat-icon-button], .mat-mdc-icon-button {
            min-width: 0;
            padding: 0;
            width: 40px;
            height: 40px;
            border-radius: 50%;
          }
          
          [color="primary"][mat-button], .mat-mdc-button[color="primary"] {
            color: #3f51b5;
          }
          
          [color="accent"][mat-button], .mat-mdc-button[color="accent"] {
            color: #e91e63;
          }
          
          [color="warn"][mat-button], .mat-mdc-button[color="warn"] {
            color: #f44336;
          }
          
          [color="primary"][mat-raised-button], .mat-mdc-raised-button[color="primary"] {
            background-color: #3f51b5;
            color: white;
          }
          
          [color="accent"][mat-raised-button], .mat-mdc-raised-button[color="accent"] {
            background-color: #e91e63;
            color: white;
          }
          
          [color="warn"][mat-raised-button], .mat-mdc-raised-button[color="warn"] {
            background-color: #f44336;
            color: white;
          }
          
          /* Ripple styles */
          .ripple {
            position: absolute;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
          }
          
          @keyframes ripple-animation {
            to {
              transform: scale(2.5);
              opacity: 0;
            }
          }
          
          /* Material Icons styling */
          .material-icons, mat-icon {
            font-family: 'Material Icons';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
            vertical-align: middle;
          }
          
          /* Material Symbols styling */
          .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
          }
          
          /* Toolbar styles */
          mat-toolbar, .mat-toolbar {
            display: flex;
            box-sizing: border-box;
            padding: 0 16px;
            width: 100%;
            flex-direction: row;
            align-items: center;
            white-space: nowrap;
            height: 64px;
            background: #f5f5f5;
            color: rgba(0, 0, 0, 0.87);
          }
          
          mat-toolbar[color="primary"], .mat-toolbar[color="primary"] {
            background: #3f51b5;
            color: white;
          }
          
          mat-toolbar[color="accent"], .mat-toolbar[color="accent"] {
            background: #e91e63;
            color: white;
          }
          
          /* Form field styles */
          mat-form-field, .mat-form-field {
            display: block;
            position: relative;
            margin-bottom: 16px;
          }
          
          .mat-form-field-label {
            position: absolute;
            left: 0;
            top: 0;
            font-size: 16px;
            pointer-events: none;
            transition: transform 0.4s, color 0.4s, font-size 0.4s;
            color: rgba(0, 0, 0, 0.6);
          }
          
          /* List styles */
          mat-list, .mat-list {
            display: block;
            padding: 8px 0;
          }
          
          mat-list-item, .mat-list-item {
            display: flex;
            align-items: center;
            box-sizing: border-box;
            height: 48px;
            padding: 0 16px;
            position: relative;
          }
        </style>
      </head>
      <body class="mat-typography">
        <div id="component-preview">
          ${mainComponent.html}
        </div>
      </body>
      </html>
    `;
    
    return previewHtml;
  }

  /**
   * Prepare CodeSandbox parameters
   */
  prepareCodeSandboxParameters(generatedCode: GeneratedCode): string {
    try {
      console.log(`Processing ${generatedCode.components.length} components`);
      generatedCode.components.forEach(c => console.log(` - ${c.componentName}`));
      
      // Initialize files object for CodeSandbox
      const files: Record<string, { content: string }> = {};
      
      // Add all components to files
      generatedCode.components.forEach(component => {
        const kebabName = this.toKebabCase(component.componentName);
        
        // Add component TypeScript file
        files[`src/app/components/${kebabName}/${kebabName}.component.ts`] = {
          content: component.typescript
        };
        
        // Add component HTML template
        files[`src/app/components/${kebabName}/${kebabName}.component.html`] = {
          content: component.html
        };
        
        // Add component SCSS styles
        files[`src/app/components/${kebabName}/${kebabName}.component.scss`] = {
          content: component.scss
        };
      });
      
      // Get the main component for app construction
      const mainComponent = generatedCode.components[0];
      
      // Add app routing module that imports all components
      files['src/app/app.routes.ts'] = {
        content: this.generateAppRoutingModule(generatedCode.components)
      };
      
      // Add app component that uses the router outlet
      files['src/app/app.component.ts'] = {
        content: this.generateAppComponent(generatedCode.components)
      };
      
      // Add required boilerplate files
      this.addBoilerplateFiles(files);
      
      // Convert files object to parameters string and compress
      const parameters = {
        files
      };
      
      const paramStr = JSON.stringify(parameters);
      const compressed = LZString.compressToBase64(paramStr);
      
      return compressed;
    } catch (error) {
      console.error('Error preparing CodeSandbox parameters:', error);
      throw new Error('Failed to prepare CodeSandbox parameters');
    }
  }

  /**
   * Add boilerplate files
   */
  private addBoilerplateFiles(files: Record<string, { content: string }>): void {
    // Add package.json
    files['package.json'] = {
      content: `{
  "name": "angular-codesandbox",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build"
  },
  "dependencies": {
    "@angular/animations": "^19.2.0",
    "@angular/cdk": "^19.2.0",
    "@angular/common": "^19.2.0",
    "@angular/compiler": "^19.2.0",
    "@angular/core": "^19.2.0",
    "@angular/forms": "^19.2.0",
    "@angular/material": "^19.2.0",
    "@angular/platform-browser": "^19.2.0",
    "@angular/platform-browser-dynamic": "^19.2.0",
    "@angular/router": "^19.2.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^19.2.0",
    "@angular/cli": "^19.2.0",
    "@angular/compiler-cli": "^19.2.0",
    "typescript": "~5.7.0"
  }
}`
    };
    
    // Add angular.json
    files['angular.json'] = {
      content: `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "angular-preview": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss"
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/angular-preview",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": [
              "zone.js"
            ],
            "tsConfig": "tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.scss"
            ],
            "scripts": []
          }
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "buildTarget": "angular-preview:build"
          }
        }
      }
    }
  },
  "cli": {
    "analytics": false
  }
}`
    };
    
    // Add tsconfig.json
    files['tsconfig.json'] = {
      content: `{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": [
      "ES2022",
      "dom"
    ]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}`
    };
    
    // Add tsconfig.app.json
    files['tsconfig.app.json'] = {
      content: `{
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
}`
    };
    
    // Add main.ts
    files['src/main.ts'] = {
      content: `import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
`
    };
    
    // Add app.config.ts
    files['src/app/app.config.ts'] = {
      content: `import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient()
  ]
};
`
    };
    
    // Add index.html
    files['src/index.html'] = {
      content: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Angular Preview</title>
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
`
    };
    
    // Add styles.scss
    files['src/styles.scss'] = {
      content: `/* You can add global styles to this file, and also import other style files */
@import '@angular/material/prebuilt-themes/indigo-pink.css';

html, body { height: 100%; }
body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }
`
    };
  }
  
  /**
   * Generate app routing module
   */
  private generateAppRoutingModule(components: GeneratedComponent[]): string {
    // Generate imports for all components
    const imports = components.map(component => 
      `import { ${component.componentName} } from './${this.toKebabCase(component.componentName)}/${this.toKebabCase(component.componentName)}.component';`
    ).join('\n');
    
    // Generate routes for all components
    const routes = components.map((component, index) => {
      const path = index === 0 ? '' : this.toKebabCase(component.componentName);
      return `  { path: '${path}', component: ${component.componentName} }`;
    }).join(',\n');
    
    return `import { Routes } from '@angular/router';
${imports}

export const routes: Routes = [
${routes}
];
`;
  }
  
  /**
   * Generate app component
   */
  private generateAppComponent(components: GeneratedComponent[]): string {
    return `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular Preview';
}
`;
  }

  /**
   * Convert string to kebab case
   */
  private toKebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Convert string to pascal case
   */
  private toPascalCase(str: string): string {
    return str
      .split('-')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
  }
}