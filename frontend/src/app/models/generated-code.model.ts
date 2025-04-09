/**
 * Interface for multi-component generation
 */
export interface GeneratedCode {
  components: GeneratedComponent[];
}

export interface GeneratedComponent {
  componentName: string;  // PascalCase component name
  typescript: string;     // Component TS code
  html: string;           // Component HTML template
  scss: string;           // Component SCSS styles
} 