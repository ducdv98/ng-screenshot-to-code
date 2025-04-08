import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
  @Output() fileSelected = new EventEmitter<File>();
  
  isDragging = false;
  uploadProgress = 0;
  isUploading = false;
  selectedFileName = '';
  previewUrl: string | null = null;
  
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
    
    // Simulate upload progress (in a real app, this would be handled during the API call)
    this.isUploading = true;
    this.selectedFileName = file.name;
    
    // Create preview
    this.createImagePreview(file);
    
    // Simulate progress (would be handled by real API in production)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      this.uploadProgress = progress;
      
      if (progress >= 100) {
        clearInterval(interval);
        this.isUploading = false;
        this.fileSelected.emit(file);
      }
    }, 100);
  }
  
  createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.previewUrl = (e.target?.result as string) || null;
    };
    reader.readAsDataURL(file);
  }
  
  triggerFileInput(): void {
    document.getElementById('file-input')?.click();
  }
} 