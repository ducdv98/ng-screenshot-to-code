# Angular Screenshot-to-Code Master Prompt

This document serves as the comprehensive prompt for generating Angular code that leverages Tailwind CSS and Angular Material following best practices. Use this for the AI-powered screenshot-to-code generator.

---

## 📐 Overall Architecture Guidelines

When generating Angular code from screenshots:

1. **Analyze the visual design first**
   - Identify the layout structure (grid, flex)
   - Detect color schemes and typography
   - Identify UI components that map to Angular Material
   - Note responsive behavior cues

2. **Structure the project following Angular best practices**
   - Standalone components with explicit imports
   - Reactive state management with signals
   - Strong typing with interfaces
   - Clean separation of concerns

3. **Implement proper error handling and accessibility**
   - ARIA attributes
   - Keyboard navigation
   - Focus management
   - High contrast mode support
   - Error states and feedback

---

## 🎨 Styling Integration Strategy

### Tailwind CSS Usage

```
Generate Angular component code using these Tailwind CSS guidelines:
- Use Tailwind utility classes directly in HTML templates for layout, spacing, and basic styling
- Apply Tailwind's @apply directive in SCSS files only for component styles or repeated patterns
- Use responsive prefixes (sm:, md:, lg:, xl:) for adaptive layouts
- Keep Material component styling separate from Tailwind utilities
- Consistently use Tailwind's color system with our custom palette: primary-500, accent-400, etc.
- Leverage Tailwind's dark:* variants for automatic dark mode support
```

### Screenshot-Based Tailwind Configuration

```
Extract and configure Tailwind CSS from the screenshot with these specifications:
- Extract dominant colors from the screenshot and map to Material Design colors
- Define extracted colors in tailwind.config.js theme.extend.colors, following this pattern:
  primary: { 50: '#e3f2fd', ..., 900: '#0d47a1' }
- Create CSS variables in :root for each color to enable sharing between Tailwind and Angular Material
- Configure typography, spacing, and border-radius to match the screenshot aesthetics
- Set darkMode option to 'media' for automatic dark mode support
```

### Angular Material Theming

```
Configure Angular Material theming following v3 best practices:
- Extend Material Design palettes with custom colors in custom-theme.scss
- Use proper Material imports: '@angular/material' as mat
- Define themes with proper configuration:
  $my-theme: mat.define-light-theme((
    color: (primary: mat.define-palette($primary-palette)),
    typography: mat.define-typography-config(),
    density: 0
  ));
- Use CSS variables to ensure consistency between Material and Tailwind
- Apply component-specific theming with component mixins when needed
```

### Material-Tailwind Integration Rules

```
When combining Angular Material with Tailwind CSS:
- NEVER apply Tailwind utility classes directly to Material component tags
- ALWAYS create container elements with Tailwind classes for layout:
  <div class="flex justify-center p-4">
    <mat-card class="custom-card">...</mat-card>
  </div>
- Create custom classes for Material components:
  .custom-card {
    @apply rounded-lg shadow-md;
    // Material-specific overrides
  }
- Use consistent patterns from existing components
```

---

## 🧩 Component Structure

### HTML Template Pattern

```
<div class="container mx-auto p-4">
  <!-- Page Header -->
  <header class="mb-6">
    <h1 class="text-2xl font-bold text-primary-900">Page Title</h1>
    <p class="text-gray-600 dark:text-gray-300">Page description text</p>
  </header>
  
  <!-- Main Content -->
  <main class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <!-- Wrapper for Material component -->
      <mat-card class="custom-card">
        <!-- Material component content -->
      </mat-card>
    </div>
  </main>
  
  <!-- Conditional Elements -->
  @if (condition()) {
    <div class="mt-4 p-4 bg-amber-100 text-amber-800 rounded-md">
      Conditional content here
    </div>
  }
</div>
```

### SCSS Component Pattern

