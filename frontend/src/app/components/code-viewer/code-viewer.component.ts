import { Component, Input, AfterViewInit, OnChanges, SimpleChanges, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { GeneratedCode, GeneratedComponent } from '../../models/generated-code.model';
import { MonacoLoaderService } from '../../services/monaco-loader.service';
import { MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

/**
 * File tree node for directory structure
 */
interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  fileType?: 'typescript' | 'html' | 'scss';
  componentIndex?: number;
  path: string;
}

/**
 * Flattened tree node with level information
 */
interface FlatFileNode {
  name: string;
  type: 'file' | 'directory';
  level: number;
  expandable: boolean;
  fileType?: 'typescript' | 'html' | 'scss';
  componentIndex?: number;
  path: string;
}

@Component({
  selector: 'app-code-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSelectModule,
    MatTreeModule,
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
  
  @ViewChild('editorContainer') editorContainer?: ElementRef;
  
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  selectedComponentIndex: number = 0;
  selectedComponent: GeneratedComponent | null = null;
  activeFileType: 'typescript' | 'html' | 'scss' = 'typescript';
  selectedFilePath: string = '';
  
  screenReaderMessage = '';

  // Tree control for file structure
  private _transformer = (node: FileNode, level: number): FlatFileNode => {
    return {
      name: node.name,
      type: node.type,
      level: level,
      expandable: !!node.children && node.children.length > 0,
      fileType: node.fileType,
      componentIndex: node.componentIndex,
      path: node.path
    };
  };

  treeControl = new FlatTreeControl<FlatFileNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  fileDataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  
  constructor(private snackBar: MatSnackBar, private monacoLoader: MonacoLoaderService) {}
  
  ngAfterViewInit(): void {
    this.monacoLoader.loadMonaco().then(() => {
      this.initEditor();
    }).catch(error => {
      console.error('Failed to load Monaco editor', error);
    });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['generatedCode'] && this.generatedCode) || 
        (changes['code'] && this.code !== undefined) || 
        changes['language']) {
      this.monacoLoader.loadMonaco().then(() => {
        if (!this.editor) {
          this.initEditor();
        } 
        
        if (changes['generatedCode'] && this.generatedCode) {
          if (this.generatedCode.components && this.generatedCode.components.length > 0) {
            this.selectedComponent = this.generatedCode.components[0];
            this.selectedComponentIndex = 0;
            this.activeFileType = 'typescript';
            this.buildFileTree();
            this.updateEditor();
          }
          this.announceToScreenReader(`Code generated successfully for ${this.selectedComponent?.componentName || 'component'}`);
        } else {
          this.updateEditor();
        }
      }).catch(error => {
        console.error('Failed to load Monaco editor', error);
      });
    }
  }
  
  private initEditor(): void {
    if (!this.editorContainer) {
      return;
    }
    
    if (!this.editorContainer.nativeElement.querySelector('.monaco-editor')) {
      const value = this.getDisplayContent();
      
      this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
        value,
        language: this.language,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: true },
        readOnly: true,
        accessibilitySupport: 'auto' as 'auto',
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        wordWrap: 'on'
      });
    }
  }
  
  private updateEditor(): void {
    if (!this.editor) {
      return;
    }
    
    const value = this.getDisplayContent();
    this.editor.setValue(value);
    monaco.editor.setModelLanguage(this.editor.getModel()!, this.language);
  }
  
  private getDisplayContent(): string {
    // If direct code is provided, use it
    if (this.code !== null && this.code !== undefined) {
      return this.code;
    }
    
    // Otherwise, get code from the selected component
    if (this.generatedCode && this.generatedCode.components.length > 0) {
      if (!this.selectedComponent && this.generatedCode.components.length > this.selectedComponentIndex) {
        this.selectedComponent = this.generatedCode.components[this.selectedComponentIndex];
      }
      
      if (this.selectedComponent) {
        if (this.activeFileType === 'typescript') {
          return this.selectedComponent.typescript || '// No TypeScript code available';
        } else if (this.activeFileType === 'html') {
          return this.selectedComponent.html || '<!-- No HTML code available -->';
        } else if (this.activeFileType === 'scss') {
          return this.selectedComponent.scss || '/* No SCSS code available */';
        }
      }
    }
    
    return this.activeFileType === 'typescript' ? '// No code available' : 
           this.activeFileType === 'html' ? '<!-- No code available -->' : 
           '/* No code available */';
  }
  
  /**
   * Build file tree from generated components
   */
  private buildFileTree(): void {
    if (!this.generatedCode || !this.generatedCode.components) {
      this.fileDataSource.data = [];
      return;
    }
    
    const root: FileNode = {
      name: 'src',
      type: 'directory',
      path: 'src',
      children: [
        {
          name: 'app',
          type: 'directory',
          path: 'src/app',
          children: []
        }
      ]
    };
    
    const appFolder = root.children![0];
    
    // Add components folder
    const componentsFolder: FileNode = {
      name: 'components',
      type: 'directory',
      path: 'src/app/components',
      children: []
    };
    
    // Add each component as a subfolder with its files
    this.generatedCode.components.forEach((component, index) => {
      const kebabName = this.toKebabCase(component.componentName);
      const componentFolder: FileNode = {
        name: kebabName,
        type: 'directory',
        path: `src/app/components/${kebabName}`,
        children: [
          {
            name: `${kebabName}.component.ts`,
            type: 'file',
            fileType: 'typescript',
            componentIndex: index,
            path: `src/app/components/${kebabName}/${kebabName}.component.ts`
          },
          {
            name: `${kebabName}.component.html`,
            type: 'file',
            fileType: 'html',
            componentIndex: index,
            path: `src/app/components/${kebabName}/${kebabName}.component.html`
          },
          {
            name: `${kebabName}.component.scss`,
            type: 'file',
            fileType: 'scss',
            componentIndex: index,
            path: `src/app/components/${kebabName}/${kebabName}.component.scss`
          }
        ]
      };
      
      componentsFolder.children!.push(componentFolder);
    });
    
    appFolder.children!.push(componentsFolder);
    this.fileDataSource.data = [root];
    
    // Expand the initial tree
    this.treeControl.dataNodes.forEach(node => {
      if (node.level < 3) {
        this.treeControl.expand(node);
      }
    });
    
    // Select first component typescript file by default
    if (this.generatedCode.components.length > 0) {
      const kebabName = this.toKebabCase(this.generatedCode.components[0].componentName);
      this.selectedFilePath = `src/app/components/${kebabName}/${kebabName}.component.ts`;
    }
  }
  
  /**
   * Handle file node click in tree
   */
  fileNodeClicked(node: FlatFileNode): void {
    if (node.type === 'file' && node.fileType && node.componentIndex !== undefined) {
      this.selectedComponentIndex = node.componentIndex;
      this.selectedComponent = this.generatedCode?.components[node.componentIndex] || null;
      this.activeFileType = node.fileType;
      this.selectedFilePath = node.path;
      this.language = node.fileType;
      this.updateEditor();
      this.announceToScreenReader(`Selected file: ${node.name}`);
    }
  }
  
  /**
   * Check if node has child nodes (for tree)
   */
  hasChild(_: number, node: FlatFileNode): boolean {
    return node.expandable;
  }
  
  /**
   * Convert component name to kebab case for filenames
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }
  
  copyCode(): void {
    const content = this.getDisplayContent();
    
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        this.snackBar.open('Code copied to clipboard', 'Dismiss', {
          duration: 3000
        });
        this.announceToScreenReader('Code copied to clipboard');
      }).catch(error => {
        console.error('Failed to copy code', error);
        this.snackBar.open('Failed to copy code', 'Dismiss', {
          duration: 3000
        });
      });
    }
  }
  
  downloadFile(): void {
    if (!this.selectedComponent) {
      return;
    }
    
    const content = this.getDisplayContent();
    const extension = this.language === 'typescript' ? 'ts' : 
                     this.language === 'html' ? 'html' : 'scss';
    
    const componentName = this.selectedComponent.componentName || 'component';
    const filename = `${this.toKebabCase(componentName)}.component.${extension}`;
    
    this.createAndDownloadFile(filename, content);
  }
  
  downloadAllFiles(): void {
    if (!this.selectedComponent) {
      return;
    }
    
    const componentName = this.selectedComponent.componentName || 'component';
    const kebabName = this.toKebabCase(componentName);
    
    // Download typescript file
    this.createAndDownloadFile(
      `${kebabName}.component.ts`, 
      this.selectedComponent.typescript || '// No TypeScript code available'
    );
    
    // Download HTML file
    this.createAndDownloadFile(
      `${kebabName}.component.html`, 
      this.selectedComponent.html || '<!-- No HTML code available -->'
    );
    
    // Download SCSS file
    this.createAndDownloadFile(
      `${kebabName}.component.scss`, 
      this.selectedComponent.scss || '/* No SCSS code available */'
    );
    
    this.snackBar.open('All files downloaded', 'Dismiss', {
      duration: 3000
    });
    
    this.announceToScreenReader('All component files downloaded');
  }
  
  private createAndDownloadFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  private announceToScreenReader(message: string): void {
    this.screenReaderMessage = message;
    
    // Clear after a delay to prevent stacking announcements
    setTimeout(() => {
      this.screenReaderMessage = '';
    }, 1000);
  }
  
  onComponentChange(): void {
    if (this.generatedCode && this.generatedCode.components.length > this.selectedComponentIndex) {
      this.selectedComponent = this.generatedCode.components[this.selectedComponentIndex];
      this.updateEditor();
      this.announceToScreenReader(`Selected component: ${this.selectedComponent.componentName}`);
    }
  }
  
  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  }
} 