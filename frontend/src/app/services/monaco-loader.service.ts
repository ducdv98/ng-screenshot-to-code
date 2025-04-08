import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MonacoLoaderService {
  private monacoLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {}

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
        
        // Load monaco itself
        (window as any).require(['vs/editor/editor.main'], () => {
          this.monacoLoaded = true;
          resolve();
        });
      };
      
      document.body.appendChild(script);
    });

    return this.loadingPromise;
  }
} 