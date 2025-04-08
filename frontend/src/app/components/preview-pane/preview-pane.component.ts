import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatTooltipModule
  ],
  templateUrl: './preview-pane.component.html',
  styleUrls: ['./preview-pane.component.scss']
})
export class PreviewPaneComponent implements OnChanges {
  @Input() generatedCode: GeneratedCode | null = null;
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;
  
  // Property to hold sanitized HTML for iframe srcdoc
  previewSrcDoc: SafeHtml | null = null;
  
  // Property to track if preview has been initialized 
  previewInitialized = false;
  
  // Error tracking
  previewError = false;
  
  constructor(
    private sanitizer: DomSanitizer,
    private previewService: PreviewService
  ) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['generatedCode'] && this.generatedCode) {
      this.updatePreview();
    }
  }
  
  private updatePreview(): void {
    if (!this.generatedCode) return;
    
    try {
      // Reset error state
      this.previewError = false;
      
      // Generate HTML content for the iframe
      const previewHtml = this.previewService.generatePreviewHtml(this.generatedCode);
      
      // Sanitize the HTML and bind to srcdoc
      this.previewSrcDoc = this.sanitizer.bypassSecurityTrustHtml(previewHtml);
      
      // Mark preview as initialized
      this.previewInitialized = true;
      
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
    } catch (error) {
      console.error('Error updating preview:', error);
      this.previewError = true;
    }
  }
  
  refreshPreview(): void {
    this.updatePreview();
  }
  
  openFullscreen(): void {
    if (!this.previewFrame?.nativeElement) return;
    
    const iframe = this.previewFrame.nativeElement;
    
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen()
        .catch(err => console.error('Fullscreen request failed:', err));
    }
  }
} 