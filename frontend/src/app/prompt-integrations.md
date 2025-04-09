# Angular Material and Tailwind CSS Integration Guide

This document provides specific guidance for properly integrating Angular Material with Tailwind CSS in our screenshot-to-code generator.

## Core Integration Principles

1. **Separation of Concerns**
   - Use Tailwind for layout, spacing, and basic styling
   - Use Angular Material for complex UI components (buttons, forms, dialogs)
   - Never apply Tailwind classes directly to Material components

2. **Wrapper Pattern**
   - Always wrap Material components in container elements with Tailwind classes
   - Apply custom styling to Material components via SCSS

3. **CSS Variable Bridge**
   - Use CSS variables to share colors between Material themes and Tailwind
   - Define variables in `:root` that both systems can reference

## Common Pitfalls and Solutions

### ❌ Problem: Applying Tailwind Directly to Material Components

```html
<!-- WRONG: Direct application of Tailwind to Material -->
<button mat-raised-button color="primary" class="text-lg p-4 rounded-full">
  Submit
</button>
```

### ✅ Solution: Wrapper Pattern + Custom SCSS

```html
<!-- CORRECT: Container with Tailwind + Material with custom class -->
<div class="flex justify-end mt-4">
  <button mat-raised-button color="primary" class="submit-button">
    Submit
  </button>
</div>
```

```scss
// In component SCSS
.submit-button {
  // Use @apply for reusable styles
  @apply text-lg rounded-lg;
  
  // Use direct CSS for Material-specific overrides
  padding: 12px 24px;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}
```

### ❌ Problem: Inconsistent Colors Between Systems

```typescript
// WRONG: Hardcoded colors in different places
// In tailwind.config.js
colors: {
  primary: {
    500: '#2196f3',
  }
}

// In custom-theme.scss
$primary-palette: (
  500: #1e88e5,
)
```

### ✅ Solution: CSS Variables as Single Source of Truth

```scss
// In :root or custom-theme.scss
:root {
  --color-primary-500: #2196f3;
}

// In tailwind.config.js
colors: {
  primary: {
    500: 'var(--color-primary-500)',
  }
}

// In custom-theme.scss
$primary-palette: (
  500: var(--color-primary-500),
)
```

## Layout Best Practices

1. **Page Structure with Tailwind**

```html
<div class="container mx-auto p-4 flex flex-col gap-6">
  <header class="mb-4">
    <h1 class="text-2xl font-bold text-primary-900">Page Title</h1>
  </header>
  
  <main class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Material components in each grid cell -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <mat-card class="custom-card">
        <!-- Card content -->
      </mat-card>
    </div>
  </main>
</div>
```

2. **Responsive Design**

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Responsive grid using Tailwind breakpoints -->
  <div class="col-span-1 sm:col-span-2 lg:col-span-1">
    <!-- Material components -->
  </div>
</div>
```

3. **Dark Mode Support**

```html
<div class="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
  <!-- Content with dark mode support via Tailwind -->
</div>
```

```scss
// In SCSS for Material components
.custom-material-component {
  // Light mode styles
  background-color: white;
  color: rgba(0, 0, 0, 0.87);
  
  @media (prefers-color-scheme: dark) {
    // Dark mode styles
    background-color: #333;
    color: white;
  }
}
```

## Form Styling Pattern

```html
<form class="space-y-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
  <h2 class="text-xl font-semibold mb-6">Form Title</h2>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <mat-form-field class="custom-form-field">
      <!-- Material form field content -->
    </mat-form-field>
  </div>
  
  <div class="flex justify-end mt-6">
    <button mat-button class="cancel-button mr-4">Cancel</button>
    <button mat-raised-button color="primary" class="submit-button">Submit</button>
  </div>
</form>
```

```scss
// In component SCSS
.custom-form-field {
  width: 100%;
  
  // Material overrides
  ::ng-deep {
    .mat-mdc-form-field-infix {
      width: 100%;
    }
    
    .mat-mdc-form-field-wrapper {
      padding-bottom: 1rem;
    }
  }
}

.cancel-button, .submit-button {
  @apply transition-all duration-200;
  
  &:focus-visible {
    @apply outline-2 outline-offset-2 outline-primary-500;
  }
}
```

## Component Library Pattern

When building reusable components, follow these patterns:

1. **Container Component Pattern**

```typescript
@Component({
  selector: 'app-data-card',
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ title }}</h3>
      </div>
      <div class="p-4">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DataCardComponent {
  @Input() title: string = '';
}
```

2. **Material Wrapper Pattern**

```typescript
@Component({
  selector: 'app-custom-button',
  template: `
    <button 
      mat-raised-button
      [color]="color"
      [disabled]="disabled"
      class="custom-button"
      [class.custom-button-large]="size === 'large'"
      [class.custom-button-small]="size === 'small'">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .custom-button {
      @apply rounded-md transition-all duration-200;
    }
    
    .custom-button-small {
      @apply text-sm px-3 py-1;
    }
    
    .custom-button-large {
      @apply text-lg px-6 py-3;
    }
  `]
})
export class CustomButtonComponent {
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
}
```

By following these integration patterns, we can effectively leverage both Angular Material components and Tailwind CSS styling while avoiding conflicts between the two systems. 