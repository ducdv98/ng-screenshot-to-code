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
import { GeneratedCode } from '../../models/generated-code.model';

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
    if (changes['generatedCode'] && this.generatedCode) {
      this.retryCount = 0;
      this.errorMessage = '';
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
      
      if (this.generatedCode) {
        this.updateDirectPreview();
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
   * Update preview using direct HTML
   */
  private updateDirectPreview(): void {
    if (!this.generatedCode) return;
    
    try {
      // Use the preview service to generate HTML for the preview
      const previewHtml = this.previewService.generatePreviewHtml(this.generatedCode);
      
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
    } else {
      // Show error if all retries failed
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
   * Open the sandbox in a new window
   */
  openFullscreen(): void {
    if (this.codeSandboxUrl) {
      window.open(this.codeSandboxUrl, '_blank');
    } else {
      console.error('No CodeSandbox URL available');
      // If no external URL is available, try to create one
      try {
        if (this.generatedCode) {
          const params = this.previewService.prepareCodeSandboxParameters(this.generatedCode);
          const url = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${params}`;
          window.open(url, '_blank');
        }
      } catch (error) {
        console.error('Could not create CodeSandbox URL:', error);
        this.errorMessage = 'Could not open fullscreen preview';
      }
    }
  }
  
  /**
   * Display error message in console and UI
   */
  private showError(message: string): void {
    console.error(message);
    this.previewError = true;
    this.errorMessage = message;
    this.isPreviewLoading = false;
  }
} 