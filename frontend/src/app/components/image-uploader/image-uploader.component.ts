import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
// @ts-ignore
import ColorThief from 'color-thief-browser';

interface ImageUploadData {
  file: File;
  colors?: {
    dominant?: string;
    palette?: string[];
  };
}

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule
  ],
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent {
  @Output() fileSelected = new EventEmitter<ImageUploadData>();
  @ViewChild('previewImage') previewImageRef?: ElementRef<HTMLImageElement>;
  
  isDragging = false;
  uploadProgress = 0;
  isUploading = false;
  selectedFileName = '';
  previewUrl: string | null = null;
  dominantColor: string | null = null;
  colorPalette: string[] = [];
  
  private colorThief = new ColorThief();
  private currentFile: File | null = null;
  
  // Add keyboard support for the drop zone
  @HostListener('keydown.space', ['$event'])
  @HostListener('keydown.enter', ['$event'])
  onKeyboardTrigger(event: KeyboardEvent): void {
    // Only trigger if the event is on the card element itself
    if ((event.target as HTMLElement).classList.contains('dropzone-keyboard')) {
      event.preventDefault();
      this.triggerFileInput();
    }
  }
  
  // Convert RGB array to hex color string
  private rgbToHex(rgb: number[]): string {
    return '#' + rgb.map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
  
  /**
   * Resets the uploader state, clearing the current image and extracted colors
   */
  reset(): void {
    this.currentFile = null;
    this.previewUrl = null;
    this.selectedFileName = '';
    this.dominantColor = null;
    this.colorPalette = [];
    this.isUploading = false;
    this.uploadProgress = 0;
    this.isDragging = false;
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    this.handleFile(file);
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (!files?.length) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    
    this.handleFile(file);
  }
  
  handleFile(file: File): void {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('File must be an image');
      return;
    }
    
    // Store the file reference
    this.currentFile = file;
    
    // Reset colors
    this.dominantColor = null;
    this.colorPalette = [];
    
    // Simulate upload progress (in a real app, this would be handled during the API call)
    this.isUploading = true;
    this.selectedFileName = file.name;
    
    // Create preview
    this.createImagePreview(file);

    // Announce to screen readers
    this.announceForScreenReaders(`File ${file.name} selected and processing`);
  }
  
  createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.previewUrl = (e.target?.result as string) || null;
      
      // Need to wait for the image to load before extracting colors
      setTimeout(() => {
        this.extractColors();
      }, 200);
    };
    reader.readAsDataURL(file);
  }
  
  extractColors(): void {
    if (!this.previewUrl || !this.currentFile) return;
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        // Extract dominant color
        const dominantRgb = this.colorThief.getColor(img);
        this.dominantColor = this.rgbToHex(dominantRgb);
        
        // Extract color palette (5 colors)
        const paletteRgb = this.colorThief.getPalette(img, 5);
        this.colorPalette = paletteRgb.map((rgb: number[]) => this.rgbToHex(rgb));
        
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          this.uploadProgress = progress;
          
          if (progress >= 100) {
            clearInterval(interval);
            this.isUploading = false;
            
            // Emit file with extracted colors
            const fileData: ImageUploadData = {
              file: this.currentFile!,
              colors: {
                dominant: this.dominantColor || undefined,
                palette: this.colorPalette
              }
            };
            this.fileSelected.emit(fileData);
            
            // Announce processing complete
            this.announceForScreenReaders(`Image processing complete. Colors extracted.`);
          }
        }, 100);
      } catch (error) {
        console.error('Error extracting colors:', error);
        // Fallback to just emitting the file without colors
        this.isUploading = false;
        if (this.currentFile) {
          this.fileSelected.emit({ file: this.currentFile });
          this.announceForScreenReaders(`Processing complete, but could not extract colors.`);
        }
      }
    };
    
    img.onerror = () => {
      console.error('Error loading image for color extraction');
      this.isUploading = false;
      if (this.currentFile) {
        this.fileSelected.emit({ file: this.currentFile });
        this.announceForScreenReaders(`Error loading image.`);
      }
    };
    
    img.src = this.previewUrl;
  }
  
  triggerFileInput(): void {
    document.getElementById('file-input')?.click();
  }

  /**
   * Announces messages to screen readers using an ARIA live region
   */
  private announceForScreenReaders(message: string): void {
    // Create a temporary element for announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    
    // Add to DOM, wait a moment, then remove
    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
} 