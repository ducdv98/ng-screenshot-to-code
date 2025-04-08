import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MonacoLoaderService {
  private monacoLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    // Create a global fix for the toUrl error that applies even before Monaco loads
    this.installGlobalToUrlFix();
  }

  /**
   * Install a global fix for the toUrl error that can happen in Monaco editor
   * This needs to be done early, even before Monaco loads
   */
  private installGlobalToUrlFix(): void {
    // Patch Object.getOwnPropertyDescriptor to handle toUrl access on undefined objects
    const origGetOwnPropDesc = Object.getOwnPropertyDescriptor;
    
    Object.getOwnPropertyDescriptor = function(obj: any, prop: string) {
      if (prop === 'toUrl' && (!obj || typeof obj !== 'object')) {
        // Return a fake property descriptor for toUrl on undefined objects
        return {
          configurable: true,
          enumerable: false,
          value: function() { return ''; },
          writable: true
        };
      }
      return origGetOwnPropDesc.apply(this, [obj, prop]);
    };
  }

  /**
   * Load Monaco Editor resources
   * @returns Promise that resolves when Monaco is loaded
   */
  public loadMonaco(): Promise<void> {
    // Return existing promise if already loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Return resolved promise if already loaded
    if (this.monacoLoaded) {
      return Promise.resolve();
    }

    // Load Monaco
    this.loadingPromise = new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'assets/monaco-editor/min/vs/loader.js';
      script.onload = () => {
        // Configure require paths
        (window as any).require.config({
          paths: {
            vs: 'assets/monaco-editor/min/vs'
          }
        });
        
        // Setup worker environment
        this.setupMonacoEnvironment();
        
        // Load monaco itself
        (window as any).require(['vs/editor/editor.main'], () => {
          console.log('Monaco editor loaded successfully');
          this.monacoLoaded = true;
          resolve();
        });
      };
      
      document.body.appendChild(script);
    });

    return this.loadingPromise;
  }

  /**
   * Setup environment for Monaco editor
   */
  private setupMonacoEnvironment(): void {
    (window as any).MonacoEnvironment = {
      getWorkerUrl: function(_moduleId: string, label: string) {
        if (label === 'json') {
          return 'assets/monaco-editor/min/vs/language/json/json.worker.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return 'assets/monaco-editor/min/vs/language/css/css.worker.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return 'assets/monaco-editor/min/vs/language/html/html.worker.js';
        }
        if (label === 'typescript' || label === 'javascript') {
          return 'assets/monaco-editor/min/vs/language/typescript/ts.worker.js';
        }
        return 'assets/monaco-editor/min/vs/editor/editor.worker.js';
      }
    };
  }
} 