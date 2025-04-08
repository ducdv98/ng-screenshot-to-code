import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GeneratedCode } from '../models/generated-code.model';
import { FigmaInput } from '../models/api-request.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Generate Angular component from an image file
   */
  generateCodeFromImage(file: File): Observable<GeneratedCode> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<GeneratedCode>(`${this.apiUrl}/generate-image`, formData);
  }

  /**
   * Generate Angular component from a Figma design
   */
  generateCodeFromFigma(figmaInput: FigmaInput): Observable<GeneratedCode> {
    return this.http.post<GeneratedCode>(`${this.apiUrl}/generate-figma`, figmaInput);
  }
} 