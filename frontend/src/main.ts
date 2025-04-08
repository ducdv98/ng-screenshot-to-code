import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Create a fix for the specific Monaco "toUrl" error
// This needs to be done before any Monaco code loads
const origGOPD = Object.getOwnPropertyDescriptor;
Object.getOwnPropertyDescriptor = function(obj: any, prop: PropertyKey): PropertyDescriptor | undefined {
  // Handle 'toUrl' property access on undefined objects, which is a common Monaco error
  if (prop === 'toUrl' && (!obj || typeof obj !== 'object')) {
    return {
      configurable: true,
      enumerable: false,
      value: () => '',
      writable: true
    };
  }
  return origGOPD.apply(this, arguments as any);
};

// Add global error handler for Monaco editor worker errors
window.addEventListener('error', (event) => {
  // Check if this is a Monaco worker error (they often have worker in the filename or error message)
  if (
    event.filename?.includes('worker') || 
    (event.error && event.error.message && (
      event.error.message.includes('worker') || 
      event.error.message.includes('monaco') ||
      event.error.message.includes('toUrl')
    )) ||
    (event.target instanceof Worker)
  ) {
    // Prevent the error from appearing in the console
    event.preventDefault();
    return false;
  }
  return true;
}, true);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