```scss
// Host element styling
:host {
  display: block;
}

// Custom Material component styling
.custom-card {
  @apply rounded-lg shadow-md overflow-hidden transition-shadow duration-300;
  
  &:hover {
    @apply shadow-lg;
  }
  
  // Material-specific overrides using ::ng-deep (scoped to component)
  ::ng-deep {
    .mat-mdc-card-header {
      @apply bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700;
    }
    
    .mat-mdc-card-title {
      @apply text-lg font-medium text-primary-700 dark:text-primary-300;
    }
  }
}

// Form field styling
.custom-form-field {
  width: 100%;
  
  ::ng-deep {
    .mat-mdc-form-field-infix {
      width: 100%;
    }
  }
}

// Accessibility improvements
@media (forced-colors: active) {
  .custom-button:focus-visible {
    outline: 2px solid CanvasText;
  }
}
```

### TypeScript Component Pattern

```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../services/data.service';
import { DataModel } from '../../models/data.model';

@Component({
  selector: 'app-feature-component',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
    // Other imports
  ],
  templateUrl: './feature-component.component.html',
  styleUrls: ['./feature-component.component.scss']
})
export class FeatureComponent {
  // Dependency injection
  private dataService = inject(DataService);
  
  // State management with signals
  data = signal<DataModel | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Computed values
  isDataValid = computed(() => {
    const currentData = this.data();
    return currentData !== null && Object.keys(currentData).length > 0;
  });
  
  constructor() {
    this.loadData();
  }
  
  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.dataService.fetchData().subscribe({
      next: (result) => {
        this.data.set(result);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error.set('Failed to load data. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
  
  updateData(newData: Partial<DataModel>): void {
    if (!this.data()) return;
    
    // Immutable update pattern
    this.data.update(current => ({
      ...current!,
      ...newData
    }));
    
    // API call with error handling
    this.dataService.updateData(this.data()!).subscribe({
      next: (result) => {
        console.log('Data updated successfully');
      },
      error: (err) => {
        console.error('Error updating data:', err);
        this.error.set('Failed to update data');
      }
    });
  }
}
```

---

## 🛠️ Package and Import Requirements

### Package Version Requirements

```
Ensure compatibility with these package versions:
- Angular ^19.2.0
- Angular Material ^19.2.8
- TailwindCSS ^3.4.17
- PostCSS ^8.5.3
- TypeScript ~5.7.2
- RxJS ~7.8.0
```

### Import Path Conventions

```
Follow strict import path conventions:
1. Angular core modules first
   import { Component, inject } from '@angular/core';

2. Angular common features
   import { CommonModule } from '@angular/common';

3. Angular Material components
   import { MatButtonModule } from '@angular/material/button';

4. Third-party libraries
   import { SomeLibrary } from 'some-library';

5. Application services/models (with relative paths)
   import { UserService } from '../../services/user.service';
   import { User } from '../../models/user.model';

6. Component imports (for multi-file components)
   import { ChildComponent } from './child/child.component';
```

---

## 🔄 State Management and Data Flow

### Signals for Reactive State

```typescript
// Define state with signals
someData = signal<DataType | null>(null);
isLoading = signal<boolean>(false);
error = signal<string | null>(null);

// Update state immutably
this.someData.update(current => ({
  ...current!,
  property: newValue
}));

// Computed values
derivedValue = computed(() => {
  const data = this.someData();
  if (!data) return 0;
  return data.items.length;
});

// Effects for side effects
constructor() {
  effect(() => {
    const count = this.derivedValue();
    console.log(`Count changed to ${count}`);
  });
}
```

### API Service Pattern

```typescript
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'api/endpoint';
  private http = inject(HttpClient);
  
  getData(): Observable<DataType[]> {
    return this.http.get<DataType[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API error', error);
    return throwError(() => new Error('Something went wrong. Please try again.'));
  }
}
```

---

## 🌈 Form Handling

