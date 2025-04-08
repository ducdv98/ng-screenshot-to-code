import { defineConfig } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  plugins: [
    monacoEditorPlugin({
      // Monaco Editor options
      languageWorkers: ['json', 'html', 'typescript', 'css'],
      customWorkers: []
    }),
  ],
  
  // Ensure sourcemaps work correctly
  build: {
    sourcemap: true
  },
  
  // Optimize handling of worker files
  worker: {
    format: 'es'
  },
  
  // Add specific optimizations for Monaco editor
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis' // Fix for Monaco editor
      }
    },
    include: [
      'monaco-editor/esm/vs/editor/editor.api'
    ]
  },
  
  // Add specific resolve configuration for Monaco imports
  resolve: {
    alias: {
      'monaco-editor': 'monaco-editor/esm/vs/editor/editor.api.js',
    }
  }
}); 