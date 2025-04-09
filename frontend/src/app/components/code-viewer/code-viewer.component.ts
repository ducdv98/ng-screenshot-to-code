import { Component, Input, AfterViewInit, OnChanges, SimpleChanges, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { GeneratedCode, GeneratedComponent } from '../../models/generated-code.model';
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
    MatTooltipModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './code-viewer.component.html',
  styleUrls: ['./code-viewer.component.scss']
})
export class CodeViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() generatedCode: GeneratedCode | null = null;
  @Input() code: string | null | undefined = null;
  @Input() language: string = 'typescript';
  @Input() fileName: string | null = null;
  @Input() showSingleEditor: boolean = false;
  
  @ViewChild('singleLanguageEditor') singleLanguageEditorElement?: ElementRef;
  @ViewChild('singleEditor') singleEditorElement?: ElementRef;
  
  private singleLanguageEditor: monaco.editor.IStandaloneCodeEditor | null = null;
  private singleEditor: monaco.editor.IStandaloneCodeEditor | null = null;
  
  private defaultTsValue = '// TypeScript code will appear here';
  private defaultHtmlValue = '<!-- HTML code will appear here -->';
  private defaultScssValue = '/* SCSS code will appear here */';
  
  activeLanguage: string = 'typescript';
  
  selectedComponentIndex: number = 0;
  selectedComponent: GeneratedComponent | null = null;
  
  screenReaderMessage = '';
  
  constructor(private snackBar: MatSnackBar, private monacoLoader: MonacoLoaderService) {}
  
  ngAfterViewInit(): void {
    this.monacoLoader.loadMonaco().then(() => {
      this.initEditors();
    }).catch(error => {
      console.error('Failed to load Monaco editor', error);
    });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['generatedCode'] && this.generatedCode) {
      if (this.generatedCode.components && this.generatedCode.components.length > 0) {
        this.selectedComponent = this.generatedCode.components[0];
        this.selectedComponentIndex = 0;
        
        if (this.showSingleEditor) {
          if (this.language === 'typescript') {
            this.code = this.selectedComponent.typescript;
          } else if (this.language === 'html') {
            this.code = this.selectedComponent.html;
          } else if (this.language === 'scss') {
            this.code = this.selectedComponent.scss;
          }
          
          this.fileName = `${this.selectedComponent.componentName}.component.${this.language}`;
        }
      }
      
      this.monacoLoader.loadMonaco().then(() => {
        this.initEditors();
        this.updateEditors();
        this.announceToScreenReader(`Code generated successfully for ${this.selectedComponent?.componentName || 'component'}`);
      }).catch(error => {
        console.error('Failed to load Monaco editor', error);
      });
    }
    
    if (changes['code'] && this.code && this.showSingleEditor) {
      this.monacoLoader.loadMonaco().then(() => {
        this.initSingleEditor();
        this.updateSingleEditor();
        this.announceToScreenReader(`Code updated in editor`);
      }).catch(error => {
        console.error('Failed to load Monaco editor', error);
      });
    }
  }
  
  setActiveLanguage(language: string): void {
    if (this.activeLanguage === language) {
      return;
    }
    
    this.activeLanguage = language;
    this.updateSingleLanguageEditor();
    this.announceToScreenReader(`${language} tab selected`);
  }
  
  private initEditors(): void {
    if (this.showSingleEditor) {
      this.initSingleEditor();
    } else {
      this.initSingleLanguageEditor();
    }
  }
  
  private initSingleLanguageEditor(): void {
    if (this.singleLanguageEditor) {
      this.updateSingleLanguageEditor();
      return;
    }
    
    if (!this.singleLanguageEditorElement) {
      return;
    }
    
    if (!this.singleLanguageEditorElement.nativeElement.querySelector('.monaco-editor')) {
      const language = this.activeLanguage === 'typescript' ? 'typescript' :
                      this.activeLanguage === 'html' ? 'html' : 'scss';
      
      this.singleLanguageEditor = monaco.editor.create(this.singleLanguageEditorElement.nativeElement, {
        value: this.getCodeForLanguage(language),
        language,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        readOnly: true,
        accessibilitySupport: 'auto' as 'auto'
      });
    }
  }
  
  private initSingleEditor(): void {
    if (this.singleEditor) {
      return;
    }
    
    if (!this.singleEditorElement) {
      return;
    }
    
    if (!this.singleEditorElement.nativeElement.querySelector('.monaco-editor')) {
      this.singleEditor = monaco.editor.create(this.singleEditorElement.nativeElement, {
        value: this.code || '// Code will appear here',
        language: this.language,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        readOnly: true,
        accessibilitySupport: 'auto' as 'auto'
      });
    }
  }
  
  private updateSingleLanguageEditor(): void {
    if (!this.singleLanguageEditor) {
      if (this.singleLanguageEditorElement) {
        setTimeout(() => this.updateSingleLanguageEditor(), 100);
        return;
      }
    }
    
    if (this.singleLanguageEditor) {
      const language = this.activeLanguage === 'typescript' ? 'typescript' :
                      this.activeLanguage === 'html' ? 'html' : 'scss';
      
      this.singleLanguageEditor.setValue(this.getCodeForLanguage(language));
      monaco.editor.setModelLanguage(this.singleLanguageEditor.getModel()!, language);
    }
  }
  
  private getCodeForLanguage(language: string): string {
    if (this.selectedComponent) {
      if (language === 'typescript') {
        return this.selectedComponent.typescript || this.defaultTsValue;
      } else if (language === 'html') {
        return this.selectedComponent.html || this.defaultHtmlValue;
      } else {
        return this.selectedComponent.scss || this.defaultScssValue;
      }
    } else if (this.generatedCode && this.generatedCode.components.length > 0) {
      const component = this.generatedCode.components[0];
      if (language === 'typescript') {
        return component.typescript || this.defaultTsValue;
      } else if (language === 'html') {
        return component.html || this.defaultHtmlValue;
      } else {
        return component.scss || this.defaultScssValue;
      }
    }
    
    return language === 'typescript' ? this.defaultTsValue : 
           language === 'html' ? this.defaultHtmlValue : this.defaultScssValue;
  }
  
  private updateSingleEditor(): void {
    if (!this.singleEditor) {
      return;
    }
    
    if (this.code) {
      this.singleEditor.setValue(this.code);
      monaco.editor.setModelLanguage(this.singleEditor.getModel()!, this.language);
    }
  }
  
  private updateEditors(): void {
    this.updateSingleLanguageEditor();
    if (this.singleEditor) {
      this.updateSingleEditor();
    }
  }
  
  onComponentChange(): void {
    if (this.generatedCode && this.generatedCode.components.length > this.selectedComponentIndex) {
      this.selectedComponent = this.generatedCode.components[this.selectedComponentIndex];
      this.updateSingleLanguageEditor();
      this.announceToScreenReader(`Selected component: ${this.selectedComponent.componentName}`);
    }
  }
  
  copyCode(type: 'ts' | 'html' | 'scss' | 'single'): void {
    let content = '';
    let typeLabel = '';
    
    if (type === 'single' && this.code) {
      content = this.code;
      typeLabel = this.fileName || this.language;
    } else {
      // Get content based on current component
      if (this.selectedComponent) {
        if (type === 'ts') {
          content = this.selectedComponent.typescript;
          typeLabel = 'TypeScript';
        } else if (type === 'html') {
          content = this.selectedComponent.html;
          typeLabel = 'HTML';
        } else if (type === 'scss') {
          content = this.selectedComponent.scss;
          typeLabel = 'SCSS';
        }
      } else if (this.generatedCode && this.generatedCode.components.length > 0) {
        const component = this.generatedCode.components[0];
        if (type === 'ts') {
          content = component.typescript;
          typeLabel = 'TypeScript';
        } else if (type === 'html') {
          content = component.html;
          typeLabel = 'HTML';
        } else if (type === 'scss') {
          content = component.scss;
          typeLabel = 'SCSS';
        }
      }
    }
    
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        this.snackBar.open(`${typeLabel} code copied to clipboard`, 'Dismiss', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this.announceToScreenReader(`${typeLabel} code copied to clipboard`);
      }).catch(err => {
        console.error('Could not copy text: ', err);
        this.snackBar.open('Failed to copy to clipboard', 'Dismiss', {
          duration: 3000
        });
      });
    }
  }
  
  copyCodeByLanguage(): void {
    this.copyCode(this.activeLanguage as 'ts' | 'html' | 'scss');
  }
  
  downloadAllFiles(): void {
    if (!this.generatedCode) return;
    
    // Download files for all components
    this.generatedCode.components.forEach(component => {
      const kebabName = this.toKebabCase(component.componentName);
      
      // Download TypeScript file
      this.downloadFile(
        `${kebabName}.component.ts`, 
        component.typescript
      );
      
      // Download HTML file
      this.downloadFile(
        `${kebabName}.component.html`,
        component.html
      );
      
      // Download SCSS file
      this.downloadFile(
        `${kebabName}.component.scss`,
        component.scss
      );
    });
    
    this.snackBar.open('All files downloaded', 'Dismiss', { duration: 3000 });
    this.announceToScreenReader('All component files downloaded');
  }
  
  public toKebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
  
  private downloadFile(filename: string, content: string): void {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  
  announceSelectedTab(event: MatTabChangeEvent): void {
    const tabLabels = ['TypeScript', 'HTML', 'SCSS'];
    this.announceToScreenReader(`${tabLabels[event.index]} tab selected`);
  }
  
  private announceToScreenReader(message: string): void {
    this.screenReaderMessage = message;
    setTimeout(() => {
      this.screenReaderMessage = '';
    }, 1000);
  }
  
  ngOnDestroy(): void {
    if (this.singleLanguageEditor) {
      this.singleLanguageEditor.dispose();
    }
    
    if (this.singleEditor) {
      this.singleEditor.dispose();
    }
  }
} 