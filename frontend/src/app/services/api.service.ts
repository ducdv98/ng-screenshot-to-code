import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GeneratedCode } from '../models/generated-code.model';
import { FigmaInput } from '../models/api-request.model';

interface ColorHints {
  dominant?: string;
  palette?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Generate Angular component from an image file
   * @param file The image file to generate code from
   * @param colorHints Optional color hints extracted from the image
   */
  generateCodeFromImage(file: File, colorHints?: ColorHints): Observable<GeneratedCode> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add color hints if provided
    if (colorHints) {
      formData.append('color_hints', JSON.stringify(colorHints));
    }

    return this.http.post<GeneratedCode>(`${this.apiUrl}/generate-image/`, formData);
  }

  /**
   * Generate Angular component from a Figma design
   */
  generateCodeFromFigma(figmaInput: FigmaInput): Observable<GeneratedCode> {
    return this.http.post<GeneratedCode>(`${this.apiUrl}/generate-figma/`, figmaInput);
  }

  /**
   * Generate and download a complete Angular project from an image file
   * @param file The image file to generate code from
   * @param colorHints Optional color hints extracted from the image
   * @returns Observable with Blob data of the zip file
   */
  generateProjectFromImage(file: File, colorHints?: ColorHints): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add color hints if provided
    if (colorHints) {
      formData.append('color_hints', JSON.stringify(colorHints));
    }

    return this.http.post(`${this.apiUrl}/generate-image/`, formData, {
      responseType: 'blob'
    });
  }

  /**
   * Generate and download a complete Angular project from a Figma design
   * @param figmaInput Figma input details
   * @returns Observable with Blob data of the zip file
   */
  generateProjectFromFigma(figmaInput: FigmaInput): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/generate-figma/`, figmaInput, {
      responseType: 'blob'
    });
  }
} 