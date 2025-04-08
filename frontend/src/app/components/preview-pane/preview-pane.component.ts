import { Component, Input, OnChanges, SecurityContext, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PreviewService } from '../../services/preview.service';
import { GeneratedCode } from '../../models/generated-code.model';

@Component({
  selector: 'app-preview-pane',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './preview-pane.component.html',
  styleUrls: ['./preview-pane.component.scss']
})
export class PreviewPaneComponent implements OnChanges {
  @Input() generatedCode: GeneratedCode | null = null;
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;
  
  previewSrc: SafeHtml | null = null;
  
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
    
    // Generate HTML content for the iframe
    const previewHtml = this.previewService.generatePreviewHtml(this.generatedCode);
    
    // Sanitize the HTML (important for security)
    // In a production app you might need to modify Angular's security context
    this.previewSrc = this.sanitizer.bypassSecurityTrustHtml(previewHtml);
    
    // If we have a reference to the iframe, update its content
    if (this.previewFrame?.nativeElement) {
      const doc = this.previewFrame.nativeElement.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
      }
    }
  }
  
  refreshPreview(): void {
    this.updatePreview();
  }
  
  openFullscreen(): void {
    if (!this.previewFrame?.nativeElement) return;
    
    const iframe = this.previewFrame.nativeElement;
    
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    }
  }
} 