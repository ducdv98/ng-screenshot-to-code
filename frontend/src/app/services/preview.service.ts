import { Injectable } from '@angular/core';
import { GeneratedCode } from '../models/generated-code.model';

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
              fallbackLink.href = 'https://cdn.jsdelivr.net/npm/@angular/material@17.0.0/prebuilt-themes/indigo-pink.css';
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
          });
        </script>
      </body>
      </html>
    `;
    
    return previewHtml;
  }
} 