import { Injectable } from '@angular/core';
import { GeneratedCode } from '../models/generated-code.model';
import { Project } from '@stackblitz/sdk';

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
    
    const previewHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Component Preview - ${generatedCode.component_name}</title>
        
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
              extend: {}
            }
          }
        </script>
        
        <!-- Angular Material Theme (primary: indigo, accent: pink) -->
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
            });
          })();
        </script>
        
        <style>
          /* Base styles */
          body { 
            margin: 0; 
            font-family: Roboto, "Helvetica Neue", sans-serif; 
            padding: 16px;
          }
          
          /* Material 3 styling helpers */
          .mat-elevation-z1 { box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12); }
          .mat-elevation-z2 { box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12); }
          .mat-elevation-z4 { box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12); }
          
          /* Material Icons styling */
          .material-icons {
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
          
          /* Component specific styles */
          ${generatedCode.component_scss}
        </style>
      </head>
      <body class="mat-typography">
        <div id="component-preview" class="mat-app-background">
          ${generatedCode.component_html}
        </div>
        
        <!-- Simple runtime script to handle basic Material interactions -->
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            // Handle ripple effects for buttons with mat-button classes
            const buttons = document.querySelectorAll('[mat-button], [mat-raised-button], [mat-icon-button]');
            buttons.forEach(button => {
              button.addEventListener('click', function(e) {
                const rect = button.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.className = 'ripple';
                
                button.appendChild(ripple);
                setTimeout(() => button.removeChild(ripple), 600);
              });
            });
            
            // Map Angular Material icon usage to standard Material Icons
            document.querySelectorAll('mat-icon').forEach(icon => {
              // Get the text content which should be the icon name
              const iconName = icon.textContent ? icon.textContent.trim() : '';
              if (iconName) {
                // Clear the element and add the icon as a class
                icon.innerHTML = iconName;
                icon.classList.add('material-icons');
              }
            });
          });
        </script>
      </body>
      </html>
    `;
    
    return previewHtml;
  }

  /**
   * Prepare a StackBlitz project with the generated component code
   */
  prepareStackBlitzProject(generatedCode: GeneratedCode): Project {
    // Use specific versions that are known to work together
    const angularVersion = '19.0.0'; // Use exact version for stability in StackBlitz
    
    // Convert the component name to PascalCase for proper imports
    const componentClassName = this.toPascalCase(generatedCode.component_name);

    // Create a simplified CSS version of the component's SCSS
    const simplifiedComponentCSS = generatedCode.component_scss || '';

    // Files structure for the project - simplified for StackBlitz
    const files: Record<string, string> = {
      'package.json': this.generateSimplifiedPackageJson(generatedCode),
      'angular.json': this.generateSimplifiedAngularJson(generatedCode),
      'tsconfig.json': this.generateSimplifiedTsConfig(),
      'src/index.html': this.generateIndexHtml(generatedCode),
      'src/styles.css': this.generateSimplifiedStyles(),
      'src/main.ts': this.generateSimplifiedMainTs(generatedCode),
      'src/app/app.component.ts': this.generateSimplifiedAppComponent(generatedCode),
      [`src/app/${generatedCode.component_name}.component.ts`]: this.generateSimplifiedComponentTs(generatedCode),
      [`src/app/${generatedCode.component_name}.component.html`]: generatedCode.component_html,
      'src/app/app.routes.ts': this.generateSimplifiedAppRoutes(),
      'src/app/app.config.ts': this.generateSimplifiedAppConfig()
    };

    // Add any additional files but simplify them
    if (generatedCode.additional_files) {
      for (const additionalFile of generatedCode.additional_files) {
        // Skip CSS/SCSS files and configuration files that might cause issues
        if (!additionalFile.path.endsWith('.scss') && 
            !additionalFile.path.endsWith('.css') &&
            !additionalFile.path.includes('config')) {
          files[additionalFile.path] = additionalFile.content;
        }
      }
    }

    // Use a simplified project configuration for StackBlitz
    return {
      title: `${generatedCode.component_name} Angular Component`,
      description: 'Generated Angular component from screenshot-to-code',
      template: 'angular-cli',
      files: files
    };
  }

  /**
   * Generate the index.html file
   */
  private generateIndexHtml(generatedCode: GeneratedCode): string {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Generated Component Preview</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
<body class="mat-typography">
  <app-root></app-root>
</body>
</html>`;
  }

  /**
   * Generate a simplified package.json for StackBlitz
   */
  private generateSimplifiedPackageJson(generatedCode: GeneratedCode): string {
    const angularVersion = '19.0.0';
    
    // A minimal package.json with only essential dependencies
    const packageJson = {
      name: `${generatedCode.component_name}-preview`,
      version: '0.0.0',
      private: true,
      dependencies: {
        '@angular/animations': angularVersion,
        '@angular/common': angularVersion,
        '@angular/compiler': angularVersion,
        '@angular/core': angularVersion,
        '@angular/forms': angularVersion,
        '@angular/platform-browser': angularVersion,
        '@angular/platform-browser-dynamic': angularVersion,
        '@angular/router': angularVersion,
        'rxjs': '~7.8.0',
        'tslib': '~2.3.0',
        'zone.js': '~0.14.0'
      },
      scripts: {
        ng: 'ng',
        start: 'ng serve',
        build: 'ng build'
      }
    };
    
    return JSON.stringify(packageJson, null, 2);
  }

  /**
   * Generate a simplified Angular.json for StackBlitz
   */
  private generateSimplifiedAngularJson(generatedCode: GeneratedCode): string {
    return `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "demo": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.json",
            "inlineStyleLanguage": "css",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.css"],
            "scripts": []
          }
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "browserTarget": "demo:build"
          }
        }
      }
    }
  }
}`;
  }

  /**
   * Generate a simplified tsconfig.json for StackBlitz
   */
  private generateSimplifiedTsConfig(): string {
    return `{
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
    "useDefineForClassFields": false,
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
}`;
  }

  /**
   * Generate simplified styles without Tailwind
   */
  private generateSimplifiedStyles(): string {
    return `/* Basic styles */
html, body { height: 100%; }
body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; padding: 16px; }
.container { margin: 0 auto; max-width: 1200px; padding: 0 15px; }
.border { border: 1px solid #e2e8f0; }
.rounded-lg { border-radius: 0.5rem; }
.p-4 { padding: 1rem; }
.my-4 { margin-top: 1rem; margin-bottom: 1rem; }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.text-2xl { font-size: 1.5rem; }
.font-bold { font-weight: 700; }
.mb-4 { margin-bottom: 1rem; }`;
  }

  /**
   * Generate a simplified main.ts file for StackBlitz
   */
  private generateSimplifiedMainTs(generatedCode: GeneratedCode): string {
    return `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));`;
  }

  /**
   * Generate a simplified app component for StackBlitz
   */
  private generateSimplifiedAppComponent(generatedCode: GeneratedCode): string {
    const componentClassName = this.toPascalCase(generatedCode.component_name);
    
    return `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ${componentClassName}Component } from './${generatedCode.component_name}.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ${componentClassName}Component],
  template: \`
    <div class="container">
      <h1 class="text-2xl font-bold mb-4">Generated Component Preview</h1>
      <div class="border rounded-lg p-4 shadow-md">
        <${generatedCode.component_name}></${generatedCode.component_name}>
      </div>
    </div>
  \`
})
export class AppComponent {
  title = 'Generated Component Preview';
}`;
  }

  /**
   * Generate a simplified component TypeScript file for StackBlitz
   */
  private generateSimplifiedComponentTs(generatedCode: GeneratedCode): string {
    // Remove potential imports to Material or other problematic dependencies
    let componentTs = generatedCode.component_ts;
    
    // Ensure it's a standalone component
    if (!componentTs.includes('standalone: true')) {
      componentTs = componentTs.replace(
        /@Component\(\{/,
        '@Component({\n  standalone: true,'
      );
    }
    
    // Add CommonModule import if not present
    if (!componentTs.includes('CommonModule')) {
      componentTs = componentTs.replace(
        /import \{ Component[^;]*;/,
        'import { Component } from \'@angular/core\';\nimport { CommonModule } from \'@angular/common\';'
      );
      
      // Add to imports array if it exists
      if (componentTs.includes('imports: [')) {
        componentTs = componentTs.replace(
          /imports: \[([^\]]*)\]/,
          'imports: [CommonModule, $1]'
        );
      } else {
        // Add imports array if not present
        componentTs = componentTs.replace(
          /@Component\(\{([^}]*)\}/,
          '@Component({\n  imports: [CommonModule],\n$1}'
        );
      }
    }
    
    return componentTs;
  }

  /**
   * Generate a simplified app routes file for StackBlitz
   */
  private generateSimplifiedAppRoutes(): string {
    return `import { Routes } from '@angular/router';
export const routes: Routes = [];`;
  }

  /**
   * Generate a simplified app config file for StackBlitz
   */
  private generateSimplifiedAppConfig(): string {
    return `import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations()
  ]
};`;
  }

  /**
   * Helper: Convert kebab-case to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split('-')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
  }
}