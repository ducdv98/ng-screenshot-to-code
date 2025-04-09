import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { PreviewService } from '../../services/preview.service';
import { GeneratedCode, GeneratedCodeV2 } from '../../models/generated-code.model';

@Component({
  selector: 'app-preview-pane',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './preview-pane.component.html',
  styleUrls: ['./preview-pane.component.scss']
})
export class PreviewPaneComponent implements OnChanges, OnDestroy {
  @Input() generatedCode: GeneratedCode | null = null;
  @Input() generatedCodeV2: GeneratedCodeV2 | null = null;
  @Input() isUsingV2Format = false;
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;
  @ViewChild('codeSandboxContainer') codeSandboxContainer!: ElementRef<HTMLIFrameElement>;
  
  // Property to hold sanitized HTML for iframe srcdoc
  previewSrcDoc: SafeHtml | null = null;
  
  // Property for CodeSandbox iframe URL
  sandboxUrl: SafeResourceUrl;
  
  // Property to track if preview has been initialized 
  previewInitialized = false;
  
  // Error tracking
  previewError = false;
  errorMessage = ''; // Added to store specific error messages

  // Always use CodeSandbox for enhanced version
  useInteractivePreview = true;
  
  // Loading state for CodeSandbox
  isPreviewLoading = false;
  
  // URL for external CodeSandbox project (used for fullscreen)
  private codeSandboxUrl: string | null = null;
  
  // Maximum number of retries for CodeSandbox
  private maxRetries = 2;
  private retryCount = 0;

  constructor(
    private sanitizer: DomSanitizer,
    private previewService: PreviewService
  ) {
    this.sandboxUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // Reset retry count when new code is generated
    if ((changes['generatedCodeV2'] && this.generatedCodeV2) || 
        (changes['generatedCode'] && this.generatedCode)) {
      this.retryCount = 0;
      this.errorMessage = '';
    }
    
    // Check for V2 format first
    if (changes['generatedCodeV2'] && this.generatedCodeV2) {
      this.isUsingV2Format = true;
      this.updatePreview();
    } 
    // Fall back to legacy format if no V2 but V1 changed
    else if (changes['generatedCode'] && this.generatedCode) {
      this.isUsingV2Format = false;
      this.updatePreview();
    }
  }

  ngOnDestroy(): void {
    // Clean up resources if needed
    this.codeSandboxUrl = null;
  }
  
  private updatePreview(): void {
    try {
      // Set loading state
      this.isPreviewLoading = true;
      
      // Reset error state
      this.previewError = false;
      
      // Both formats now use the same direct preview approach
      if (this.isUsingV2Format && this.generatedCodeV2) {
        this.updateDirectPreview();
      } else if (this.generatedCode) {
        this.updateIframePreview();
      } else {
        throw new Error('No generated code available');
      }
      
      // Mark preview as initialized
      this.previewInitialized = true;
    } catch (error) {
      console.error('Error updating preview:', error);
      this.previewError = true;
      this.errorMessage = error instanceof Error ? error.message : 'Unknown error updating preview';
      this.isPreviewLoading = false;
    }
  }
  
