import { Component, Input, AfterViewInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as monaco from 'monaco-editor';
import { GeneratedCode } from '../../models/generated-code.model';
import { MonacoLoaderService } from '../../services/monaco-loader.service';

@Component({
  selector: 'app-code-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './code-viewer.component.html',
  styleUrls: ['./code-viewer.component.scss']
})
export class CodeViewerComponent implements AfterViewInit, OnChanges {
  @Input() generatedCode: GeneratedCode | null = null;
  @Input() code: string | null = null;
  @Input() language: string = 'typescript';
  @Input() fileName: string | null = null;
  @Input() showSingleEditor: boolean = false;
  
  @ViewChild('tsEditor') tsEditorElement!: ElementRef;
  @ViewChild('htmlEditor') htmlEditorElement!: ElementRef;
  @ViewChild('scssEditor') scssEditorElement!: ElementRef;
  @ViewChild('singleEditor') singleEditorElement?: ElementRef;
  
  private tsEditor: monaco.editor.IStandaloneCodeEditor | null = null;
  private htmlEditor: monaco.editor.IStandaloneCodeEditor | null = null;
  private scssEditor: monaco.editor.IStandaloneCodeEditor | null = null;
  private singleEditor: monaco.editor.IStandaloneCodeEditor | null = null;
  
  private defaultTsValue = '// TypeScript code will appear here';
  private defaultHtmlValue = '<!-- HTML code will appear here -->';
  private defaultScssValue = '/* SCSS code will appear here */';
  
  constructor(private snackBar: MatSnackBar, private monacoLoader: MonacoLoaderService) {}
  
  ngAfterViewInit(): void {
    this.monacoLoader.loadMonaco().then(() => {
      this.initMonacoEditors();
    }).catch(error => {
      console.error('Failed to load Monaco editor', error);
    });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['generatedCode'] && this.generatedCode) {
      this.updateEditors();
    }
    
    if (changes['code'] && this.code && this.showSingleEditor) {
      this.updateSingleEditor();
    }
  }
  
  private initMonacoEditors(): void {
    if (this.showSingleEditor) {
      this.initSingleEditor();
      return;
    }
    
    if (!this.tsEditorElement || !this.htmlEditorElement || !this.scssEditorElement) {
      return;
    }
    
    this.tsEditor = monaco.editor.create(this.tsEditorElement.nativeElement, {
      value: this.defaultTsValue,
      language: 'typescript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false }
    });
    
    this.htmlEditor = monaco.editor.create(this.htmlEditorElement.nativeElement, {
      value: this.defaultHtmlValue,
      language: 'html',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false }
    });
    
    this.scssEditor = monaco.editor.create(this.scssEditorElement.nativeElement, {
      value: this.defaultScssValue,
      language: 'scss',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false }
    });
  }
  
  private initSingleEditor(): void {
    if (!this.singleEditorElement) {
      return;
    }
    
    this.singleEditor = monaco.editor.create(this.singleEditorElement.nativeElement, {
      value: this.code || '// Code will appear here',
      language: this.language,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      readOnly: true
    });
  }
  
  private updateSingleEditor(): void {
    if (this.singleEditor && this.code) {
      this.singleEditor.setValue(this.code);
      monaco.editor.setModelLanguage(this.singleEditor.getModel()!, this.language);
    }
  }
  
  private updateEditors(): void {
    if (!this.generatedCode) return;

    if (this.tsEditor) {
      this.tsEditor.setValue(this.generatedCode.component_ts);
    }
    
    if (this.htmlEditor) {
      this.htmlEditor.setValue(this.generatedCode.component_html);
    }
    
    if (this.scssEditor) {
      this.scssEditor.setValue(this.generatedCode.component_scss);
    }
  }
  
  copyCode(type: 'ts' | 'html' | 'scss' | 'single'): void {
    if (!this.generatedCode && !this.code) return;
    
    let textToCopy = '';
    
    if (type === 'single' && this.code) {
      textToCopy = this.code;
    } else if (this.generatedCode) {
      switch (type) {
        case 'ts':
          textToCopy = this.generatedCode.component_ts;
          break;
        case 'html':
          textToCopy = this.generatedCode.component_html;
          break;
        case 'scss':
          textToCopy = this.generatedCode.component_scss;
          break;
      }
    }
    
    navigator.clipboard.writeText(textToCopy)
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
  
  downloadAllFiles(): void {
    if (!this.generatedCode) return;
    
    const componentName = this.generatedCode.component_name || 'angular-component';
    
    this.downloadFile(`${componentName}.component.ts`, this.generatedCode.component_ts);
    this.downloadFile(`${componentName}.component.html`, this.generatedCode.component_html);
    this.downloadFile(`${componentName}.component.scss`, this.generatedCode.component_scss);
    
    this.snackBar.open('Files downloaded', 'Dismiss', {
      duration: 3000
    });
  }
  
  private downloadFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    a.click();
    
    window.URL.revokeObjectURL(url);
  }
} 