### Reactive Forms Pattern

```typescript
// Component file
formGroup = new FormGroup({
  name: new FormControl('', [Validators.required, Validators.minLength(3)]),
  email: new FormControl('', [Validators.required, Validators.email])
});

// Submit handler with type safety
onSubmit(): void {
  if (this.formGroup.invalid) {
    this.formGroup.markAllAsTouched();
    return;
  }
  
  const formValue = this.formGroup.value as UserFormData;
  this.userService.updateUser(formValue).subscribe({
    next: (result) => {
      // Handle success
    },
    error: (err) => {
      // Handle error
    }
  });
}
```

### Form Template Pattern

```html
<form [formGroup]="formGroup" (ngSubmit)="onSubmit()" class="space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <mat-form-field class="custom-form-field">
      <mat-label>Name</mat-label>
      <input matInput formControlName="name" placeholder="Enter your name">
      <mat-error *ngIf="formGroup.controls.name.hasError('required')">
        Name is required
      </mat-error>
      <mat-error *ngIf="formGroup.controls.name.hasError('minlength')">
        Name must be at least 3 characters
      </mat-error>
    </mat-form-field>
    
    <mat-form-field class="custom-form-field">
      <mat-label>Email</mat-label>
      <input matInput formControlName="email" placeholder="Enter your email">
      <mat-error *ngIf="formGroup.controls.email.hasError('required')">
        Email is required
      </mat-error>
      <mat-error *ngIf="formGroup.controls.email.hasError('email')">
        Please enter a valid email
      </mat-error>
    </mat-form-field>
  </div>
  
  <div class="flex justify-end space-x-4">
    <button mat-button type="button" class="cancel-button">Cancel</button>
    <button 
      mat-raised-button 
      color="primary" 
      type="submit" 
      [disabled]="formGroup.invalid || isSubmitting"
      class="submit-button"
    >
      Submit
    </button>
  </div>
</form>
```

---

## 🎭 Accessibility Guidelines

```
Ensure accessibility with these practices:
- Use semantic HTML elements (heading levels, lists, etc.)
- Add descriptive text for screen readers with aria-label
- Implement keyboard navigation with tab order
- Provide visible focus indicators
- Include alt text for images
- Ensure proper color contrast ratios (WCAG AA min 4.5:1)
- Support high contrast mode
- Include fallback content for interactive elements

For Material components:
- Always provide aria-label for icon buttons
- Use proper labeling for form fields
- Include descriptive action text for buttons
```

---

## 🧪 Error Handling and Validation

```typescript
// Error handling pattern
fetchData(): void {
  this.isLoading.set(true);
  this.error.set(null);
  
  this.dataService.getData().subscribe({
    next: (result) => {
      this.data.set(result);
      this.isLoading.set(false);
    },
    error: (err) => {
      console.error('Error fetching data:', err);
      this.error.set(this.getErrorMessage(err));
      this.isLoading.set(false);
    }
  });
}

// Error message helper
private getErrorMessage(error: any): string {
  if (error.status === 404) {
    return 'The requested resource was not found. Please try again later.';
  } else if (error.status === 403) {
    return 'You do not have permission to access this resource.';
  } else if (error.status === 500) {
    return 'Server error. Please try again later.';
  }
  return 'An unexpected error occurred. Please try again.';
}
```

---

## 🚀 Performance Optimization

```
Implement these performance optimizations:
- Use NgOptimizedImage for image optimization
- Apply trackBy functions for ngFor loops
- Use the async pipe with RxJS observables
- Implement deferrable views for non-critical content
- Lazy load routes and components
- Use pure pipes for computed values
- Avoid direct DOM manipulation
- Optimize re-renders with OnPush change detection
```

---

Remember to adapt these guidelines based on specific project requirements and the screenshot's design. The goal is to generate high-quality Angular code that follows best practices while accurately recreating the UI design from the screenshot. 