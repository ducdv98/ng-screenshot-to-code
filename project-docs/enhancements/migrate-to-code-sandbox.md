# Technical Documentation: Migrating Live Preview from StackBlitz to CodeSandbox

## 1. Introduction & Goal

This document details the required steps to migrate the live preview implementation from using the StackBlitz SDK to using CodeSandbox. This change is prompted by issues encountered with the StackBlitz integration. The goal remains to provide a high-fidelity, interactive live preview environment for the generated Angular code (Requirement F6), now leveraging CodeSandbox's embedding capabilities.

## 2. Background & Chosen Approach (CodeSandbox)

CodeSandbox provides embedding features, primarily through `<iframe>` elements. Crucially, it offers a specific endpoint (`/api/v1/sandboxes/define`) designed for programmatically creating sandboxes by defining project files via URL parameters. This allows us to dynamically generate a CodeSandbox instance containing the AI-generated code and embed it for preview.

We will migrate from the `@stackblitz/sdk` JavaScript approach to constructing an appropriate `<iframe>` URL targeting the CodeSandbox `define` API endpoint, passing the project files and desired embed options as parameters.

## 3. Migration Steps

### 3.1. Dependency Changes

* **Remove StackBlitz SDK:** Uninstall the `@stackblitz/sdk` package from the frontend project:
    `npm uninstall @stackblitz/sdk`
* **Add Compression/Parameterization Library (If Necessary):** The CodeSandbox `define` API likely requires project files to be compressed and formatted into URL parameters. Research and potentially add a library (e.g., for LZ-String compression or similar, matching the method used by CodeSandbox's API - specific details need to be confirmed via CodeSandbox API documentation) to handle this formatting.
    `npm install [library-name-for-codesandbox-parameterization]`

### 3.2. Modify Project File Preparation Logic

* **Location:** `frontend/src/app/components/preview-pane/` or the dedicated `PreviewService`.
* **Refactor `prepareStackBlitzProject` to `prepareCodeSandboxParameters`:**
    1.  This function still receives the array of generated components (JSON) from the backend.
    2.  It still needs to assemble a complete file structure object including:
        * **Boilerplate Files:** Standard Angular v19+/Material v17+ config files (`package.json`, `angular.json`, `tailwind.config.js`, `src/main.ts`, `src/styles.scss`, `src/app/app.config.ts`, etc.) as defined previously. Ensure `package.json` includes necessary dependencies for the preview.
        * **Generated Component Files:** Place the generated `typescript`, `html`, and `scss` content into the correct paths within the file structure object (e.g., `src/app/[component-name]/...`).
    3.  **(*) Format for `define` API:** Convert the file structure object into the specific format required by the CodeSandbox `/api/v1/sandboxes/define` endpoint. This typically involves:
        * Creating an object where keys are file paths and values are file content strings.
        * **Compressing and encoding** this object into URL query parameters (e.g., often a single `parameters` query param) using the method CodeSandbox expects (e.g., LZ-String compression followed by Base64 encoding, as hinted by). **Verification of the exact algorithm is required from CodeSandbox API documentation.**
    4.  Return the generated URL parameter string (e.g., `parameters=...`).

### 3.3. Update Embedding Logic

* **Location:** `frontend/src/app/components/preview-pane/preview-pane.component.ts` and `.html`.
* **HTML:** Ensure the container for the preview is an `<iframe>` element (or update the `div` from the previous plan back to an `iframe`).
    `<iframe id="codesandbox-preview-iframe" [src]="sandboxUrl" style="width: 100%; height: 600px; border: 0;"></iframe>`
* **TypeScript:**
    1.  Remove imports and usage of the StackBlitz SDK (`sdk.embedProject`).
    2.  When new generated code (JSON) is available:
        * Call `prepareCodeSandboxParameters(generatedCodeJson.components)` to get the compressed file parameter string.
        * Construct the full `<iframe>` `src` URL:
            * Base URL: `https://codesandbox.io/api/v1/sandboxes/define`
            * Add the generated file parameters (e.g., `?parameters=...`).
            * Add desired CodeSandbox embed optionsas additional query parameters (e.g., `&view=preview&editorsize=0&hidenavigation=1&fontsize=14&theme=light`). Common options include:
                * `view`: `editor` | `preview` | `split` (default: `split` or `preview` on small screens) -> Use `preview`.
                * `editorsize`: Percentage size of editor (0-100) -> Use `0`.
                * `hidenavigation`: `0` | `1` -> Use `1`.
                * `fontsize`: Number (px).
                * `theme`: `dark` | `light`.
                * `initialpath`: URL path to load in the preview window.
                * `module`: File path to open by default if editor is visible.
        * Bind the constructed URL to the `sandboxUrl` property used by the `<iframe>`'s `[src]` attribute. Use Angular's `DomSanitizer` to trust the URL:
          ```typescript
          import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
          // ...
          sandboxUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
          // ...
          constructor(private sanitizer: DomSanitizer) {}
          // ...
          updatePreview(generatedCodeJson: any) {
             const parameters = this.prepareCodeSandboxParameters(generatedCodeJson.components);
             const baseUrl = '[https://codesandbox.io/api/v1/sandboxes/define](https://codesandbox.io/api/v1/sandboxes/define)';
             // Construct options query string carefully
             const options = 'view=preview&editorsize=0&hidenavigation=1&theme=light';
             const fullUrl = `${baseUrl}?${parameters}&${options}`;
             this.sandboxUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
          }
          ```

## 4. Implementation Considerations

* **`define` API Parameter Format:** The exact method for compressing and encoding files into the `parameters` query parameter is critical and must be confirmed from official CodeSandbox documentation or community examples. This is the main technical risk/unknown.
* **URL Length Limits:** Extremely large projects might exceed browser URL length limits when using the GET-based `define` API. Test with complex generated outputs.
* **Embed Options:** Experiment with CodeSandbox embed optionsto achieve the desired preview appearance (hiding code editor, navigation, etc.).
* **Error Handling:** The `define` API might return errors if parameters are malformed. The `<iframe>` might show a CodeSandbox error page. Frontend error handling might be limited to detecting if the iframe fails to load correctly.

## 5. Task Breakdown Updates

The previous task breakdown needs adjustment:

* **FE-1 (Implement StackBlitz SDK Integration):** Replace with **FE-1 (Implement CodeSandbox Embedding)**. Description and Approach updated per Sections 3.1, 3.3 above. Requires `DomSanitizer`.
* **FE-2 (Enhance Frontend Preview for Multi-Component Output):** Update `prepareCodeSandboxParameters` function (instead of `prepareStackBlitzProject`) to handle component array and **implement the required file parameterization/compression** for the `define` API. This task becomes more complex due to the parameterization step.
* **BE-2 (Implement Boilerplate Configuration):** No change in goal, still provides essential static files needed for the project structure passed to CodeSandbox.
* **Other Tasks:** (Prompt generation, JSON parsing etc.) remain largely unchanged as they are independent of the specific preview embedding tool.

This migration replaces the JavaScript SDK interaction with URL construction and potentially complex parameter formatting for the CodeSandbox `define` API. Thorough testing of the parameter generation and resulting embedded preview is essential.