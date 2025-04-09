# Task Breakdown: Full Angular Project Generation

This document details the tasks required to pivot the project towards generating a complete, downloadable Angular project, replacing the previous goal of code snippet generation and live preview. This targets Angular v19+ and Material v17+.

---

### Task ID: FPG-BE-1
**Title:** Overhaul Backend Prompt Engineering Strategy
**Status:** COMPLETED ✅

**Description:** Redesign the prompt sent to the VLM to support the generation of core component code suitable for integration into a full project structure, including conditional component splitting logic and adherence to strict configuration assumptions.

**Technical Solution/Approach:**
1.  Adopt the **Hybrid Approach:** Focus the VLM on generating application-specific code (root component, conditionally split child components, basic routing suggestions) rather than the entire project boilerplate.
2.  Update prompt instructions to reflect the goal of generating components for a full, runnable project.
3.  Reinforce all constraints: Angular v19+, Material v17+ (MDC), Tailwind exclusivity, standalone APIs.
4.  Incorporate explicit **Configuration Assumptions:** State clearly that standard Tailwind and Material v17+ configurations are assumed to be provided externally (by BE-3 Boilerplate).
5.  Mandate the **JSON Output Format:** Require the VLM to output a JSON object containing a `components` array (with `componentName`, `typescript`, `html`, `scss` for each) and potentially basic `routing` suggestions.
6.  Refine **Few-Shot Examples** to match the new JSON output format and demonstrate desired component structure (single vs. multi-component).
7.  Retain **Contextual Hints** (e.g., colors) and **Reasoning Guidance** (instructing AI to explain component structure choices).
8.  Tune API parameters (especially Temperature) for accuracy and consistency, considering model specifics (e.g., Gemini Flash).

**Location/Impacted Areas:**
* `backend/app/services/code_generator.py` (or equivalent prompt service)
* `backend/app/services/ai_service.py` (or VLM interaction service)

**Dependencies:** BE-3 (Defines the configuration assumptions for the prompt)

---

### Task ID: FPG-BE-2
**Title:** Implement Backend Project Assembly Service
**Status:** COMPLETED ✅

**Description:** Develop a backend service responsible for assembling the complete Angular project structure in memory, combining predefined boilerplate files with the AI-generated component code.

**Technical Solution/Approach:**
1.  Create a new service or expand an existing one (e.g., `project_assembler_service.py`).
2.  Define logic to load/access standard boilerplate file templates (Managed by BE-3).
3.  Implement functionality to create a virtual file system representation (e.g., nested dictionaries mapping paths to content).
4.  Populate this virtual structure with the boilerplate files, filling any necessary template variables (e.g., project name).
5.  Receive the parsed JSON data (from FPG-BE-4) containing the AI-generated components.
6.  Integrate the AI-generated code:
    * Create appropriate directories within `src/app/` for each generated component.
    * Write the `typescript`, `html`, and `scss` content to the corresponding files in the virtual structure.
    * Modify boilerplate files as needed for integration (e.g., update `src/app/app.component.html` to use the main generated component's selector, update `src/app/app.routes.ts` based on generated routing info or defaults).
    * Ensure component imports are handled correctly based on the generated structure.
7.  Return the complete virtual file system structure to the calling process (e.g., the API endpoint).

**Location/Impacted Areas:**
* `backend/app/services/` (New or existing service)
* Potential utility functions for file/directory manipulation.

**Dependencies:** FPG-BE-1 (Defines AI output format), FPG-BE-3 (Provides boilerplate), FPG-BE-4 (Provides parsed AI output)

---

### Task ID: FPG-BE-3
**Title:** Define and Manage Boilerplate Project Files
**Status:** COMPLETED ✅

**Description:** Define, create, and manage the content of all standard configuration and setup files required for a minimal, runnable Angular v19+/Material v17+/Tailwind CSS v3 project.

**Technical Solution/Approach:**
1.  Define the exact file structure and content for all necessary boilerplate files as listed in the technical guide (Section 5: Target Project Structure). This includes `package.json`, `angular.json`, `tailwind.config.js`, `postcss.config.js`, `tsconfig*.json`, `.gitignore`, `src/main.ts`, `src/index.html`, `src/styles.scss`, `src/app/app.config.ts`, `src/app/app.routes.ts`, `src/app/app.component.*`.
2.  Ensure `package.json` lists correct versions for all dependencies.
3.  Ensure `styles.scss` includes the correct Material theme import and Tailwind directives.
4.  Ensure `tailwind.config.js` is set up for content scanning.
5.  Ensure `app.config.ts` includes `provideAnimationsAsync`.
6.  Store these file contents securely and accessibly within the backend (e.g., as template files, string constants).
7.  Provide a mechanism for the Project Assembly Service (FPG-BE-2) to retrieve this boilerplate content.

**Location/Impacted Areas:**
* Backend configuration or template storage.
* Potentially a dedicated utility/service for accessing boilerplate.

**Dependencies:** None (Defines baseline for other tasks).

---

### Task ID: FPG-BE-4
**Title:** Update Backend JSON Output Parser
**Status:** COMPLETED ✅

**Description:** Modify the backend logic responsible for handling the VLM's response to parse and validate the new expected JSON format containing the `components` array (and potentially `routing`).

**Technical Solution/Approach:**
1.  Refactor the response handling logic in the service interacting with the VLM (e.g., `ai_service.py` or `code_generator.py`).
2.  Implement JSON parsing specifically for the defined structure: `{ "components": [ { "componentName": ..., "typescript": ..., ... } ], "routing": [...] }`.
3.  Add robust validation checks: ensure the response is valid JSON, the `components` array exists and contains valid component objects with all required properties. Validate `routing` structure if present.
4.  Implement error handling for parsing/validation failures, potentially triggering fallback logic or returning specific errors.
5.  Pass the validated data structure (e.g., list of component objects, routing info) to the Project Assembly Service (FPG-BE-2).

**Location/Impacted Areas:**
* `backend/app/services/ai_service.py` (or VLM interaction service)
* `backend/app/services/code_generator.py` (or orchestrating service)

**Dependencies:** FPG-BE-1 (Defines the expected JSON format)

---

### Task ID: FPG-BE-5
**Title:** Implement Backend Project Packaging Service

**Description:** Develop a backend service or utility to package the assembled virtual project file structure into a downloadable ZIP archive.

**Technical Solution/Approach:**
1.  Create a new utility function or service (e.g., `packaging_service.py`).
2.  Define a function that accepts the virtual file system structure (e.g., dictionary mapping paths to content) from the Assembly Service (FPG-BE-2).
3.  Use a suitable Python library (e.g., `zipfile`) to create a ZIP archive in memory.
4.  Iterate through the virtual file structure, adding each file and directory to the ZIP archive with the correct relative paths.
5.  Return the generated ZIP archive as an in-memory bytes object or stream.

**Location/Impacted Areas:**
* `backend/app/services/` or `backend/app/utils/`

**Dependencies:** FPG-BE-2 (Provides the file structure)

---

### Task ID: FPG-BE-6
**Title:** Modify Backend API Endpoint for File Download

**Description:** Update the primary code generation API endpoint to orchestrate the new workflow (VLM call, assembly, packaging) and return the generated ZIP archive as a file download.

**Technical Solution/Approach:**
1.  Modify the existing endpoint logic (e.g., `/generate-code`).
2.  Orchestrate the sequence: call VLM service -> get response -> call JSON parser (FPG-BE-4) -> call Project Assembler (FPG-BE-2) -> call Packaging Service (FPG-BE-5).
3.  Change the endpoint's response mechanism to return a file.
4.  Use the framework's specific method for returning file responses (e.g., FastAPI's `StreamingResponse` or `FileResponse`).
5.  Set appropriate HTTP headers:
    * `Content-Type: application/zip`
    * `Content-Disposition: attachment; filename="generated_angular_project.zip"`
