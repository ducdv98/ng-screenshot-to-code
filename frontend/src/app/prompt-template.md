# Angular Screenshot-to-Code Prompt Templates

These prompts are designed for generating Angular code that follows best practices and integrates Tailwind CSS and Angular Material effectively.

## Tailwind CSS Integration

```
Generate Angular component code using these Tailwind CSS guidelines:
- Use Tailwind utility classes directly in HTML templates (flex, p-4, text-lg, etc.) for layout and basic styling
- Maintain existing color scheme from the screenshot, matching our custom Tailwind palette (primary-500, accent-400, etc.)
- Apply Tailwind's @apply directive in SCSS files only for complex component styles or when creating reusable patterns
- Use responsive prefixes (sm:, md:, lg:, xl:) for adaptive layouts
- Follow existing component patterns with container wrappers using Tailwind classes and Material components inside them
- Keep Material component styling separate from Tailwind utilities
```

## Tailwind Configuration for Screenshots

```
Extract and configure Tailwind CSS from the screenshot with these specifications:
- Extract dominant colors from the screenshot and map to closest matching Material Design colors
- Define extracted colors in tailwind.config.js theme.extend.colors, matching existing patterns:
  primary: { 50: '#e3f2fd', ..., 900: '#0d47a1' }
- Create CSS variables in :root for each color to allow cross-use between Tailwind and Angular Material
- Set up proper typography, spacing, and border radius to match the screenshot aesthetics
- Configure the darkMode option as 'media' for automatic dark mode support
```

## Angular Material Theming Best Practices

```
Configure Angular Material theming following v3 best practices:
- Keep existing palettes in custom-theme.scss that extend Material Design with custom colors
- Use proper Material imports: '@angular/material' as mat
- Apply component-specific theming where needed with component mixins
- Use CSS variables for colors to ensure consistency between Material and Tailwind:
  $primary-palette: (
    500: var(--color-primary-500),
    contrast: (500: white)
  )
- Set appropriate density scale for improved usability
- Configure typography to match Roboto font family used throughout the app
```

## Material with Tailwind Compatibility

```
When combining Angular Material with Tailwind, follow these rules:
- Never apply Tailwind utility classes directly to Material component tags
- Create container elements with Tailwind classes for layout:
  <div class="flex justify-center p-4">
    <mat-card class="custom-card">...</mat-card>
  </div>
- Create custom SCSS classes for Material components:
  .custom-card {
    @apply rounded-lg shadow-md;
    // Material-specific styling
  }
- Use consistent patterns from existing components for proper integration
```

## Package Version Compatibility

```
Ensure these package version constraints:
- Angular v19.2+ with Angular Material v19.2+
- TailwindCSS v3.4+
- PostCSS v8.5+
- TypeScript v5.7+
- Check package.json for exact versions of other dependencies
- Respect existing import patterns to avoid conflicts
```

## Import Path Conventions

```
Follow these import path conventions:
- Angular core modules first: import { Component, inject } from '@angular/core';
- Angular common features: import { CommonModule } from '@angular/common';
- Material components: import { MatButtonModule } from '@angular/material/button';
- Application services with relative paths: import { ApiService } from '../../services/api.service';
- Application models with relative paths: import { GeneratedCode } from '../../models/generated-code.model';
- Verify paths against the project structure to prevent import errors
```

## Component Architecture

```
Generate components following these patterns:
- Use standalone components with explicit imports in the imports array
- Leverage signals for reactive state management:
  isLoading = signal<boolean>(false);
- Use the inject() function for dependency injection:
  private apiService = inject(ApiService);
- Follow Angular lifecycle methods in consistent order
- Implement proper error handling in service subscriptions
- Use strong typing with interfaces for all data models
- Apply immutability principles when updating state
```

## Accessibility and Performance

```
Optimize components with these best practices:
- Use semantic HTML elements with appropriate aria attributes
- Implement keyboard navigation for interactive elements
- Apply proper focus states with visible outlines
- Use NgOptimizedImage for better image loading
- Apply trackBy functions for ngFor directives
- Use the async pipe with RxJS observables
- Support high contrast mode with appropriate styling
- Ensure proper color contrast ratios for text
``` 