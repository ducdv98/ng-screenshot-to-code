import { Component, ViewChild, inject } from '@angular/core';
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
import { CodeViewerComponent } from '../../components/code-viewer/code-viewer.component';
import { PreviewPaneComponent } from '../../components/preview-pane/preview-pane.component';
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
    FigmaInputComponent,
    CodeViewerComponent,
    PreviewPaneComponent
  ],
  templateUrl: './generator-page.component.html',
  styleUrls: ['./generator-page.component.scss']
})
export class GeneratorPageComponent {
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  
  @ViewChild(ImageUploaderComponent) private imageUploader?: ImageUploaderComponent;
  @ViewChild(FigmaInputComponent) private figmaInput?: FigmaInputComponent;
  
  isLoading = false;
  generatedCode: GeneratedCode | null = null;
  error: string | null = null;
  
  /**
   * Clears the UI state before starting a new generation
   */
  private clearState(): void {
    this.error = null;
    this.generatedCode = null;
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
    this.isLoading = true;
    
    // Extract file and color hints from the uploaded data
    const { file, colors } = data;
    
    // Log color extraction for debugging
    if (colors?.dominant) {
      console.log('Dominant color extracted:', colors.dominant);
    }
    if (colors?.palette?.length) {
      console.log('Color palette extracted:', colors.palette);
    }
    
    this.apiService.generateCodeFromImage(file, colors).subscribe({
      next: (response) => {
        this.generatedCode = response as GeneratedCode;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error generating code from image:', err);
        this.error = 'Failed to generate code. Please try again.';
        this.isLoading = false;
        this.snackBar.open('Error: ' + (err.message || 'Failed to generate code'), 'Dismiss', {
          duration: 5000
        });
      }
    });
  }
  
  onFigmaSubmitted(figmaInput: FigmaInput): void {
    this.clearState();
    this.isLoading = true;
    
    this.apiService.generateCodeFromFigma(figmaInput).subscribe({
      next: (response) => {
        this.generatedCode = response as GeneratedCode;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error generating code from Figma:', err);
        this.error = 'Failed to generate code from Figma. Please check your inputs and try again.';
        this.isLoading = false;
        this.snackBar.open('Error: ' + (err.message || 'Failed to generate code from Figma'), 'Dismiss', {
          duration: 5000
        });
      }
    });
  }
  
  copyCode(type: 'ts' | 'html' | 'scss'): void {
    if (!this.generatedCode) return;
    
    // Get the first component
    const component = this.generatedCode.components[0];
    let content = '';
    
    switch (type) {
      case 'ts':
        content = component.typescript;
        break;
      case 'html':
        content = component.html;
        break;
      case 'scss':
        content = component.scss;
        break;
    }
    
    navigator.clipboard.writeText(content)
      .then(() => {
        this.snackBar.open('Code copied to clipboard', 'Dismiss', {
          duration: 3000
        });
      })
      .catch(error => {
        console.error('Failed to copy code', error);
        this.snackBar.open('Failed to copy code', 'Dismiss', {
          duration: 3000
        });
      });
  }
} 