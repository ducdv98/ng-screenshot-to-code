# Angular Performance Optimization Guide

This document provides specific strategies to ensure optimal performance when generating Angular code with Tailwind CSS.

## 🚀 Core Web Vitals Optimization

```
Implement these techniques to achieve excellent Core Web Vitals scores:

1. Largest Contentful Paint (LCP) < 2.5s
   - Use NgOptimizedImage for all key images
   - Implement content prioritization (above-the-fold content first)
   - Apply proper image sizing and lazy loading
   - Minimize CSS/JS bundle sizes with proper code splitting

2. First Input Delay (FID) / Interaction to Next Paint (INP) < 100ms
   - Avoid long-running JavaScript tasks
   - Use requestAnimationFrame for visual updates
   - Implement proper event debouncing and throttling
   - Minimize work in component lifecycle hooks

3. Cumulative Layout Shift (CLS) < 0.1
   - Always specify image dimensions using width/height
   - Use CSS aspect-ratio for responsive elements
   - Reserve space for dynamic content using min-height
   - Avoid dynamically injected content that shifts layout
```

## 🏎️ Angular-Specific Optimizations

### Change Detection Strategies

```typescript
// Use OnPush change detection for better performance
@Component({
  selector: 'app-data-display',
  templateUrl: './data-display.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataDisplayComponent {
  // Component implementation
}
```

### Zone-Less Angular

```typescript
// For performance-critical components
import { NgZone } from '@angular/core';

export class HighPerformanceComponent {
  private zone = inject(NgZone);
  
  handleFrequentEvent(): void {
    this.zone.runOutsideAngular(() => {
      // Code that doesn't require change detection
      // Use this.zone.run() only when UI updates are needed
    });
  }
}
```

### Angular Signals Optimization

```typescript
// Efficient signal derivation
// BAD: Creates new derived signal on every component instance
class BadComponent {
  count = signal(0);
  
  // Created on every component instance
  squared = computed(() => this.count() * this.count());
}

// GOOD: Reuse computation logic across instances
const createSquaredSignal = (count: Signal<number>) => 
  computed(() => count() * count());

class GoodComponent {
  count = signal(0);
  squared = createSquaredSignal(this.count);
}
```

## 🧩 Tailwind Optimization

### PurgeCSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  // Other config...
}
```

### Prioritize JIT Mode

```javascript
// Enable JIT mode in your Tailwind configuration
module.exports = {
  mode: 'jit',
  // Other config...
}
```

### Minimize Custom CSS

```scss
// Prefer Tailwind utility composition over custom CSS
// AVOID:
.custom-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.375rem;
  font-weight: 600;
}

// PREFER: Use utility classes in HTML
// <button class="px-6 py-3 bg-blue-500 text-white rounded-md font-semibold">Button</button>
```

## 📱 Mobile Performance

```typescript
// Implement Intersection Observer for better scroll performance
import { Directive, ElementRef, inject, NgZone } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit {
  private element = inject(ElementRef);
  private zone = inject(NgZone);
  
  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Element is visible, load content
            this.zone.run(() => {
              // Update component state here
            });
            observer.disconnect(); // Stop observing once loaded
          }
        });
      });
      
      observer.observe(this.element.nativeElement);
    });
  }
}
```

## 💾 Bundle Size Optimization

### Tree-Shaking Friendly Imports

```typescript
// BAD: Imports entire module
import * as _ from 'lodash';

// GOOD: Only import what you need
import { debounce } from 'lodash-es';
```

### Lazy Loading Routes

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];
```

### Dynamic Imports for Large Libraries

```typescript
// Load heavy libraries only when needed
async loadChartLibrary() {
  const { Chart } = await import('chart.js');
  this.createChart(Chart);
}
```

## 🧪 Real-World Performance Testing

```
Implement these performance testing practices:

1. Lighthouse CI
   - Set up Lighthouse CI in your CI/CD pipeline
   - Establish baseline scores and performance budgets
   - Block PRs that degrade performance beyond thresholds

2. User-Centric Metrics
   - Track real-user metrics with web-vitals.js or similar
   - Set up Performance API monitoring
   - Analyze performance by device and network class

3. Synthetic Testing
   - Test on low-end devices and throttled networks
   - Use WebPageTest for in-depth performance analysis
   - Create performance test cases for critical user flows
```

## 🔄 Runtime Performance Patterns

### Virtual Scrolling for Long Lists

```html
<!-- Use Angular CDK virtual scroll for large lists -->
<cdk-virtual-scroll-viewport itemSize="50" class="h-[400px]">
  <div *cdkVirtualFor="let item of items; trackBy: trackByFn" class="h-[50px]">
    {{item.name}}
  </div>
</cdk-virtual-scroll-viewport>
```

```typescript
// Always implement trackBy function for ngFor
trackByFn(index: number, item: any): any {
  return item.id; // unique identifier
}
```

### Efficient Rendering

```typescript
// Use async pipe to avoid manual subscription management
// template.html
<div *ngIf="users$ | async as users">
  <div *ngFor="let user of users; trackBy: trackById">
    {{user.name}}
  </div>
</div>

// component.ts
users$ = this.userService.getUsers().pipe(
  shareReplay(1) // Cache the result to avoid multiple HTTP requests
);
```

### Memory Leak Prevention

```typescript
export class DataComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Handle data
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 🧮 Computational Efficiency

### Memoization for Expensive Calculations

```typescript
import { memoize } from 'lodash-es';

export class DataProcessingComponent {
  // Memoize expensive calculations
  private calculateStatisticsMemoized = memoize(
    (data: DataPoint[]) => {
      // Complex calculation that shouldn't be repeated for same input
      return {
        average: data.reduce((sum, point) => sum + point.value, 0) / data.length,
        max: Math.max(...data.map(point => point.value)),
        min: Math.min(...data.map(point => point.value))
      };
    },
    // Optional resolver function to generate cache key
    (data: DataPoint[]) => JSON.stringify(data.map(d => d.id))
  );
  
  getStatistics(data: DataPoint[]): Statistics {
    return this.calculateStatisticsMemoized(data);
  }
}
```

### Web Workers for CPU-Intensive Tasks

```typescript
// In component
private worker: Worker;

constructor() {
  if (typeof Worker !== 'undefined') {
    this.worker = new Worker(new URL('./app.worker.ts', import.meta.url));
    this.worker.onmessage = ({ data }) => {
      // Handle processed data
      this.processedData.set(data);
    };
  }
}

processDataInWorker(data: any[]): void {
  if (this.worker) {
    this.worker.postMessage(data);
  } else {
    // Fallback for browsers without Worker support
    this.processedData.set(this.processDataSync(data));
  }
}
```

```typescript
// app.worker.ts
/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  // Perform CPU-intensive calculation
  const result = performCalculation(data);
  postMessage(result);
});

function performCalculation(data: any[]): any {
  // Complex calculation logic
  return processedData;
}
```

By implementing these performance optimization techniques, your Angular application with Tailwind CSS will deliver exceptional performance and user experience across all devices and network conditions. 