# Task Breakdown: Live Preview Migration to CodeSandbox

This document outlines the specific tasks required to migrate the interactive live preview functionality from the previously planned StackBlitz SDK integration to using CodeSandbox embedding via its `define` API. This addresses issues encountered with StackBlitz while maintaining the core "Live Preview" requirement (F6).

---

### Task ID: CSB-FE-1 ✅ (COMPLETED)
**Title:** Replace StackBlitz SDK with CodeSandbox Iframe Embedding

**Description:** Remove the StackBlitz SDK dependency and modify the frontend preview component to embed CodeSandbox using an `<iframe>` element whose source URL will be dynamically generated.

**Technical Solution/Approach:**
1.  Uninstall the `@stackblitz/sdk` dependency from the frontend project.
2.  Modify the `PreviewPaneComponent` HTML template to use an `<iframe>` element instead of a `div` placeholder or the previous StackBlitz component host. Assign an ID to the iframe (e.g., `codesandbox-preview-iframe`).
3.  Update the `PreviewPaneComponent` TypeScript logic:
    * Remove any imports and service calls related to the StackBlitz SDK.
    * Inject Angular's `DomSanitizer`.
    * Implement logic to dynamically construct the full CodeSandbox `define` API URL (based on output from Task CSB-FE-2).
    * Use `DomSanitizer.bypassSecurityTrustResourceUrl` to sanitize the constructed URL before binding it to the `<iframe>`'s `[src]` attribute.
    * Manage the state of the sanitized `sandboxUrl` property in the component.

**Location/Impacted Areas:**
* `frontend/src/app/components/preview-pane/` (HTML & TS)
* `frontend/package.json`

**Dependencies:** CSB-FE-2

**References:**
* [CodeSandbox Embedding Options](https://codesandbox.io/docs/learn/legacy-sandboxes/embedding)

---

### Task ID: CSB-FE-2 ✅ (COMPLETED)
**Title:** Implement CodeSandbox Project Parameter Generation

**Description:** Develop the frontend logic to take the generated component data (JSON) and the standard boilerplate configuration, format it according to the CodeSandbox `define` API requirements, and generate the necessary URL parameters.

**Technical Solution/Approach:**
1.  Create or refactor a function (e.g., `prepareCodeSandboxParameters`) within the `PreviewPaneComponent` or a dedicated service. This function accepts the `components` array from the backend JSON response.
2.  Inside this function:
    * Assemble a file structure object representing the complete project, including both the static boilerplate files (from BE-2) and the dynamically generated component files placed in appropriate subdirectories (`src/app/...`).
    * **Implement File Parameterization:** Convert the file structure object into the specific format required by the CodeSandbox `/api/v1/sandboxes/define` endpoint's `parameters` query parameter.
        * Research and implement the required compression and encoding algorithm (e.g., likely LZ-String compression + Base64 encoding, needs verification via official CodeSandbox API documentation or reliable examples).
        * Install any necessary third-party libraries for this compression/encoding via npm.
    * Return the generated, encoded `parameters` string.
3.  Handle potential errors during the parameter generation process.

**Location/Impacted Areas:**
* `frontend/src/app/components/preview-pane/` (TS) or `frontend/src/app/services/`
* `frontend/package.json` (for potential compression library)

**Dependencies:** BE-2 (Provides boilerplate definitions), BE-3 (Provides JSON input)

**References:**
* [CodeSandbox Define API (via Gatsby Plugin - illustrates concept)](https://www.gatsbyjs.com/plugins/gatsby-remark-embedded-codesandbox/) - *Note: Direct CodeSandbox API documentation for `/define` should be consulted for exact parameter formatting/compression details during implementation.*

---

### Task ID: CSB-FE-3 ✅ (COMPLETED)
**Title:** Construct CodeSandbox Embed URL with Options

**Description:** Update the frontend logic to construct the final `<iframe>` source URL by combining the CodeSandbox `define` API base URL, the generated file parameters, and desired embed display options.

**Technical Solution/Approach:**
1.  Within the `PreviewPaneComponent`'s logic (after receiving the parameters string from CSB-FE-2):
    * Define the base URL: `https://codesandbox.io/api/v1/sandboxes/define`.
    * Define a query string containing desired embed options based on CodeSandbox documentation (e.g., `view=preview&editorsize=0&hidenavigation=1&theme=light&fontsize=14`). Select options to optimize for a preview-only experience.
    * Concatenate the base URL, the parameters string (prefixed with `?parameters=`), and the options string (prefixed with `&`) to form the complete URL.
    * Bind this URL to the `<iframe>` source after sanitization (as handled in CSB-FE-1).

**Location/Impacted Areas:**
* `frontend/src/app/components/preview-pane/` (TS)

**Dependencies:** CSB-FE-1, CSB-FE-2

**References:**
* [CodeSandbox Embedding Options](https://codesandbox.io/docs/learn/legacy-sandboxes/embedding)

---

### Task ID: CSB-TEST-1
**Title:** Test CodeSandbox Integration and Preview Accuracy

**Description:** Thoroughly test the migrated CodeSandbox live preview functionality across different browsers and with various generated component complexities.

**Technical Solution/Approach:**
1.  Test the end-to-end flow: uploading an image, generating code, and rendering the preview in the CodeSandbox iframe.
2.  Verify that the generated `define` API URL parameters are correctly formatted and accepted by CodeSandbox.
3.  Confirm that the embedded preview renders accurately, including Material components and Tailwind styles.
4.  Test with simple and complex generated components (including multi-component outputs if applicable).
5.  Check for errors in the browser console related to iframe loading or CodeSandbox errors.
6.  Verify embed options (hiding editor, navigation) are applied correctly.
7.  Assess preview loading performance.
8.  Test responsiveness if applicable.

**Location/Impacted Areas:**
* Entire application flow involving preview.

**Dependencies:** Completion of CSB-FE-1, CSB-FE-2, CSB-FE-3 and related backend tasks (BE-2, BE-3).

---

*(Note: Backend tasks like BE-2 (Implement Boilerplate Configuration) and BE-3 (Implement JSON Output Parser) remain essential but do not need changes specifically for migrating the *frontend* preview tool from StackBlitz to CodeSandbox, assuming the JSON structure remains the same.)*