  /**
   * Update preview for V2 format using direct HTML
   */
  private updateDirectPreview(): void {
    if (!this.generatedCodeV2) return;
    
    try {
      // Get main component
      const mainComponent = this.generatedCodeV2.components[0];
      
      // Generate HTML preview directly
      const previewHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Component Preview - ${mainComponent.componentName}</title>
          
          <!-- Material Design Icons -->
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
          
          <!-- Google Fonts - Roboto -->
          <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" rel="stylesheet">
          
          <!-- Tailwind CSS -->
          <script src="https://cdn.tailwindcss.com"></script>
          
          <!-- Angular Material Theme -->
          <link href="https://cdn.jsdelivr.net/npm/@angular/material@19.2.0/prebuilt-themes/indigo-pink.css" rel="stylesheet">
          
          <style>
            body { 
              margin: 0; 
              font-family: Roboto, "Helvetica Neue", sans-serif; 
              padding: 16px;
              color: rgba(0, 0, 0, 0.87);
              background: #fafafa;
            }
            ${mainComponent.scss}
          </style>
        </head>
        <body class="mat-typography">
          <div id="component-preview" class="mat-app-background">
            ${mainComponent.html}
          </div>
        </body>
        </html>
      `;
      
      // Sanitize the HTML and use it for the iframe
      this.previewSrcDoc = this.sanitizer.bypassSecurityTrustHtml(previewHtml);
      
      // Clear loading state after a short delay
      setTimeout(() => {
        this.isPreviewLoading = false;
      }, 500);
    } catch (error) {
      console.error('Error creating direct preview:', error);
      this.previewError = true;
      this.errorMessage = error instanceof Error ? error.message : 'Error creating preview';
      this.isPreviewLoading = false;
    }
  }
  
  /**
   * Handle CodeSandbox errors with retry logic and fallback
   */
  private handleCodeSandboxError(errorMessage: string): void {
    console.error('CodeSandbox error:', errorMessage);
    
    if (this.retryCount < this.maxRetries) {
      // Retry with direct preview approach
      console.log(`Retrying preview (${this.retryCount + 1}/${this.maxRetries})`);
      this.retryCount++;
      setTimeout(() => this.updatePreview(), 1000);
    } else if (!this.isUsingV2Format && this.generatedCode) {
      // Fall back to simple iframe preview for legacy format
      console.log('Falling back to simple iframe preview');
      this.useInteractivePreview = false;
      this.updateIframePreview();
    } else {
      // Show error if all retries failed and no fallback
      this.previewError = true;
      this.errorMessage = `Failed to load preview: ${errorMessage}`;
      this.isPreviewLoading = false;
    }
  }
  
  /**
   * Convert PascalCase to kebab-case (used for component file paths)
   */
  private toKebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Update the preview using iframe srcdoc (legacy approach)
   */
  private updateIframePreview(): void {
    if (!this.generatedCode) return;
    
    // Generate HTML content for the iframe
    const previewHtml = this.previewService.generatePreviewHtml(this.generatedCode);
    
    // Sanitize the HTML and bind to srcdoc
    this.previewSrcDoc = this.sanitizer.bypassSecurityTrustHtml(previewHtml);
    
    // If direct DOM manipulation is needed (fallback)
    if (this.previewFrame?.nativeElement) {
      try {
        const iframe = this.previewFrame.nativeElement;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (doc) {
          doc.open();
          doc.write(previewHtml);
          doc.close();
          
          // Clear any error state
          this.previewError = false;
          this.errorMessage = '';
          this.isPreviewLoading = false;
        }
      } catch (error) {
        console.error('Error updating iframe preview:', error);
        this.previewError = true;
        this.errorMessage = error instanceof Error ? error.message : 'Error updating iframe preview';
        this.isPreviewLoading = false;
      }
    }
  }
  
  /**
   * Toggle between enhanced and simple preview modes
   */
  togglePreviewMode(): void {
    console.log(`Toggling preview mode from ${this.useInteractivePreview ? 'enhanced' : 'simple'} to ${!this.useInteractivePreview ? 'enhanced' : 'simple'}`);
    this.useInteractivePreview = !this.useInteractivePreview;
    
    // Reset error states
    this.previewError = false;
    this.errorMessage = '';
    
    // With our simplified approach, we just need to refresh the iframe preview
    this.updatePreview();
  }
  
  /**
   * Refresh the preview
   */
  refreshPreview(): void {
    console.log('Refreshing preview...');
    // Reset error and loading states
    this.previewError = false;
    this.errorMessage = '';
    this.retryCount = 0;
    
    // Clear iframe src if using CodeSandbox
    if (this.useInteractivePreview && this.codeSandboxContainer?.nativeElement) {
      this.codeSandboxContainer.nativeElement.src = 'about:blank';
    }
    
    // Short delay to ensure DOM updates before refreshing
    setTimeout(() => {
      this.updatePreview();
    }, 100);
  }
  
  /**
   * Open the preview in fullscreen/new tab
   */
  openFullscreen(): void {
    console.log('Opening fullscreen preview...');
    
    try {
      let previewHtml: string;
      
      if (this.isUsingV2Format && this.generatedCodeV2) {
        // For V2 format, use the first component
        const mainComponent = this.generatedCodeV2.components[0];
        
        // Generate a standalone HTML page
        previewHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Component Preview - ${mainComponent.componentName}</title>
            
            <!-- Material Design Icons -->
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            
            <!-- Google Fonts - Roboto -->
            <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" rel="stylesheet">
            
            <!-- Tailwind CSS -->
            <script src="https://cdn.tailwindcss.com"></script>
            
            <!-- Angular Material Theme -->
            <link href="https://cdn.jsdelivr.net/npm/@angular/material@19.2.0/prebuilt-themes/indigo-pink.css" rel="stylesheet">
            
            <style>
              body { 
                margin: 0; 
                font-family: Roboto, "Helvetica Neue", sans-serif; 
                padding: 16px;
                color: rgba(0, 0, 0, 0.87);
                background: #fafafa;
              }
              ${mainComponent.scss}
            </style>
          </head>
          <body class="mat-typography">
            <div id="component-preview" class="mat-app-background">
              ${mainComponent.html}
            </div>
          </body>
          </html>
        `;
      } else if (this.generatedCode) {
        // For legacy format, use the generatePreviewHtml method
        previewHtml = this.previewService.generatePreviewHtml(this.generatedCode);
      } else {
        throw new Error('No preview content available');
      }
      
      // Create a data URI from the HTML
      const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(previewHtml)}`;
      
      // Open in a new tab
      window.open(dataUri, '_blank');
    } catch (error) {
      console.error('Error opening fullscreen preview:', error);
      alert('Could not open fullscreen preview. Please try again.');
    }
  }
} 