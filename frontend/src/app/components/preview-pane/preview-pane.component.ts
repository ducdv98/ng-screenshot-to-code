import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { PreviewService } from '../../services/preview.service';
import { GeneratedCode } from '../../models/generated-code.model';
import sdk, { Project, VM } from '@stackblitz/sdk';

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
  @ViewChild('stackblitzContainer') stackblitzContainer!: ElementRef<HTMLDivElement>;
  
  // Property to hold sanitized HTML for iframe srcdoc
  previewSrcDoc: SafeHtml | null = null;
  
  // Property to track if preview has been initialized 
  previewInitialized = false;
  
  // Error tracking
  previewError = false;

  // StackBlitz SDK mode toggle
  useStackBlitzSdk = true;
  
  // Loading state for StackBlitz SDK
  isStackBlitzLoading = false;
  
  // Track the StackBlitz VM instance (if available)
  private stackBlitzVm: VM | null = null;
  
  // URL for external StackBlitz project (used for fullscreen)
  private stackBlitzProjectUrl: string = '';
  
  constructor(
    private sanitizer: DomSanitizer,
    private previewService: PreviewService
  ) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['generatedCode'] && this.generatedCode) {
      this.updatePreview();
    }
  }

  ngOnDestroy(): void {
    // Clean up any StackBlitz resources if needed
    this.stackBlitzVm = null;
    
    // Clear container
    const container = document.getElementById('stackblitz-preview-container');
    if (container) {
      container.innerHTML = '';
    }
  }
  
  private updatePreview(): void {
    if (!this.generatedCode) return;
    
    try {
      // Reset error state
      this.previewError = false;
      
      if (this.useStackBlitzSdk) {
        this.updateStackBlitzPreview();
      } else {
        this.updateIframePreview();
      }
      
      // Mark preview as initialized
      this.previewInitialized = true;
    } catch (error) {
      console.error('Error updating preview:', error);
      this.previewError = true;
      this.isStackBlitzLoading = false;
    }
  }

  /**
   * Update the preview using StackBlitz SDK
   */
  private updateStackBlitzPreview(): void {
    if (!this.generatedCode) return;

    // Set loading state to true
    this.isStackBlitzLoading = true;
    
    // Clear any existing content in the container
    const container = document.getElementById('stackblitz-preview-container');
    if (container) {
      container.innerHTML = '';
    }
    
    setTimeout(() => {
      try {
        // Create the project object using the service
        const project: Project = this.previewService.prepareStackBlitzProject(this.generatedCode!);
        
        // Generate a unique project ID to avoid caching issues
        const projectId = `generated-component-${Date.now()}`;
        
        // Use the simpler openProject method if on smaller screens
        if (window.innerWidth < 768) {
          // On smaller screens, just open in a new tab
          sdk.openProject(project, { 
            newWindow: true,
            openFile: `src/app/${this.generatedCode!.component_name}/${this.generatedCode!.component_name}.component.html` 
          });
          
          // Set loading state to false since we're navigating away
          this.isStackBlitzLoading = false;
        } else {
          // On larger screens, embed the project
          sdk.embedProject('stackblitz-preview-container', project, {
            height: 500,
            hideExplorer: true,
            hideNavigation: false,
            forceEmbedLayout: true,
            openFile: `src/app/${this.generatedCode!.component_name}/${this.generatedCode!.component_name}.component.html`,
            view: 'preview',
            clickToLoad: false,
            terminalHeight: 40 // Add terminal height to allow package installation visibility
          })
            .then((vm: VM) => {
              this.stackBlitzVm = vm;
              
              // Try to create a link for fullscreen view
              try {
                const componentName = this.generatedCode!.component_name;
                this.stackBlitzProjectUrl = `https://stackblitz.com/edit?file=src/app/${componentName}/${componentName}.component.html`;
              } catch (error) {
                console.error('Failed to create project URL:', error);
              }
              
              // Set a timeout to hide the loading indicator
              // We use a longer timeout for initial load to ensure Angular has time to bootstrap
              setTimeout(() => {
                this.isStackBlitzLoading = false;
              }, 12000); // 12 seconds should be enough for most Angular apps to bootstrap
            })
            .catch((error: Error) => {
              console.error('StackBlitz SDK error:', error);
              this.previewError = true;
              this.isStackBlitzLoading = false;
            });
        }
      } catch (error) {
        console.error('Error creating StackBlitz project:', error);
        this.previewError = true;
        this.isStackBlitzLoading = false;
      }
    }, 0);
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
          
          // Give a small delay for resources to load
          setTimeout(() => {
            try {
              // Force Material Icons to render correctly if they're present
              const icons = doc.querySelectorAll('mat-icon');
              if (icons.length > 0) {
                Array.from(icons).forEach(icon => {
                  const iconName = icon.textContent?.trim() || '';
                  if (iconName) {
                    icon.innerHTML = iconName;
                    icon.classList.add('material-icons');
                  }
                });
              }
            } catch (iconError) {
              console.warn('Icon processing error:', iconError);
            }
          }, 100);
        }
      } catch (innerError) {
        console.warn('Fallback iframe update failed:', innerError);
        // We already have srcdoc as backup, so no need to set error state
      }
    }
  }

  /**
   * Toggle preview mode between StackBlitz SDK and iframe
   */
  togglePreviewMode(): void {
    this.useStackBlitzSdk = !this.useStackBlitzSdk;
    if (this.generatedCode) {
      this.updatePreview();
    }
  }
  
  refreshPreview(): void {
    this.updatePreview();
  }
  
  openFullscreen(): void {
    if (this.useStackBlitzSdk) {
      // Open StackBlitz project in a new window
      if (this.stackBlitzProjectUrl) {
        window.open(this.stackBlitzProjectUrl, '_blank');
      } else {
        // Fallback if we don't have a stored URL
        window.open(`https://stackblitz.com/edit?file=src/app/${this.generatedCode!.component_name}/${this.generatedCode!.component_name}.component.html`, '_blank');
      }
    } else if (!this.useStackBlitzSdk && this.previewFrame?.nativeElement) {
      const iframe = this.previewFrame.nativeElement;
      
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
          .catch(err => console.error('Fullscreen request failed:', err));
      }
    }
  }
} 