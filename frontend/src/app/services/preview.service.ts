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
    // Create a basic HTML structure with the component HTML and styles
    // Include CDN links for Tailwind CSS and Angular Material
    
    // Tailwind include is for preview only, actual component would use the project's bundled Tailwind
    const previewHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Component Preview</title>
        
        <!-- Material Design Icons -->
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        
        <!-- Google Fonts - Roboto -->
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap" rel="stylesheet">
        
        <!-- Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        
        <!-- Angular Material Theme (Deeppurple-Amber) -->
        <link href="https://cdn.jsdelivr.net/npm/@angular/material@17.0.0/prebuilt-themes/deeppurple-amber.css" rel="stylesheet">
        
        <style>
          body { 
            margin: 0; 
            font-family: Roboto, "Helvetica Neue", sans-serif; 
            padding: 16px;
          }
          
          /* Component specific styles */
          ${generatedCode.component_scss}
        </style>
      </head>
      <body>
        <div id="component-preview">
          ${generatedCode.component_html}
        </div>
      </body>
      </html>
    `;
    
    return previewHtml;
  }
} 