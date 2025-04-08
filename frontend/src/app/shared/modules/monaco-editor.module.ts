import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeEditorModule } from '@ngstack/code-editor';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CodeEditorModule.forRoot({
      baseUrl: 'assets/monaco-editor',
      typingsWorkerUrl: 'assets/monaco-editor/min/vs/language/typescript/lib/typingsWorker.js'
    })
  ],
  exports: [
    CodeEditorModule
  ]
})
export class MonacoEditorModule { } 