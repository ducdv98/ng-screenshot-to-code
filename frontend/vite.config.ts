import { defineConfig } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
import { Plugin } from 'vite';

// Custom plugin to handle font files
function fontLoader(): Plugin {
  return {
    name: 'font-loader',
    enforce: 'pre',
    load(id) {
      if (id.endsWith('.ttf') || id.endsWith('.woff') || id.endsWith('.woff2') || id.endsWith('.eot')) {
        // Create a URL for the font file
        return `export default "${id}"`;
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [
    fontLoader(),
    monacoEditorPlugin({
      // Monaco Editor options
      languageWorkers: ['json', 'html', 'typescript', 'css'],
      customWorkers: []
    }),
  ],
  
  // Ensure sourcemaps work correctly
  build: {
    sourcemap: true,
    assetsInlineLimit: 0, // Disable inlining assets to ensure fonts are properly emitted
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
  },
  
  // Configure handling of static assets including TTF fonts
  assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2', '**/*.eot'],
}); 