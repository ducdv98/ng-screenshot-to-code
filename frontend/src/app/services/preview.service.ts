import { Injectable } from '@angular/core';
import { GeneratedCode, GeneratedCodeV2, GeneratedComponent } from '../models/generated-code.model';
import { Project } from '@stackblitz/sdk';
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
            const buttons = document.querySelectorAll('[mat-button], [mat-raised-button], [mat-stroked-button], [mat-flat-button], [mat-icon-button]');
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
            
            // Simple toggle for mat-expansion-panel
            document.querySelectorAll('.mat-expansion-panel-header').forEach(header => {
              header.addEventListener('click', function() {
                const panel = this.closest('.mat-expansion-panel');
                if (panel) {
                  panel.classList.toggle('mat-expanded');
                  const content = panel.querySelector('.mat-expansion-panel-content');
                  if (content) {
                    content.style.display = panel.classList.contains('mat-expanded') ? 'block' : 'none';
                  }
                }
              });
            });
            
            // Handle checkbox toggle
            document.querySelectorAll('mat-checkbox').forEach(checkbox => {
              checkbox.addEventListener('click', function() {
                this.classList.toggle('mat-checkbox-checked');
                const input = this.querySelector('input[type="checkbox"]');
                if (input) {
                  input.checked = !input.checked;
                }
              });
            });
            
            // Handle radio button toggle
            document.querySelectorAll('mat-radio-button').forEach(radio => {
              radio.addEventListener('click', function() {
                const name = this.getAttribute('name');
                if (name) {
                  document.querySelectorAll('mat-radio-button[name="' + name + '"]').forEach(btn => {
                    btn.classList.remove('mat-radio-checked');
                  });
                }
                this.classList.add('mat-radio-checked');
                const input = this.querySelector('input[type="radio"]');
                if (input) {
                  input.checked = true;
                }
              });
            });
            
            // Basic tab switching
            document.querySelectorAll('.mat-tab-label').forEach(tab => {
              tab.addEventListener('click', function() {
                const tabGroup = this.closest('mat-tab-group');
                if (!tabGroup) return;
                
                // Get index of clicked tab
                const tabs = Array.from(tabGroup.querySelectorAll('.mat-tab-label'));
                const index = tabs.indexOf(this);
                
                // Remove active class from all tabs and bodies
                tabs.forEach(t => t.classList.remove('mat-tab-label-active'));
                
                // Add active class to clicked tab
                this.classList.add('mat-tab-label-active');
                
                // Show the corresponding content
                const bodies = tabGroup.querySelectorAll('.mat-tab-body');
                bodies.forEach((body, i) => {
                  body.style.display = i === index ? 'block' : 'none';
                });
              });
            });
            
            // Activate first tab if exists
            const firstTab = document.querySelector('.mat-tab-label');
            if (firstTab) {
              firstTab.click();
            }
            
            console.log('Static preview initialized with enhanced Material components support');
          });
        </script>
      </body>
      </html>
    `;
    
    return previewHtml;
  }

  /**
   * Prepare a StackBlitz project with the new multi-component generated code format
   */
  prepareStackBlitzProjectV2(generatedCodeV2: GeneratedCodeV2): Project {
    // Log the components we're working with
    console.log(`Processing ${generatedCodeV2.components.length} components`);
    generatedCodeV2.components.forEach(c => console.log(` - ${c.componentName}`));
    
    // Create files object for StackBlitz - MUST be directly at root level
    const files: Record<string, string> = {};
    
    console.log('---COMPONENT DEBUG START---');
    // Step 1: Add all component code to separate files
    const componentSelectors = new Map<string, string>();
    
    // First pass - build selector map
    generatedCodeV2.components.forEach(comp => {
      const kebabName = this.toKebabCase(comp.componentName);
      componentSelectors.set(comp.componentName, `app-${kebabName}`);
    });
    
    console.log('Component selectors:', Object.fromEntries(componentSelectors));
    
    // Second pass - process components
    generatedCodeV2.components.forEach((component, index) => {
      console.log(`Processing component ${index+1}: ${component.componentName}`);
      
      const kebabName = this.toKebabCase(component.componentName);
      
      // Log just snippets of content for debugging
      const tsPreview = component.typescript.substring(0, 100) + '...';
      const htmlPreview = component.html.substring(0, 100) + '...';
      console.log(`TS content preview: ${tsPreview}`);
      console.log(`HTML content preview: ${htmlPreview}`);
      
      // Ensure TypeScript includes standalone: true and proper imports
      let typescript = component.typescript;
      
      // Fix imports of other components to reference root level instead of subdirectories
      typescript = typescript.replace(
        /import\s+{\s*(\w+)\s*}\s+from\s+['"]\.\/[\w-]+\/[\w-]+\.component['"]/g, 
        'import { $1 } from \'./$1.component\''
      );
      
      // Also fix kebab-case component imports
      generatedCodeV2.components.forEach(otherComp => {
        const otherKebabName = this.toKebabCase(otherComp.componentName);
        // Look for imports from subdirectories that match this component
        const subDirPattern = new RegExp(`import\\s+{\\s*${otherComp.componentName}\\s*}\\s+from\\s+['"]\\.\\/[\\w-]+\\/${otherKebabName}\\.component['"]`, 'g');
        // Replace with direct root import
        typescript = typescript.replace(subDirPattern, `import { ${otherComp.componentName} } from './${otherKebabName}.component'`);
      });
      
      // Check if the component is already standalone
      if (!typescript.includes('standalone: true')) {
        // Detect Material components used in HTML
        const materialImports = [];
        
        // Check HTML for common Material components
        if (component.html.includes('mat-button') || component.html.includes('mat-raised-button') || component.html.includes('mat-icon-button')) {
          materialImports.push('MatButtonModule');
        }
        if (component.html.includes('mat-card')) {
          materialImports.push('MatCardModule');
        }
        if (component.html.includes('mat-toolbar')) {
          materialImports.push('MatToolbarModule');
        }
        if (component.html.includes('mat-icon')) {
          materialImports.push('MatIconModule');
        }
        if (component.html.includes('mat-form-field') || component.html.includes('matInput')) {
          materialImports.push('MatInputModule');
        }
        if (component.html.includes('mat-list')) {
          materialImports.push('MatListModule');
        }
        if (component.html.includes('mat-sidenav')) {
          materialImports.push('MatSidenavModule');
        }
        
        // Create the imports array
        const baseImports = 'CommonModule, NgClass, NgFor, NgIf, FormsModule, ReactiveFormsModule';
        const allImports = materialImports.length > 0 
          ? `${baseImports}, ${materialImports.join(', ')}` 
          : baseImports;
        
        // Add standalone: true to the @Component decorator with all imports
        typescript = typescript.replace(
          /@Component\(\s*{\s*/,
          `@Component({\n  standalone: true,\n  imports: [${allImports}],\n  `
        );
        
        // Add necessary imports if they don't exist
        let importStatement = `import { Component, OnInit } from '@angular/core';\nimport { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';\nimport { FormsModule, ReactiveFormsModule } from '@angular/forms';\n`;
        
        // Add Material imports
        if (materialImports.length > 0) {
          materialImports.forEach(module => {
            const modulePath = module.replace('Module', '').toLowerCase();
            importStatement += `import { ${module} } from '@angular/material/${modulePath}';\n`;
          });
        }
        
        // Find the first import statement or start of file
        const importIndex = typescript.search(/import\s+{/);
        if (importIndex >= 0) {
          // Insert before first import
          typescript = importStatement + typescript;
        } else {
          // Add to start of file if no imports
          typescript = importStatement + typescript;
        }
      }
      
      // Process HTML to fix component references
      let html = component.html;
      
      // Place component files directly at root level for node template
      files[`${kebabName}.component.ts`] = typescript;
      files[`${kebabName}.component.html`] = html;
      files[`${kebabName}.component.scss`] = component.scss || '';
      
      console.log(`Added component files for: ${kebabName}`);
    });
    console.log('---COMPONENT DEBUG END---');
    
    // Step 2: Add essential project files
    
    // Base package.json with Angular Material
    files['package.json'] = `{
  "name": "angular-screenshot-to-code",
  "version": "0.0.0",
  "private": true,
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
    "rxjs": "^7.8.0",
    "tslib": "^2.6.2",
    "zone.js": "^0.14.0"
  },
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build"
  }
}`;
  
    // Main App Component that imports and uses the primary component
    const primaryComponent = generatedCodeV2.components[0]; 
    const primaryKebabName = this.toKebabCase(primaryComponent.componentName);
    
    console.log('---MAIN.TS DEBUG START---');
    // Create list of all component import statements with correct paths
    const componentImports = generatedCodeV2.components.map(comp => {
      const kebabName = this.toKebabCase(comp.componentName);
      // Import directly from root without subdirectories
      const importLine = `import { ${comp.componentName} } from './${kebabName}.component';`;
      console.log(`Generated import: ${importLine}`);
      return importLine;
    }).join('\n');
    
    // Create the imports array for AppComponent
    const importsArray = generatedCodeV2.components.map(comp => comp.componentName).join(', ');
    console.log(`Imports array: [${importsArray}]`);
    
    const mainTsContent = `import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideRouter } from '@angular/router';
${componentImports}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ${importsArray}],
  template: \`<app-${primaryKebabName}></app-${primaryKebabName}>\`
})
export class AppComponent {}

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter([])
  ]
}).catch(err => console.error(err));`;

    console.log('Main.ts content created:');
    console.log(mainTsContent.substring(0, 300) + '...');
    console.log('---MAIN.TS DEBUG END---');
    
    files['main.ts'] = mainTsContent;

    // Add index.html with Material theme and fonts
    files['index.html'] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Angular App</title>
    <base href="/">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@angular/material@19.0.0/prebuilt-themes/indigo-pink.css" rel="stylesheet">
  </head>
  <body class="mat-typography">
    <app-root></app-root>
  </body>
</html>`;

    // Add styles.css with utility classes often used in the generated components
    files['styles.css'] = `@import 'https://cdn.jsdelivr.net/npm/@angular/material@19.0.0/prebuilt-themes/indigo-pink.css';

html, body { height: 100%; }
body { 
  margin: 0; 
  font-family: Roboto, "Helvetica Neue", sans-serif; 
  padding: 0;
}

/* Utility classes to support Material styling and common patterns */
.bg-zinc-800, .bg-zinc-900 { background-color: #18181b; color: white; }
.bg-zinc-700 { background-color: #3f3f46; color: white; }
.h-screen { height: 100vh; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-1 { flex: 1; }
.flex-shrink-0 { flex-shrink: 0; }
.flex-grow { flex-grow: 1; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.overflow-hidden { overflow: hidden; }
.overflow-y-auto { overflow-y: auto; }
.w-64 { width: 16rem; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.p-4 { padding: 1rem; }
.m-4 { margin: 1rem; }
.gap-4 { gap: 1rem; }
.sticky { position: sticky; }
.top-0 { top: 0; }
.z-10 { z-index: 10; }

/* Additional styling for Material components */
.mat-mdc-card {
  --mdc-elevated-card-container-color: transparent;
}`;

    // Update angular.json to reference the correct main.ts path
    files['angular.json'] = `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "demo": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist",
            "index": "index.html",
            "main": "main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.json",
            "inlineStyleLanguage": "scss",
            "assets": [],
            "styles": ["styles.css"],
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
  },
  "defaultProject": "demo"
}`;

    // Minimal tsconfig.json for Angular 19
    files['tsconfig.json'] = `{
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
    ],
    "useDefineForClassFields": false
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}`;

    // Log all files in the project for easier debugging
    console.log('---PROJECT FILES LIST START---');
    console.log("All files in StackBlitz project:", Object.keys(files));
    
    // Check if all component files are included
    const componentFiles = Object.keys(files).filter(file => file.includes('component'));
    console.log(`Component files count: ${componentFiles.length}`);
    console.log(`Component files: ${componentFiles.join(', ')}`);
    console.log('---PROJECT FILES LIST END---');

    return {
      title: 'Generated Angular App',
      description: 'Angular Components from Screenshot',
      template: 'node',
      files: files
    };
  }

  /**
   * Generate component code by combining all the individual components into a single file
   */
  private generateCombinedComponentCode(components: GeneratedComponent[]): string {
    // Get primary component (first in array)
    const primaryComponent = components[0];
    const primaryKebabName = this.toKebabCase(primaryComponent.componentName);
    
    // Create imports section
    const imports = this.generateRequiredImports(components);
        
    // Create component classes section - each component as a separate class
    const componentClasses = components.map((comp, index) => {
      // Process the component to ensure it's ready for inline use
      const template = comp.html.replace(/`/g, '\\`');
      const styles = comp.scss?.replace(/`/g, '\\`') || '';
      const kebabName = this.toKebabCase(comp.componentName);
      
      // Create standalone component with inline template and styles
      return `
@Component({
  selector: 'app-${kebabName}',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatToolbarModule, MatIconModule, MatInputModule, MatListModule, MatSidenavModule, NgClass, NgFor, NgIf],
  template: \`${template}\`,
  styles: [\`${styles}\`]
})
export class ${comp.componentName} {
  ${this.extractComponentLogic(comp.typescript)}
}`;
    }).join('\n\n');
    
    // Create the main app component that contains the primary component
    const appComponent = `
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [${components.map(c => c.componentName).join(', ')}],
  template: \`<app-${primaryKebabName}></app-${primaryKebabName}>\`,
  styles: []
})
export class AppComponent { }`;
    
    // Combine everything into a single file
    return `${imports}

${componentClasses}

${appComponent}`;
  }

  /**
   * Extract the component class logic from the TypeScript content
   */
  private extractComponentLogic(typescript: string): string {
    // Try to extract the class body
    const classMatch = typescript.match(/export\s+class\s+\w+\s*{([^}]*)}/s);
    if (classMatch && classMatch[1]) {
      return classMatch[1].trim();
    }
    
    // Fallback - return empty body
    return '';
  }

  /**
   * Generate all required imports for the components
   */
  private generateRequiredImports(components: GeneratedComponent[]): string {
    // Essential Angular imports
    let imports = `import { Component } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';`;
    
    // Add Material imports based on usage in components
    const materialModules = new Set<string>();
    
    components.forEach(comp => {
      // Check for common Material module usage
      if (comp.typescript.includes('MatButton') || comp.html.includes('mat-button')) {
        materialModules.add('MatButtonModule');
      }
      if (comp.typescript.includes('MatCard') || comp.html.includes('mat-card')) {
        materialModules.add('MatCardModule');
      }
      if (comp.typescript.includes('MatToolbar') || comp.html.includes('mat-toolbar')) {
        materialModules.add('MatToolbarModule');
      }
      if (comp.typescript.includes('MatIcon') || comp.html.includes('mat-icon')) {
        materialModules.add('MatIconModule');
      }
      if (comp.typescript.includes('MatInput') || comp.html.includes('mat-form-field')) {
        materialModules.add('MatInputModule');
      }
      if (comp.typescript.includes('MatList') || comp.html.includes('mat-list')) {
        materialModules.add('MatListModule');
      }
      if (comp.typescript.includes('MatSidenav') || comp.html.includes('mat-sidenav')) {
        materialModules.add('MatSidenavModule');
      }
    });
    
    // Add detected Material imports
    if (materialModules.size > 0) {
      const materialImports = Array.from(materialModules)
        .map(module => `import { ${module} } from '@angular/material/${module.replace('Module', '').toLowerCase()}';`)
        .join('\n');
      
      imports += '\n\n// Angular Material imports\n' + materialImports;
    }
    
    return imports;
  }

  /**
   * Verify that all components are properly included in the StackBlitz project
   * This is a testing/debugging method to ensure components aren't missed
   */
  private verifyComponentsIncluded(project: { files: Record<string, string> }, components: GeneratedComponent[]): void {
    console.log('=== VERIFICATION RESULTS ===');
    
    // Get file keys
    const fileKeys = Object.keys(project.files);
    console.log(`Total files in project: ${fileKeys.length}`);
    
    // Verify each component has its files included
    let allIncluded = true;
    
    components.forEach(component => {
      const kebabName = this.toKebabCase(component.componentName);
      const tsFile = `${kebabName}.component.ts`;
      const htmlFile = `${kebabName}.component.html`;
      const scssFile = `${kebabName}.component.scss`;
      
      const hasTs = fileKeys.includes(tsFile);
      const hasHtml = fileKeys.includes(htmlFile);
      const hasScss = fileKeys.includes(scssFile);
      
      console.log(`Component: ${component.componentName}`);
      console.log(`  TS File: ${hasTs ? '✅' : '❌'}`);
      console.log(`  HTML File: ${hasHtml ? '✅' : '❌'}`);
      console.log(`  SCSS File: ${hasScss ? '✅' : '❌'}`);
      
      if (!hasTs || !hasHtml || !hasScss) {
        allIncluded = false;
      }
    });
    
    console.log(`All components properly included: ${allIncluded ? '✅' : '❌'}`);
    console.log('=========================');
  }

  /**
   * Convert PascalCase to kebab-case
   */
  private toKebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Prepare a StackBlitz project with the generated component code (legacy format)
   */
  prepareStackBlitzProject(generatedCode: GeneratedCode): Project {
    // Create a GeneratedCodeV2 object from the legacy format
    const generatedCodeV2: GeneratedCodeV2 = {
      components: [
        {
          componentName: this.toPascalCase(generatedCode.component_name),
          typescript: generatedCode.component_ts,
          html: generatedCode.component_html,
          scss: generatedCode.component_scss
        }
      ]
    };
    
    // Reuse the V2 method for consistency
    return this.prepareStackBlitzProjectV2(generatedCodeV2);
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

  /**
   * Prepare CodeSandbox parameters for the define API with new multi-component generated code format
   */
  prepareCodeSandboxParameters(generatedCodeV2: GeneratedCodeV2 | GeneratedCode): string {
    console.log('Preparing CodeSandbox parameters...');
    
    // Create files object for CodeSandbox
    const files: Record<string, { content: string }> = {};
    
    try {
      // Process as V2 format if it's a GeneratedCodeV2 object
      if ('components' in generatedCodeV2) {
        console.log(`Processing ${generatedCodeV2.components.length} components in V2 format`);
        generatedCodeV2.components.forEach(c => console.log(` - ${c.componentName}`));
        
        // Process each component
        generatedCodeV2.components.forEach(component => {
          const kebabName = this.toKebabCase(component.componentName);
          
          // Add component TypeScript file
          files[`src/app/${kebabName}/${kebabName}.component.ts`] = {
            content: component.typescript
          };
          
          // Add component HTML file
          files[`src/app/${kebabName}/${kebabName}.component.html`] = {
            content: component.html
          };
          
          // Add component SCSS file
          files[`src/app/${kebabName}/${kebabName}.component.scss`] = {
            content: component.scss
          };
        });
        
        // Add main component to app.component.ts
        const mainComponent = generatedCodeV2.components[0];
        const mainComponentSelector = `app-${this.toKebabCase(mainComponent.componentName)}`;
        
        // Add app-routing.module.ts
        files['src/app/app-routing.module.ts'] = {
          content: this.generateAppRoutingModule(generatedCodeV2.components)
        };
        
        // Add app.component.ts with references to all components
        files['src/app/app.component.ts'] = {
          content: this.generateAppComponent(generatedCodeV2.components)
        };
        
        // Add app.component.html that includes the main component
        files['src/app/app.component.html'] = {
          content: `<${mainComponentSelector}></${mainComponentSelector}>`
        };
        
      } else {
        // Process as legacy format (GeneratedCode)
        console.log('Processing legacy format component');
        const legacyCode = generatedCodeV2 as GeneratedCode;
        const kebabName = this.toKebabCase(legacyCode.component_name);
        
        // Add component TypeScript file
        files[`src/app/${kebabName}/${kebabName}.component.ts`] = {
          content: legacyCode.component_ts
        };
        
        // Add component HTML file
        files[`src/app/${kebabName}/${kebabName}.component.html`] = {
          content: legacyCode.component_html
        };
        
        // Add component SCSS file
        files[`src/app/${kebabName}/${kebabName}.component.scss`] = {
          content: legacyCode.component_scss
        };
        
        // Add app.component.ts with references to the component
        files['src/app/app.component.ts'] = {
          content: this.generateAppComponentLegacy(legacyCode)
        };
        
        // Add app.component.html that includes the component
        files['src/app/app.component.html'] = {
          content: `<app-${kebabName}></app-${kebabName}>`
        };
      }
      
      // Add common boilerplate files
      this.addBoilerplateFiles(files);
      
      // Log the files being included
      console.log('Project files:', Object.keys(files));
      
      // Create parameters object with files
      const parameters = {
        files
      };
      
      // Compress and encode parameters for CodeSandbox define API
      try {
        const parametersStr = JSON.stringify(parameters);
        console.log('Parameters JSON string length:', parametersStr.length);
        
        // Use LZString compression with error handling
        const compressedParams = LZString.compressToBase64(parametersStr);
        console.log('Compressed parameters length:', compressedParams.length);
        
        if (!compressedParams) {
          throw new Error('Compression failed');
        }
        
        // Properly encode for URL
        return encodeURIComponent(compressedParams);
      } catch (error) {
        console.error('Error during compression:', error);
        // Fallback to simpler encoding if compression fails
        const simpleParams = JSON.stringify(parameters);
        return encodeURIComponent(btoa(simpleParams));
      }
    } catch (error) {
      console.error('Error preparing CodeSandbox parameters:', error);
      throw error;
    }
  }

  /**
   * Add common Angular boilerplate files to the files object
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
   * Generate app-routing.module.ts content for a set of components
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
   * Generate app.component.ts content for a set of components
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
   * Generate app.component.ts content for a legacy component
   */
  private generateAppComponentLegacy(legacyCode: GeneratedCode): string {
    const kebabName = this.toKebabCase(legacyCode.component_name);
    const componentName = legacyCode.component_name;
    
    return `import { Component } from '@angular/core';
import { ${componentName} } from './${kebabName}/${kebabName}.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [${componentName}],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular Preview';
}
`;
  }
}