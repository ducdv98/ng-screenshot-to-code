# Development Plan: Phase 2 Enhancements

*Goal: Improve the quality, accuracy, and user experience of the existing image-to-code feature.*

This phase builds directly on the MVP (Phase 1) foundation.

## Tasks

### 1. Improve Prompt Engineering

*   **Goal:** Increase the accuracy and consistency of the VLM's generated code.
*   **Location:** Primarily `backend/app/services/code_generator.py` (prompt crafting logic) and potentially `backend/app/services/ai_service.py` (API interaction specifics).
*   **Steps:**
    *   **Review Current Prompt:** Analyze the existing prompt defined in `Development-Guide-Phased-Approach.json` (Phase 1 / AI Integration).
    *   **Few-Shot Examples:** Integrate examples of good input images and desired Angular Material/Tailwind output code directly into the prompt sent to the VLM.
    *   **Refine Constraints:** Be more explicit about:
        *   Using Material 3 components (`<mat-button>`, `<mat-card>`, `<mat-form-field>`, etc.) where appropriate.
        *   Using TailwindCSS utility classes *exclusively* for layout, color, typography, spacing, etc. (discourage custom CSS unless absolutely necessary).
        *   The desired output format (separate, clearly marked code blocks for `.ts`, `.html`, `.scss`).
        *   Handling basic layout structures (flexbox, grid).
    *   **Model Experimentation:** While keeping Gemini 1.5 Pro/Flash as primary, systematically test prompts with alternative models (e.g., Claude 3 Haiku/Sonnet, GPT-4V) on a benchmark set of images to compare output quality, structure, and cost. Document findings.
    *   **Parameter Tuning:** Experiment with VLM API parameters like `temperature` and `top_p` to balance creativity and predictability.

### 2. Integrate Advanced Code Editor

*   **Goal:** Provide a better experience for viewing and potentially editing the generated code.
*   **Location:** `frontend/src/app/components/code-viewer/` (or create if not existing), `frontend/src/app/pages/generator-page/generator-page.component.html`.
*   **Steps:**
    *   **Install Monaco Editor:** Add `ngx-monaco-editor` or a similar library to the frontend project (`npm install`).
    *   **Create/Update `CodeViewerComponent`:**
        *   Input properties for language (`typescript`, `html`, `scss`) and code content.
        *   Configure Monaco options (theme, read-only initially, word wrap, minimap, etc.).
        *   Ensure proper loading and display.
    *   **Replace `<pre>` Tags:** In `GeneratorPageComponent`, use multiple instances of the `CodeViewerComponent` to display the `.ts`, `.html`, and `.scss` code received from the backend.

### 3. Improve Preview Rendering

*   **Goal:** Make the static preview more visually accurate, reflecting Angular Material styles alongside Tailwind.
*   **Location:** `frontend/src/app/components/preview-pane/` (or create), `frontend/src/app/services/preview.service.ts` (optional helper service).
*   **Steps:**
    *   **Identify Approach:** Confirm the use of the "Client-Side Static Rendering" approach via `iframe` `srcdoc` as the most practical next step.
    *   **Enhance `srcdoc` Content:**
        *   When generating the HTML for the `srcdoc` attribute:
            *   Include the generated HTML structure.
            *   Include a `<link>` tag pointing to the TailwindCSS CDN (as likely done in Phase 1).
            *   **Crucially, add `<link>` tags pointing to the Angular Material theme CSS file(s).** You might need to host a prebuilt Material theme CSS file (e.g., `indigo-pink.css`) within your frontend's `assets` folder and reference it, or find a reliable CDN link for it.
            *   Inject the generated SCSS (compiled to CSS if possible, or just the Tailwind `@apply` directives if simple enough, though this might not work reliably without a build step within the iframe). *Initial focus should be getting HTML + Tailwind + Material Theme CSS working.*
    *   **Update `PreviewPaneComponent`:** Modify the component to construct and bind this enhanced `srcdoc` value to the `<iframe>` element. Ensure proper sanitization if using Angular's `[srcdoc]` binding.

### 4. Basic Style Extraction (Client-Side)

*   **Goal:** Provide the AI with color hints extracted directly from the uploaded image to potentially improve color accuracy in the generated code.
*   **Location:** `frontend/src/app/components/image-uploader/image-uploader.component.ts`, `frontend/src/app/pages/generator-page/generator-page.component.ts`, potentially modifying the payload sent by `frontend/src/app/services/api.service.ts`.
*   **Steps:**
    *   **Install Library:** Add a client-side color extraction library (e.g., `npm install color-thief-browser`).
    *   **Extract Colors:** In the `ImageUploaderComponent` or `GeneratorPageComponent`, after an image is selected/loaded:
        *   Use the library to get the dominant color and/or a small palette of colors from the image.
    *   **Include in API Request:** Modify the data sent to the backend `/api/generate-from-image` endpoint to include these extracted hex color codes.
    *   **Update Backend Prompt:** Modify the prompt generation logic in `backend/app/services/code_generator.py` to incorporate these suggested colors (e.g., "Use these colors where appropriate: primary=`#XXXXXX`, accent=`#YYYYYY`..."). *Note: Font detection is significantly harder and likely out of scope for this phase.*

---