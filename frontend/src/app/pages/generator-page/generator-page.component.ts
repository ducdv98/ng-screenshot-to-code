import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ImageUploaderComponent } from '../../components/image-uploader/image-uploader.component';
import { FigmaInputComponent } from '../../components/figma-input/figma-input.component';
import { CodeViewerComponent } from '../../components/code-viewer/code-viewer.component';
import { PreviewPaneComponent } from '../../components/preview-pane/preview-pane.component';
import { ApiService } from '../../services/api.service';
import { GeneratedCode } from '../../models/generated-code.model';
import { FigmaInput } from '../../models/api-request.model';

@Component({
  selector: 'app-generator-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressBarModule,
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
  
  isLoading = false;
  generatedCode: GeneratedCode | null = null;
  error: string | null = null;
  
  onImageSelected(file: File): void {
    this.isLoading = true;
    this.error = null;
    
    this.apiService.generateCodeFromImage(file).subscribe({
      next: (response) => {
        this.generatedCode = response;
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
    this.isLoading = true;
    this.error = null;
    
    this.apiService.generateCodeFromFigma(figmaInput).subscribe({
      next: (response) => {
        this.generatedCode = response;
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
} 