6.  Stream the ZIP archive data (from FPG-BE-5) in the response body.
7.  Ensure proper error handling throughout the orchestration process, returning appropriate HTTP error statuses and messages if any step fails.

**Location/Impacted Areas:**
* `backend/app/api/v1/endpoints/generate_code.py` (or equivalent)

**Dependencies:** FPG-BE-1, FPG-BE-2, FPG-BE-4, FPG-BE-5

---

### Task ID: FPG-FE-1
**Title:** Update Frontend UI for Download Functionality

**Description:** Modify the generator page UI to remove preview/code display elements and replace the primary action with a project download mechanism.

**Technical Solution/Approach:**
1.  Remove UI components related to code viewing (e.g., Monaco editor instances via `CodeViewerComponent`) and live preview (e.g., `PreviewPaneComponent` containing iframe/StackBlitz/CodeSandbox).
2.  Update the main "Generate" button's text and associated action, or add a new button labeled "Generate & Download Project (.zip)".
3.  Retain input elements (image/Figma), multi-model selection UI (if applicable), loading indicators, and error display areas.

**Location/Impacted Areas:**
* `frontend/src/app/pages/generator-page/` (HTML & TS)

**Dependencies:** None

---

### Task ID: FPG-FE-2
**Title:** Implement Frontend API Call and File Download Handling

**Description:** Update the frontend API service call to expect a file blob response and implement logic in the component to trigger the browser's file download mechanism.

**Technical Solution/Approach:**
1.  Modify the relevant method in `ApiService` to specify the expected response type as a blob (e.g., `responseType: 'blob'` for Angular `HttpClient`).
2.  Update the component (`GeneratorPageComponent`) logic that calls this service method.
3.  On successful API response:
    * Receive the `Blob` object containing the ZIP file data.
    * Use browser APIs (`URL.createObjectURL`, creating an `<a>` element, setting its `href` and `download` attributes, and simulating a click) to initiate the file download prompt for the user with the filename `generated_angular_project.zip`.
    * Revoke the object URL after the download is initiated to free up resources (`URL.revokeObjectURL`).
4.  Implement robust error handling for the API call (e.g., displaying error messages received from the backend).

**Location/Impacted Areas:**
* `frontend/src/app/services/api.service.ts`
* `frontend/src/app/pages/generator-page/` (Component TS)

**Dependencies:** FPG-BE-6 (Provides the downloadable file endpoint)