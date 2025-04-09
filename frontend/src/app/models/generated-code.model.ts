export interface GeneratedCode {
  component_ts: string;
  component_html: string;
  component_scss: string;
  component_name: string;
  warnings?: string[];
  dependencies?: Record<string, string>;
  additional_files?: AdditionalFile[];
}

export interface AdditionalFile {
  path: string;
  content: string;
}

/**
 * New interface for enhanced multi-component generation
 */
export interface GeneratedCodeV2 {
  components: GeneratedComponent[];
}

export interface GeneratedComponent {
  componentName: string;  // PascalCase component name
  typescript: string;     // Component TS code
  html: string;           // Component HTML template
  scss: string;           // Component SCSS styles
} 