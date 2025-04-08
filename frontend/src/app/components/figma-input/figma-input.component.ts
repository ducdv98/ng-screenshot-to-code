import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
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
  submissionMessage = '';
  
  onSubmit(): void {
    if (!this.figmaUrl || !this.accessToken) {
      this.announceForScreenReaders('Please fill in all required fields.');
      return;
    }
    
    this.isSubmitting = true;
    this.announceForScreenReaders('Processing your Figma design. This may take a moment.');
    
    const figmaInput: FigmaInput = {
      file_url: this.figmaUrl,
      node_id: this.nodeId || undefined,
      access_token: this.accessToken
    };
    
    // Emit the event and clear the form
    this.figmaSubmitted.emit(figmaInput);
    
    // Reset submission state but keep form values for potential resubmission
    setTimeout(() => {
      this.isSubmitting = false;
      this.announceForScreenReaders('Figma design submitted for processing.');
    }, 500);
  }
  
  clearForm(): void {
    this.figmaUrl = '';
    this.nodeId = '';
    this.accessToken = '';
    this.announceForScreenReaders('Form cleared. All fields are now empty.');
  }
  
  /**
   * Announces messages to screen readers using the existing aria-live region
   */
  private announceForScreenReaders(message: string): void {
    this.submissionMessage = message;
    // Clear message after a delay to ensure it will be read again if the same message is set
    setTimeout(() => {
      this.submissionMessage = '';
    }, 1000);
  }
} 