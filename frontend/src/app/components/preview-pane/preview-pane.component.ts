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

  // Always use CodeSandbox for enhanced version
  useInteractivePreview = true;
  
  // Loading state for CodeSandbox
  isPreviewLoading = false;
  
  // URL for external CodeSandbox project (used for fullscreen)
  private codeSandboxUrl: string | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private previewService: PreviewService
  ) {
    this.sandboxUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
  }
  
  ngOnChanges(changes: SimpleChanges): void {
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
      // Reset error state
      this.previewError = false;
      
      // For V2 format, always use CodeSandbox
      if (this.isUsingV2Format) {
        this.useInteractivePreview = true;
        this.updateCodeSandboxPreview();
      } else {
        // Legacy format can toggle between iframe and CodeSandbox
        if (this.useInteractivePreview) {
          this.updateCodeSandboxPreview();
        } else {
          this.updateIframePreview();
        }
      }
      
      // Mark preview as initialized
      this.previewInitialized = true;
    } catch (error) {
      console.error('Error updating preview:', error);
      this.previewError = true;
      this.isPreviewLoading = false;
    }
  }

  /**
   * Update the preview using CodeSandbox iframe embedding
   */
  private updateCodeSandboxPreview(): void {
    // Set loading state to true
    this.isPreviewLoading = true;
    
    try {
      console.log('Preparing CodeSandbox project...');
      
      let parameters: string;
      
      if (this.isUsingV2Format && this.generatedCodeV2) {
        console.log(`Using V2 format with ${this.generatedCodeV2.components.length} components`);
        
        // Log component names for debugging
        this.generatedCodeV2.components.forEach((component, index) => {
          console.log(`Component ${index+1}: ${component.componentName}`);
        });
        
        // Use V2 format - enhanced multi-component support
        parameters = this.previewService.prepareCodeSandboxParameters(this.generatedCodeV2);
      } else if (this.generatedCode) {
        console.log('Using legacy format');
        // Use legacy format
        parameters = this.previewService.prepareCodeSandboxParameters(this.generatedCode);
      } else {
        throw new Error('No generated code available');
      }
      
      console.log('CodeSandbox parameters prepared, constructing URL...');
      
      // Construct the CodeSandbox URL with parameters and options
      const baseUrl = 'https://codesandbox.io/api/v1/sandboxes/define';
      const options = 'view=preview&editorsize=0&hidenavigation=1&theme=light&fontsize=14';
      const fullUrl = `${baseUrl}?${parameters}&${options}`;
      console.log('CodeSandbox URL prepared:', fullUrl);
      
      // Save the URL for opening in full screen
      this.codeSandboxUrl = fullUrl;
      
      // Sanitize the URL for the iframe
      this.sandboxUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
      
      // Set a timeout to hide the loading indicator
      setTimeout(() => {
        this.isPreviewLoading = false;
      }, 5000);
    } catch (error) {
      console.error('Error creating CodeSandbox project:', error);
      this.previewError = true;
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
        }
      } catch (error) {
        console.error('Error updating iframe preview:', error);
        this.previewError = true;
      }
    }
  }
  
  /**
   * Toggle between interactive and static preview modes
   */
  togglePreviewMode(): void {
    this.useInteractivePreview = !this.useInteractivePreview;
    console.log(`Preview mode set to: ${this.useInteractivePreview ? 'Interactive' : 'Static'}`);
    
    // Force an update of the preview
    this.updatePreview();
  }
  
  /**
   * Refresh the preview
   */
  refreshPreview(): void {
    this.updatePreview();
  }
  
  /**
   * Open the preview in a new window
   */
  openFullscreen(): void {
    if (this.codeSandboxUrl) {
      window.open(this.codeSandboxUrl, '_blank', 'noopener,noreferrer');
    }
  }
} 