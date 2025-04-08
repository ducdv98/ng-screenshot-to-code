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