# Technical Guide: Implementing Advanced AI Code Generation with Live Preview

## 1. Overview & Goal

This document provides a comprehensive technical guide for significantly enhancing the "Angular Screenshot to Code Generator" project. The primary goals are:

1.  **Implement a True Live Preview:** Replace the current static preview with a fully interactive environment using StackBlitz SDK. (Addresses Requirement F6, Technical Challenge #7).
2.  **Improve Code Generation Accuracy & Structure:** Employ advanced prompt engineering techniques to generate more accurate, consistent, usable, and appropriately componentized Angular code using a Vision Language Model (VLM) like Gemini Flash.
3.  **Ensure Configurational Correctness:** Guarantee the generated code functions correctly by operating within a standard, predefined configuration context for Tailwind CSS and Angular Material.

## 2. Live Preview Implementation (StackBlitz SDK Integration)

### 2.1. Background & Justification
The current static `iframe srcdoc` preview cannot execute Angular logic or render Material components correctly. StackBlitz SDK allows embedding a full Angular CLI environment (via WebContainers) directly in the browser, providing a high-fidelity, interactive live preview. This approach offloads build complexity and offers better isolation compared to other methods previously considered (like Angular Elements or custom compilation pipelines).

### 2.2. Feasibility & Efficiency
* **Feasibility:** High. The SDK directly supports programmatic creation and embedding of Angular projects.
* **Efficiency:**
    * **Pros:** Accurate rendering, interactive preview, handles build process, good isolation.
    * **Cons:** External dependency, online requirement, potential initial load time, minor browser configuration edge cases possible. Overall, likely more efficient than building a custom live-preview solution.

### 2.3. Implementation Steps (Frontend)

1.  **Install SDK:**
    * `npm install @stackblitz/sdk --save` in the `frontend/` directory.
2.  **Prepare Project Files for SDK:**
    * **Location:** `frontend/src/app/components/preview-pane/` or a dedicated `PreviewService`.
    * **Logic:** Create a function `prepareStackBlitzProject(generatedComponents)` that takes the array of generated components (from the backend's JSON response).
    * This function must construct a StackBlitz `Project` object:
        * `title`: "Generated Component Preview".
        * `template`: `'angular-cli'`.
        * `files`: An object representing the virtual file system. This **must** include:
            * **Boilerplate Files (Static Standard Configs - CRITICAL):**
                * `package.json`: Defines dependencies (Angular core, Material, CDK, Tailwind, RxJS, Zone.js). *Ensure versions are appropriate.*
                * `angular.json`: Minimal valid config.
                * `tsconfig.json`: Standard config.
                * `tailwind.config.js`: Standard config scanning `src/**/*.{html,ts}` (See Section 4.1).
                * `src/main.ts`: Basic app bootstrap.
                * `src/index.html`: Basic `<app-root>`.
                * `src/styles.scss`: Imports Material theme and Tailwind directives (See Section 4.2).
                * `src/app/app.config.ts`: Provides necessary providers like `provideAnimationsAsync()` (See Section 4.2).
                * `src/app/app.component.ts/html/scss`: A basic root AppComponent shell that will likely host the *primary* generated component.
            * **Generated Component Files:** Iterate through the `generatedComponents` array from the backend. For each component:
                * Create necessary files like `src/app/[componentName]/[componentName].component.ts`, `.html`, `.scss`.
                * Populate these files with the `typescript`, `html`, and `scss` strings from the JSON object. Ensure correct relative paths if components import each other.
3.  **Embed the Preview:**
    * **Location:** `frontend/src/app/components/preview-pane/preview-pane.component.ts` and `.html`.
    * **HTML:** Replace the old `<iframe>` with `<div id="stackblitz-preview-container"></div>`.
    * **TypeScript:**
        * Import `sdk, { Project } from '@stackblitz/sdk';`.
        * When new generated code (JSON) is available:
            * Call `prepareStackBlitzProject(generatedCodeJson.components)` to get the `Project` object.
            * Call `sdk.embedProject('stackblitz-preview-container', project, options)`.
            * **Key Options:** `{ view: 'preview', openFile: 'src/app/main-generated-component/main-generated-component.component.html', height: 600 }` (Adjust `openFile` and `height`).
4.  **Cleanup:** Remove old `iframe` / `srcdoc` logic and `DomSanitizer` usage related to it.

## 3. Advanced Prompt Engineering Strategy

### 3.1. Goal
To instruct the VLM (e.g., Gemini Flash) to generate accurate, well-structured Angular code (potentially multiple components) that functions correctly within the standard configuration context provided to the preview environment.

### 3.2. Location for Implementation
* **Prompt Generation:** Primarily `backend/app/services/code_generator.py` (or equivalent).
* **API Interaction:** Backend service calling the VLM API (`ai_service.py` or similar) for parameters.

### 3.3. Core Prompt Components (Combine into a single coherent prompt)

1.  **Role Prompting:** Start by defining the AI's expertise.
    ```
    "You are an expert Angular developer specializing in creating pixel-perfect, well-structured components using Angular Material (Material 3) and Tailwind CSS utility classes."
    ```
2.  **Explicit Goal (with Conditional Component Splitting):** Clearly state the objective, including the componentization logic.
    ```
    "Analyze the provided user interface screenshot. Your goal is to generate the necessary Angular component(s) (TypeScript, HTML, SCSS) that accurately replicate the layout, structure, appearance, and components visible in the image. Critically evaluate the UI: if you identify distinct, self-contained, and potentially reusable sections (like cards, list items, forms, dialogs, sidebars, headers), generate them as separate child components. Otherwise, generate a single component."
    ```
3.  **Technology Stack & Constraints Reinforcement:** Be explicit and strict.
    ```
    "**Mandatory Requirements:**
    - Use Angular (latest stable version, assume standalone components).
    - Use Angular Material 3 components (`mat-button`, `mat-card`, `mat-form-field`, `mat-icon`, etc.) for standard UI elements where they semantically fit the image. DO NOT use older Material versions.
    - Use Tailwind CSS utility classes **exclusively** for ALL styling: layout (Flexbox, Grid), positioning, sizing, spacing (margins, padding), typography (font size, weight), colors, borders, shadows, etc.
    - DO NOT generate custom CSS classes in the SCSS file unless absolutely unavoidable for complex scenarios. Prioritize Tailwind utilities.
    - DO NOT use inline styles in the HTML template."
    ```
4.  **Configuration Assumptions (CRITICAL):** Tell the AI what to assume about the environment.
    ```
    "**Environment Assumptions:**
    - Assume a standard `tailwind.config.js` exists and is configured to scan `src/**/*.{html,ts}`.
    - Assume necessary Angular Material setup is done globally: packages installed, `provideAnimationsAsync()` called, and a theme CSS (e.g., `indigo-pink`) is imported in `styles.scss`.
    - Your task is to generate component code compatible with this standard setup. Focus on importing specific Material component modules (like `MatButtonModule`, `MatCardModule`) directly into the `imports` array of the generated standalone component's TypeScript file as needed."
    ```
5.  **Output Format Specification (JSON - CRITICAL):** Define the exact expected output structure.
    ```
    "**Output Format:** Provide the output STRICTLY as a single JSON object. This object must contain a `components` array. Each element in the array represents one generated Angular component and must have the following properties:
    - `componentName`: A suitable PascalCase name (e.g., 'UserProfileCard', 'ProductListItem', 'MainPage').
    - `typescript`: String containing the complete TypeScript code (`component.ts`).
    - `html`: String containing the complete HTML template (`component.html`).
    - `scss`: String containing the SCSS styles (`component.scss`).

    **Example JSON Output Structure:**
    ```json
    {
      \"components\": [
        {
          \"componentName\": \"UserAvatar\",
          \"typescript\": \"import { Component } from '@angular/core'; ...\",
          \"html\": \"<img src='...' alt='User Avatar' class='rounded-full'>\",
          \"scss\": \"/* ... */\"
        },
        {
          \"componentName\": \"UserProfileCard\",
          \"typescript\": \"import { Component } from '@angular/core';\\nimport { CommonModule } from '@angular/common';\\nimport { MatCardModule } from '@angular/material/card';\\nimport { UserAvatarComponent } from '../user-avatar/user-avatar.component'; ...\",
          \"html\": \"<mat-card>\\n  <app-user-avatar></app-user-avatar>\\n  ...\\n</mat-card>\",
          \"scss\": \"/* ... */\"
        }
        // ... potentially more components
      ]
    }
    ```
    **If generating multiple components, ensure the parent component's Typescript imports the child components correctly (using correct relative paths) and the HTML template uses the child component selectors (e.g., `<app-user-avatar>`).**"
    ```
6.  **Few-Shot Examples:** Include 2-3 high-quality examples *within the prompt* demonstrating:
    * Input image description/context.
    * Expected JSON output structure.
    * Both single-component and appropriate multi-component scenarios.
    * Correct imports and usage in multi-component examples.
    * Adherence to all constraints (Tailwind only, Material 3, standalone imports).
7.  **Contextual Hints (from Image Analysis):** Provide extracted information.
    ```
    "**Style Hints from Image Analysis:**
    - Use these colors where appropriate in your Tailwind classes: Primary: `#XXXXXX`, Accent: `#YYYYYY`, Background: `#ZZZZZZ`..."
    ```
8.  **Guide the AI's Reasoning Process (Chain-of-Thought):** Ask the AI to "think step-by-step".
    ```
    "**Process:**
    1.  First, analyze the image and identify the main UI elements and overall layout.
    2.  Critically assess if the UI contains distinct, self-contained sections suitable for separation into child components. Briefly explain your component structure decision (e.g., 'Detected a list of similar items, suggesting a child component `ItemCard` and a parent `ItemList`').
    3.  Based on your analysis and the decision on component structure, generate the required component(s) strictly in the specified JSON output format."
    ```

## 4. Configuration Files & Setup (Boilerplate - External to AI)

This section details the standard configuration the AI prompt assumes is present. This boilerplate **must be provided** by the backend logic when preparing the project environment (e.g., for StackBlitz).

1.  **Tailwind CSS (`tailwind.config.js`):**
    * **Content:**
        ```javascript
        /** @type {import('tailwindcss').Config} */
        module.exports = {
          content: ["./src/**/*.{html,ts}"], // Scans generated code
          theme: { extend: {} },
          plugins: [],
        }
        ```
2.  **Angular Material Setup:**
    * **`package.json`:** Must include `@angular/core`, `@angular/common`, `@angular/compiler`, `@angular/platform-browser`, `@angular/platform-browser-dynamic`, `@angular/forms`, `@angular/router`, `@angular/material`, `@angular/cdk`, `rxjs`, `zone.js`, `tailwindcss`.
    * **`src/styles.scss`:**
        ```scss
        @import '@angular/material/prebuilt-themes/indigo-pink.css'; /* Or chosen theme */
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        ```
    * **`src/app/app.config.ts`:**
        ```typescript
        import { ApplicationConfig } from '@angular/core';
        import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

        export const appConfig: ApplicationConfig = {
          providers: [ provideAnimationsAsync() ] // Essential for Material
        };
        ```
3.  **Core Angular Files:** Minimal `src/main.ts`, `src/index.html`, `src/app/app.component.ts/html/scss` to bootstrap the application.

## 5. API Parameter Tuning & Model-Specific Considerations (Gemini Flash)

* **General Tuning:** Systematically experiment. Document results.
* **Gemini Flash Specifics:**
    * **Temperature:** Start low (`0.1` - `0.3`) for accuracy.
    * **Top-P:** Consider low values (`< 0.95`) if needed.
    * **Strengths:** Leverage its ability to follow detailed, structured instructions (like the JSON format) and few-shot examples. Clarity is paramount.
    * **Expectations:** Excellent speed/cost, but may need more prompt guidance for extremely complex interpretations or component splitting decisions compared to Pro models. Test against others (per `multi-model-support.md`).

## 6. Implementation Considerations & Challenges

* **Boilerplate Management:** Ensuring the static config files are correctly included in the preview environment setup is critical.
* **JSON Parsing:** Backend requires robust parsing logic for the AI's JSON output. Handle potential errors gracefully.
* **Preview Complexity (Multi-Component):** Updating the StackBlitz integration (`prepareStackBlitzProject`) to handle an array of components, create the correct file structure, and potentially set up routing or parent-child relationships adds significant complexity to the frontend/preview task.
* **Component Naming/Imports:** AI-generated names and relative paths might need validation or post-processing.
* **Fallback Strategy:** Implement logic to handle cases where the AI fails to return valid JSON or usable code (e.g., retry with a simpler prompt asking for a single component).
* **Prompt Length:** The detailed prompt becomes long. Ensure it stays within the model's context window limits.

## 7. Task Breakdown Integration

* **Frontend - Implement StackBlitz SDK Integration:** New task covering steps in Section 2.3.
* **Backend - Refine Prompt Generation Logic (Task 2.1):** Update backend service (`code_generator.py`) to construct the detailed prompt described in Section 3.3.
* **Backend/Preview - Implement Boilerplate Configuration:** New essential task to manage and inject the static files from Section 4.
* **Backend - Implement JSON Output Parser:** New task for handling the AI's response format.
* **Frontend - Implement Multi-Component Preview:** New complex task to update StackBlitz integration logic (Section 2.3, step 2) to handle the JSON `components` array.

This comprehensive guide should provide a clear path forward for implementing the desired enhancements. Remember that iterative testing and refinement, especially with the prompt engineering and multi-component aspects, will be essential.