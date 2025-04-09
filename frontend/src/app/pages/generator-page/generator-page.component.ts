import { Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { ImageUploaderComponent } from '../../components/image-uploader/image-uploader.component';
import { FigmaInputComponent } from '../../components/figma-input/figma-input.component';
import { ApiService } from '../../services/api.service';
import { GeneratedCode } from '../../models/generated-code.model';
import { FigmaInput } from '../../models/api-request.model';

interface ImageUploadData {
  file: File;
  colors?: {
    dominant?: string;
    palette?: string[];
  };
}

interface ColorHints {
  dominant?: string;
  palette?: string[];
}

@Component({
  selector: 'app-generator-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    ImageUploaderComponent,
    FigmaInputComponent
  ],
  templateUrl: './generator-page.component.html',
  styleUrls: ['./generator-page.component.scss']
})
export class GeneratorPageComponent {
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  
  @ViewChild(ImageUploaderComponent) private imageUploader?: ImageUploaderComponent;
  @ViewChild(FigmaInputComponent) private figmaInput?: FigmaInputComponent;
  
  // State management with signals
  isLoading = signal<boolean>(false);
  generatedCode = signal<GeneratedCode | null>(null);
  error = signal<string | null>(null);
  isGenerationComplete = signal<boolean>(false);
  
  // Store the uploaded image or Figma data for later use
  private uploadedImage = signal<File | null>(null);
  private uploadedColorHints = signal<ColorHints | undefined>(undefined);
  private figmaData = signal<FigmaInput | null>(null);
  
  /**
   * Clears the UI state before starting a new generation
   */
  private clearState(): void {
    this.error.set(null);
    this.generatedCode.set(null);
    this.isGenerationComplete.set(false);
    this.uploadedImage.set(null);
    this.uploadedColorHints.set(undefined);
    this.figmaData.set(null);
  }
  
  /**
   * Completely resets the UI state, including input components
   */
  resetUI(): void {
    this.clearState();
    // Reset image uploader if exists
    if (this.imageUploader) {
      this.imageUploader.reset();
    }
    // Reset Figma input if exists
    if (this.figmaInput) {
      this.figmaInput.clearForm();
    }
  }
  
  onImageSelected(data: ImageUploadData): void {
    this.clearState();
    this.uploadedImage.set(data.file);
    this.uploadedColorHints.set(data.colors);
    
    // Log color extraction for debugging
    if (data.colors?.dominant) {
      console.log('Dominant color extracted:', data.colors.dominant);
    }
    if (data.colors?.palette?.length) {
      console.log('Color palette extracted:', data.colors.palette);
    }
  }
  
  onFigmaSubmitted(figmaInput: FigmaInput): void {
    this.clearState();
    this.figmaData.set(figmaInput);
  }
  
  /**
   * Generate and download the Angular project
   */
  generateProject(): void {
    if (!this.uploadedImage() && !this.figmaData()) {
      this.error.set('Please upload an image or provide Figma details first.');
      this.snackBar.open('Error: Please provide input before generating', 'Dismiss', {
        duration: 5000
      });
      return;
    }
    
    this.isLoading.set(true);
    this.error.set(null);
    this.isGenerationComplete.set(false);
    
    if (this.uploadedImage()) {
      this.generateFromImage();
    } else if (this.figmaData()) {
      this.generateFromFigma();
    }
  }
  
  /**
   * Generate project from uploaded image
   */
  private generateFromImage(): void {
    const image = this.uploadedImage();
    const colorHints = this.uploadedColorHints();
    
    if (!image) return;
    
    this.apiService.generateProjectFromImage(image, colorHints).subscribe({
      next: (blobResponse) => {
        this.downloadZipFile(blobResponse);
        this.handleSuccessfulGeneration();
      },
      error: (err) => {
        this.handleGenerationError(err, 'image');
      }
    });
  }
  
  /**
   * Generate project from Figma data
   */
  private generateFromFigma(): void {
    const figmaInputData = this.figmaData();
    
    if (!figmaInputData) return;
    
    this.apiService.generateProjectFromFigma(figmaInputData).subscribe({
      next: (blobResponse) => {
        this.downloadZipFile(blobResponse);
        this.handleSuccessfulGeneration();
      },
      error: (err) => {
        this.handleGenerationError(err, 'Figma');
      }
    });
  }

  /**
   * Initiates download of the ZIP file using the browser's download mechanism
   */
  private downloadZipFile(blob: Blob): void {
    try {
      // Check if we received a valid blob
      if (!blob) {
        throw new Error('No data received from server');
      }
      
      // Log information about the blob
      console.log(`Received blob: type=${blob.type}, size=${blob.size} bytes`);
      
      // Ensure we have the correct MIME type
      const zipBlob = blob.type === 'application/zip' ? blob : new Blob([blob], { type: 'application/zip' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(zipBlob);
      
      // Create a file name with timestamp to prevent caching issues
      const fileName = `generated_angular_project_${Date.now()}.zip`;
      
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.setAttribute('download', fileName);
      
      // Append the link to the document body
      document.body.appendChild(link);
      
      // Simulate a click on the link to trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      // Give the browser some time to start the download before revoking the URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
        console.log('Download URL revoked');
      }, 2000);
    } catch (error) {
      console.error('Error downloading ZIP file:', error);
      this.handleGenerationError({ 
        message: 'Failed to download the ZIP file. Please try again.' 
      }, 'download');
    }
  }
  
  /**
   * Handle successful project generation
   */
  private handleSuccessfulGeneration(): void {
    this.isLoading.set(false);
    this.isGenerationComplete.set(true);
    this.snackBar.open('Angular project successfully generated and downloaded!', 'Dismiss', {
      duration: 5000
    });
  }
  
  /**
   * Handle project generation error
   */
  private handleGenerationError(err: any, source: string): void {
    console.error(`Error generating project from ${source}:`, err);
    this.error.set(`Failed to generate Angular project from ${source}. Please try again.`);
    this.isLoading.set(false);
    this.snackBar.open('Error: ' + (err.message || `Failed to generate project from ${source}`), 'Dismiss', {
      duration: 5000
    });
  }
} 