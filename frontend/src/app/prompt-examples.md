# Angular Code Generation Examples

This file provides practical examples of how to implement the prompt templates for generating Angular code with Tailwind CSS and Material integration.

## Component HTML Example

```html
<!-- Good example: Container with Tailwind, Material components with custom classes -->
<div class="flex flex-col p-4 gap-4">
  <!-- Card with proper wrapper pattern -->
  <div class="w-full">
    <mat-card class="custom-card">
      <mat-card-header>
        <mat-card-title>User Profile</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="flex flex-col">
            <span class="text-gray-600 text-sm">Username</span>
            <span class="font-medium">{{ user().username }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-gray-600 text-sm">Email</span>
            <span class="font-medium">{{ user().email }}</span>
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions class="flex justify-end p-4">
        <button mat-button color="primary" class="action-button">Edit Profile</button>
      </mat-card-actions>
    </mat-card>
  </div>

  <!-- Form with proper pattern -->
  <form class="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
    <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Contact Information</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <mat-form-field class="custom-form-field">
        <mat-label>First Name</mat-label>
        <input matInput placeholder="Enter first name">
      </mat-form-field>
      <mat-form-field class="custom-form-field">
        <mat-label>Last Name</mat-label>
        <input matInput placeholder="Enter last name">
      </mat-form-field>
    </div>
    <div class="flex justify-end mt-4">
      <button mat-raised-button color="primary" class="submit-button">Save Changes</button>
    </div>
  </form>
</div>
```

## Component SCSS Example

```scss
// Good example: Using @apply for Material component styling
:host {
  display: block;
}

// Custom card styling that works with Material
.custom-card {
  @apply rounded-lg shadow-md overflow-hidden transition-shadow duration-300;
  
  &:hover {
    @apply shadow-lg;
  }
  
  // Material-specific overrides using ::ng-deep (scoped to this component)
  ::ng-deep {
    .mat-mdc-card-header {
      @apply bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700;
    }
    
    .mat-mdc-card-title {
      @apply text-lg font-medium text-primary-700 dark:text-primary-300;
    }
  }
}

// Custom form field styling
.custom-form-field {
  width: 100%;
  
  ::ng-deep {
    .mat-mdc-form-field-infix {
      width: 100%;
    }
  }
}

// Button styling
.action-button, .submit-button {
  @apply transition-colors duration-200;
  
  &:focus-visible {
    @apply outline-2 outline-offset-2 outline-primary-500;
  }
}

// Accessibility improvements
@media (forced-colors: active) {
  .action-button:focus-visible,
  .submit-button:focus-visible {
    outline: 2px solid CanvasText;
  }
}
```

## Component TypeScript Example

```typescript
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserProfileService } from '../../services/user-profile.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {
  private userProfileService = inject(UserProfileService);
  
  // State management with signals
  user = signal<User | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Computed values
  isProfileComplete = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return false;
    return Boolean(
      currentUser.username && 
      currentUser.email && 
      currentUser.firstName && 
      currentUser.lastName
    );
  });
  
  constructor() {
    // Load initial data
    this.loadUserProfile();
    
    // Example of using effect for reactive logic
    effect(() => {
      // This will run whenever user() changes
      const profileStatus = this.isProfileComplete() 
        ? 'complete' : 'incomplete';
      console.log(`Profile status: ${profileStatus}`);
    });
  }
  
  loadUserProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.userProfileService.getUserProfile().subscribe({
      next: (userData) => {
        this.user.set(userData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.error.set('Failed to load user profile. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
  
  saveProfile(updatedUser: Partial<User>): void {
    const currentUser = this.user();
    if (!currentUser) return;
    
    // Immutable update pattern
    this.user.update(user => ({
      ...user!,
      ...updatedUser
    }));
    
    this.userProfileService.updateProfile(this.user()!).subscribe({
      next: (result) => {
        console.log('Profile updated successfully', result);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
      }
    });
  }
}
```

## tailwind.config.js Example

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Extract dominant colors from screenshot
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          // ... other shades
          500: 'var(--color-primary-500)',
          // ... other shades
          900: 'var(--color-primary-900)',
        },
        accent: {
          // ... accent color shades
          500: 'var(--color-accent-500)',
        },
        // ... other color palettes
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica Neue', 'sans-serif'],
        // ... other font families
      },
      borderRadius: {
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
      // ... other theme extensions
    },
  },
  plugins: [],
  darkMode: 'media', // Enable dark mode based on user preference
}
```

## custom-theme.scss Example

```scss
@use '@angular/material' as mat;
@use 'sass:map';

// Include the common styles for Angular Material
@include mat.core();

// Define color palettes based on screenshot extraction
$primary-palette: (
  50: var(--color-primary-50),
  100: var(--color-primary-100),
  // ... other shades
  500: var(--color-primary-500),
  // ... other shades
  900: var(--color-primary-900),
  contrast: (
    50: rgba(0, 0, 0, 0.87),
    // ... other contrasts
    500: white,
    // ... other contrasts
    900: white,
  )
);

// ... other color palettes

// Define the theme
$light-theme: mat.define-light-theme((
  color: (
    primary: mat.define-palette($primary-palette, 500),
    accent: mat.define-palette($accent-palette, 500),
    warn: mat.define-palette($warn-palette, 500),
  ),
  typography: mat.define-typography-config(
    $font-family: 'Roboto, "Helvetica Neue", sans-serif',
  ),
  density: 0,
));

$dark-theme: mat.define-dark-theme((
  color: (
    primary: mat.define-palette($primary-palette, 300),
    accent: mat.define-palette($accent-palette, 300),
    warn: mat.define-palette($warn-palette, 300),
  ),
  typography: mat.define-typography-config(
    $font-family: 'Roboto, "Helvetica Neue", sans-serif',
  ),
  density: 0,
));

// Apply the light theme by default
@include mat.all-component-themes($light-theme);

// Apply the dark theme only when the user prefers dark themes
@media (prefers-color-scheme: dark) {
  @include mat.all-component-colors($dark-theme);
}

// Define CSS variables for colors
:root {
  --color-primary-50: #{map.get($primary-palette, 50)};
  --color-primary-100: #{map.get($primary-palette, 100)};
  // ... other variables
}
``` 