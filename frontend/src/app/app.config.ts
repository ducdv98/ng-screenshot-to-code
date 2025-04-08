import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { MonacoLoaderService } from './services/monaco-loader.service';
import { ColorExtractionService } from './services/color-extraction.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    MonacoLoaderService,
    ColorExtractionService
  ]
};
