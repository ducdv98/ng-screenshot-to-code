import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FigmaInput } from '../../models/api-request.model';

@Component({
  selector: 'app-figma-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './figma-input.component.html',
  styleUrls: ['./figma-input.component.scss']
})
export class FigmaInputComponent {
  @Output() figmaSubmitted = new EventEmitter<FigmaInput>();
  
  figmaUrl = '';
  nodeId = '';
  accessToken = '';
  isSubmitting = false;
  
  onSubmit(): void {
    if (!this.figmaUrl || !this.accessToken) {
      return;
    }
    
    this.isSubmitting = true;
    
    const figmaInput: FigmaInput = {
      file_url: this.figmaUrl,
      node_id: this.nodeId || undefined,
      access_token: this.accessToken
    };
    
    // Simulate a delay for UI feedback (remove in production)
    setTimeout(() => {
      this.figmaSubmitted.emit(figmaInput);
      this.isSubmitting = false;
    }, 1000);
  }
  
  clearForm(): void {
    this.figmaUrl = '';
    this.nodeId = '';
    this.accessToken = '';
  }
} 