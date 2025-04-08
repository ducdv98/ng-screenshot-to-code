# Enhancement: Implement Live Preview using StackBlitz SDK

## Goal
Replace the current static `iframe srcdoc` preview with a fully interactive, live preview environment powered by StackBlitz SDK and WebContainers. This aims to fulfill requirement F6 (Live Preview) and address Technical Challenge #7 (Live Preview Implementation).

## Background
The current preview mechanism renders the generated HTML structure styled with TailwindCSS and Angular Material theme CSS within an `iframe` using the `srcdoc` attribute. While providing a static visual representation, it cannot execute Angular logic, render dynamic Angular Material components correctly, or offer user interaction.

StackBlitz SDK allows embedding a complete development environment, capable of running Angular CLI builds and applications directly in the browser via WebContainers. This approach provides a high-fidelity, interactive preview without requiring complex server-side compilation or custom Angular Element wrapping.

## Technical Guide

1.  **Dependency Installation:**
    * Add the `@stackblitz/sdk` package to the frontend project's dependencies.
    * `npm install @stackblitz/sdk --save`

2.  **Project File Preparation:**
    * A utility function or method within the `PreviewPaneComponent` or a dedicated `PreviewService` needs to be created.
    * This function will take the generated code strings (TypeScript, HTML, SCSS) as input.
    * It must dynamically construct a `Project` object compatible with the StackBlitz SDK. This object includes:
        * `title`: e.g., "Generated Component Preview".
        * `template`: Set to `'angular-cli'`.
        * `files`: An object where keys are file paths (e.g., `src/main.ts`, `src/app/app.component.ts`, `package.json`, `angular.json`, `tailwind.config.js`, etc.) and values are the corresponding file contents as strings.
        * **Essential Files to Generate:**
            * `src/main.ts`: Basic Angular application bootstrap.
            * `src/index.html`: Basic `app-root` container.
            * `src/styles.scss`: Import Material theme, Tailwind directives, and *include the generated SCSS*.
            * `src/app/app.component.ts`: The generated TypeScript code.
            * `src/app/app.component.html`: The generated HTML code.
            * `src/app/app.config.ts`: Basic application configuration (e.g., `provideAnimationsAsync`).
            * `package.json`: Define core Angular, Material, CDK, Tailwind, RxJS, Zone.js dependencies. *Ensure versions align with the project's target stack.*
            * `angular.json`: Minimal valid Angular CLI configuration.
            * `tsconfig.json`: Standard Angular `tsconfig.json`.
            * `tailwind.config.js`: Basic Tailwind configuration enabling content scanning in `src/`.

3.  **Embedding the Preview:**
    * In the `PreviewPaneComponent`'s template (`preview-pane.component.html`), replace the existing `<iframe>` with a `<div>` element that will serve as the container for the StackBlitz embed (e.g., `<div id="stackblitz-preview-container"></div>`).
    * In the `PreviewPaneComponent`'s TypeScript file (`preview-pane.component.ts`):
        * Import the StackBlitz SDK: `import sdk, { Project } from '@stackblitz/sdk';`
        * When new code is generated and ready for preview:
            * Call the utility function from step 2 to get the `Project` object.
            * Call `sdk.embedProject('stackblitz-preview-container', project, options)`.
            * **Key Options:**
                * `openFile`: Specify a default file to show if the editor view is used (e.g., `src/app/app.component.html`).
                * `view`: Set to `'preview'` to show only the application preview by default.
                * `height`: Define the desired height for the embedded iframe.
                * `hideExplorer?`: Optionally hide the file explorer.
                * `forceEmbedLayout?`: Ensure the embed layout is used.

4.  **Cleanup:**
    * Remove the old `iframe` and `srcdoc` generation logic from the `PreviewPaneComponent` and any related services.

## Task Breakdown

### 3.1 Frontend - Install StackBlitz SDK
- **Goal**: Add the necessary SDK library to the project.
- **Location**: `frontend/`
- **Implementation**:
    - Run `npm install @stackblitz/sdk --save`.
    - Verify installation in `package.json`.

### 3.2 Frontend - Create StackBlitz Project Preparation Logic
- **Goal**: Implement the logic to assemble the file structure and content required by the StackBlitz SDK.
- **Location**: `frontend/src/app/components/preview-pane/` or create `frontend/src/app/services/preview.service.ts`.
- **Implementation**:
    - Define static content for boilerplate files (`main.ts`, `index.html`, `package.json`, `angular.json`, `tsconfig.json`, `tailwind.config.js`, `app.config.ts`). *Ensure dependency versions in `package.json` are appropriate.*
    - Create a function `prepareStackBlitzProject(generatedCode)` that takes generated TS, HTML, SCSS strings.
    - This function should merge the static boilerplate content with the generated code content into the `Project` object format required by `sdk.embedProject`. Pay close attention to file paths.
    - Inject generated SCSS content into the main `src/styles.scss` file string.

### 3.3 Frontend - Implement StackBlitz Embedding in Preview Pane
- **Goal**: Replace the existing iframe preview with the StackBlitz embedded preview.
- **Location**: `frontend/src/app/components/preview-pane/`
- **Implementation**:
    - Modify `preview-pane.component.html`: Replace `<iframe>` with `<div id="stackblitz-preview-container"></div>`.
    - Modify `preview-pane.component.ts`:
        - Import `sdk` and the `Project` type.
        - Inject `PreviewService` if created, or implement preparation logic locally.
        - In the method that receives generated code (e.g., `updatePreview(generatedCode)`):
            - Call `prepareStackBlitzProject(generatedCode)` to get the `project` object.
            - Call `sdk.embedProject('stackblitz-preview-container', project, { view: 'preview', height: 600 /* Adjust as needed */ })`.
        - Ensure this method is called whenever new code generation results are available.

### 3.4 Frontend - Remove Old Preview Logic
- **Goal**: Clean up obsolete code related to the `iframe srcdoc` preview.
- **Location**: `frontend/src/app/components/preview-pane/`, potentially related services.
- **Implementation**:
    - Delete code responsible for creating the HTML string for `srcdoc`.
    - Remove any `DomSanitizer` logic specifically used for `srcdoc`.
    - Remove the old `<iframe>` element and related bindings.

### 3.5 Documentation - Update Technology Stack
- **Goal**: Document the new dependency.
- **Location**: `project-docs/architecture/technology-stack.md`
- **Implementation**:
    - Add `@stackblitz/sdk` to the list of frontend libraries/tools, briefly describing its purpose (Live Preview).