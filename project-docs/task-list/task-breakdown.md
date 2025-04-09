# Task Breakdown: Advanced AI Code Generation & Live Preview Enhancements

This document outlines the specific tasks required to implement the enhanced AI code generation pipeline and the StackBlitz-based live preview feature, targeting Angular v19+ and Material v17+.

---

### Task ID: FE-1
**Title:** Implement StackBlitz SDK Integration for Live Preview
**Status:** Completed ✅

**Description:** Replace the current static HTML preview iframe with a fully interactive live preview environment powered by the StackBlitz SDK. This involves embedding a dynamic StackBlitz instance that can bootstrap and run the generated Angular component(s).

**Technical Solution/Approach:**
1.  Install and configure the `@stackblitz/sdk` package in the frontend application.
2.  Refactor the existing `PreviewPaneComponent` (or similar component). Remove the `iframe[srcdoc]` element and replace it with a `div` container designated for the StackBlitz embed.
3.  Implement logic (likely within the preview component or a dedicated service) to receive the generated component data (structured JSON) from the backend.
4.  Develop a function (`prepareStackBlitzProject`) responsible for dynamically constructing the `Project` object required by the StackBlitz SDK. This function must:
    * Assemble a virtual file system including:
        * Essential static boilerplate files (See BE-2: Boilerplate Configuration).
        * Generated component files (`.ts`, `.html`, `.scss`) correctly placed within the `src/app/` directory structure based on the JSON response.
        * Ensure correct relative import paths are set if multiple components reference each other.
    * Configure project settings like title and template (`angular-cli`).
5.  Utilize the `sdk.embedProject()` method, passing the target container element ID, the constructed `Project` object, and appropriate display options (e.g., default view set to 'preview', specific generated component file to open initially).
6.  Remove legacy code related to `iframe`, `srcdoc` generation, and associated sanitization.

**Location/Impacted Areas:**
* `frontend/src/app/components/preview-pane/`
* `frontend/src/app/services/` (Potentially a new `PreviewService` or updates to `api.service.ts`)
* `frontend/package.json`

**Dependencies:** BE-2, BE-3

---

### Task ID: BE-1
**Title:** Refine Backend Prompt Generation Logic
**Status:** Completed ✅

**Description:** Enhance the prompt generation service to incorporate advanced strategies aimed at improving AI code generation accuracy, structure (including conditional component splitting), and compatibility with Angular v19+/Material v17+.

**Technical Solution/Approach:**
1.  Modify the service responsible for crafting the prompt sent to the VLM (e.g., Gemini Flash).
2.  Incorporate all elements outlined in the "Advanced Prompt Engineering Strategy" section of the technical guide:
    * **Role Prompting:** Assign an expert Angular developer role.
    * **Explicit Goal:** Clearly state the objective, including conditional component splitting logic based on UI analysis.
    * **Technology Stack & Constraints:** Reinforce Angular v19+, Material v17+ (MDC), Tailwind exclusivity, standalone APIs, and styling interaction notes.
    * **Configuration Assumptions:** Explicitly state the assumed presence of standard Tailwind and Material configurations provided by the boilerplate.
    * **Output Format:** Strictly enforce the requirement for output as a structured JSON object containing a `components` array.
    * **Few-Shot Examples:** Embed high-quality examples demonstrating the desired JSON output, constraints, and component splitting scenarios.
    * **Contextual Hints:** Include data extracted from image analysis (e.g., dominant colors).
    * **Reasoning Guidance:** Instruct the AI to outline its analysis and component structure decisions before generating the JSON output.
3.  Implement logic to dynamically insert image context (and potentially other hints) into the prompt template.
4.  Review and refine prompt clarity, ensuring instructions are unambiguous and adhere to model context window limitations.

**Location/Impacted Areas:**
* `backend/app/services/code_generator.py` (or equivalent prompt generation service)
* `backend/app/services/ai_service.py` (or equivalent VLM interaction service)

**Dependencies:** BE-2 (Provides context for config assumptions)

---

### Task ID: BE-2
**Title:** Implement Boilerplate Configuration Generation/Management

**Description:** Create and manage the set of standard, static configuration files and basic application code required to form a functional Angular v19+/Material v17+ project context. This boilerplate is essential for both the AI's environmental assumptions and the StackBlitz preview environment.

