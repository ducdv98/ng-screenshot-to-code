import { Routes } from '@angular/router';
import { GeneratorPageComponent } from './pages/generator-page/generator-page.component';

export const routes: Routes = [
  { path: '', component: GeneratorPageComponent },
  { path: '**', redirectTo: '' }
];