**Technical Solution/Approach:**
1.  Define the content for essential boilerplate files based on Angular v19+/Material v17+ standards:
    * `package.json` (with correct dependencies and versions)
    * `angular.json` (minimal valid structure)
    * `tsconfig.json` (standard)
    * `tailwind.config.js` (configured for content scanning)
    * `src/main.ts` (bootstrapping standalone)
    * `src/index.html` (root container)
    * `src/styles.scss` (importing Material theme and Tailwind directives)
    * `src/app/app.config.ts` (providing `provideAnimationsAsync`)
    * `src/app/app.component.ts/html/scss` (minimal root component)
2.  Store these boilerplate file contents efficiently (e.g., as constants, templates, or separate files within the backend).
3.  Integrate this boilerplate into the logic that prepares the project structure for the StackBlitz preview (within the `prepareStackBlitzProject` function referenced in FE-1 and FE-2). Ensure these files form the base of the virtual file system before generated component files are added.
4.  Ensure the boilerplate content aligns perfectly with the assumptions stated in the AI prompt (BE-1).

**Location/Impacted Areas:**
* `backend/app/services/` (Potentially a new service or utility for managing boilerplate)
* Logic related to preparing the StackBlitz `Project` object (potentially Frontend or Backend depending on architecture).

**Dependencies:** None (Defines baseline for other tasks).

---

### Task ID: BE-3
**Title:** Implement JSON Output Parser & Validation

**Description:** Develop backend logic to reliably parse and validate the structured JSON response received from the VLM, which contains the generated component(s) data.

**Technical Solution/Approach:**
1.  Modify the backend service that receives the response from the VLM.
2.  Implement robust JSON parsing logic capable of handling the expected structure (`{ "components": [ { "componentName": "...", "typescript": "...", "html": "...", "scss": "..." } ] }`).
3.  Add validation checks:
    * Confirm the response is valid JSON.
    * Verify the presence and basic structure of the `components` array and its objects.
    * Check if essential properties (`componentName`, `typescript`, `html`, `scss`) exist for each component.
    * (Optional) Add basic sanity checks for code syntax if feasible.
4.  Implement error handling for parsing failures or validation errors (e.g., logging errors, returning specific error codes/messages to the frontend).
5.  Consider implementing fallback logic (e.g., if parsing fails, potentially retry the AI call with a simpler prompt requesting only a single component).
6.  Pass the successfully parsed and validated `components` array data to the frontend.

**Location/Impacted Areas:**
* `backend/app/services/ai_service.py` (or VLM interaction service)
* `backend/app/controllers/` (or API endpoint handling the response)

**Dependencies:** BE-1 (Defines the expected JSON format)

---

### Task ID: FE-2
**Title:** Enhance Frontend Preview to Handle Multi-Component Output

**Description:** Update the StackBlitz integration logic to correctly handle the JSON response containing potentially multiple generated components, structuring the virtual file system appropriately for the preview.

**Technical Solution/Approach:**
1.  Modify the `prepareStackBlitzProject` function (from FE-1) to accept the parsed `components` array from the backend (BE-3).
2.  Iterate through the `components` array. For each component object:
    * Dynamically determine the correct directory path within the virtual file system (e.g., `src/app/[component-name]/`). Create subdirectories as needed.
    * Add the `typescript`, `html`, and `scss` content to the `files` object under the correct file paths (e.g., `src/app/[component-name]/[component-name].component.ts`).
3.  Implement logic to handle potential parent-child relationships described in the generated code:
    * Ensure the root `AppComponent` (part of the boilerplate) is set up to display the primary generated component.
    * If multiple components are generated, ensure the file structure supports the relative import paths the AI *should* have generated (requires AI accuracy from BE-1). No complex dynamic module loading is needed if using standalone components correctly imported.
4.  Update the `sdk.embedProject` options if necessary (e.g., setting the `openFile` option to the main parent component).

**Location/Impacted Areas:**
* Frontend logic responsible for creating the StackBlitz `Project` object (likely in `PreviewPaneComponent` or `PreviewService`).

**Dependencies:** FE-1, BE-3, BE-2