# UX/UI Improvement Plan

*Goal: Enhance the user experience and visual appeal of the Screenshot/Figma to Angular Code Generator, moving beyond the basic MVP interface to create a more intuitive, informative, and professional-looking tool.*

These improvements should be considered alongside the functional development outlined in `PHASE-2-ENHANCEMENTS.md` and `PHASE-3-FIGMA-INTEGRATION.md`.

## Key Areas for Improvement

### 1. Layout and Structure

*   **Current State (Likely):** Basic vertical stacking of elements (Input, Code, Preview). Minimal visual structure.
*   **Proposed Improvements:**
    *   **Multi-Column Layout:** Implement a responsive three-column layout (or similar):
        *   **Column 1 (Input):** Controls for image upload / Figma input.
        *   **Column 2 (Code):** Generated code display (using Monaco Editor).
        *   **Column 3 (Preview):** Rendered preview pane.
    *   **Technology:**
        *   Use Angular Material layout components (`MatToolbar` for header, potentially `MatSidenav` if navigation grows, `MatCard` for sections) or leverage TailwindCSS's responsive Flexbox/Grid utilities (`flex`, `grid`, `md:grid-cols-3`, `gap-4`, etc.).
    *   **Header:** Add a clean `MatToolbar` with the application title and potentially links or options.
    *   **Responsiveness:** Ensure the layout adapts gracefully to smaller screen sizes (e.g., columns stack vertically).

### 2. Input Controls

*   **Current State (Likely):** Basic `<input type="file">`. No clear indication of upload progress or selected file. Figma input TBD.
*   **Proposed Improvements:**
    *   **Image Upload:**
        *   Replace the default file input with a styled `MatButton` that triggers the hidden file input.
        *   Consider adding a dedicated drag-and-drop zone for image files, providing visual feedback on hover.
        *   Display the selected image filename and/or a small thumbnail preview *before* generation.
        *   Add clear instructional text (e.g., "Upload PNG, JPG, WEBP or drag image here").
    *   **Figma Input (Phase 3):**
        *   Provide clearly labeled input fields (`MatInput` within `MatFormField`) for the Figma URL and Personal Access Token (if using token auth).
        *   If implementing OAuth, provide a clear `MatButton` ("Connect Figma Account").
        *   Include helper text or tooltips (`matTooltip`) explaining where to find the URL/Token.

### 3. Feedback and State Management

*   **Current State (Likely):** Minimal feedback during processing. Errors might be cryptic or non-existent.
*   **Proposed Improvements:**
    *   **Loading States:** THIS IS CRITICAL.
        *   Show a loading indicator (`MatProgressSpinner` or `MatProgressBar`) prominently while the image is uploading and the AI/Figma processing is happening.
        *   Disable input fields and the "Generate" button during processing to prevent duplicate requests.
        *   Consider skeleton loaders (placeholders that mimic the final layout) for the code and preview areas while loading.
    *   **Success Feedback:**
        *   Use subtle confirmation (e.g., a brief `MatSnackBar` "Code generated successfully!") or simply populate the code/preview areas.
    *   **Error Handling:**
        *   Display user-friendly error messages. Don't show raw API errors directly to the user.
        *   Use `MatSnackBar` for transient errors or a dedicated error display area (e.g., using `MatCard` with error styling) for persistent issues.
        *   Provide context: "Failed to generate code from image. Please try again or use a different image." or "Invalid Figma URL or Token. Please check your input."
    *   **Clear Call to Action:** Ensure the primary action button ("Generate Code") is prominent (`mat-raised-button` with `color="primary"`).

### 4. Code Display

*   **Current State (Likely):** `<pre><code>` or basic Monaco Editor.
*   **Proposed Improvements (Leveraging Phase 2 Monaco Integration):**
    *   **Tabbed Interface:** Use `MatTabGroup` to neatly organize the generated TypeScript, HTML, and SCSS code into separate tabs within the "Code" column.
    *   **Copy Functionality:** Add a clear "Copy Code" `MatButton` (with a copy icon `<mat-icon>content_copy</mat-icon>`) within each code viewer/tab for easy copying. Provide visual feedback on successful copy (`MatSnackBar`).
    *   **Readability:** Ensure the Monaco Editor instances are configured with appropriate themes (light/dark based on user preference or default), line numbers, and word wrap.

### 5. Preview Pane

*   **Current State (Likely):** Basic `<iframe>` potentially breaking the layout flow.
*   **Proposed Improvements:**
    *   **Integration:** Embed the `<iframe>` smoothly within the dedicated "Preview" column. Use `MatCard` or similar to frame it.
    *   **Placeholder:** Display a clear message like "Preview will appear here after generation" when no preview is loaded.
    *   **(Phase 4 / Advanced):** Consider adding controls like a "Refresh Preview" button (if editing is enabled) or basic responsive view toggles (desktop/tablet/mobile iframe size).

### 6. Visual Design and Consistency

*   **Current State (Likely):** Basic HTML styling plus some Tailwind. Potentially inconsistent look and feel.
*   **Proposed Improvements:**
    *   **Leverage Material Theme:** Consistently apply the chosen Angular Material theme (e.g., Indigo/Pink) for components, colors, and typography. Ensure Material Typography is set up correctly (`ng add @angular/material`).
    *   **Tailwind for Polish:** Use Tailwind utility classes for fine-grained control over spacing (`p-`, `m-`, `gap-`), layout adjustments, and potentially overriding specific Material styles where necessary. Establish a consistent spacing scale.
    *   **Iconography:** Use Material Icons (`<mat-icon>`) consistently for buttons and actions to improve clarity.
    *   **Accessibility:** Pay attention to color contrast, focus states, and ARIA attributes, benefiting from Material Component defaults.

## Implementation Strategy

*   Integrate these UX/UI improvements *iteratively* alongside the development of Phase 2 and Phase 3 features.
*   **Prioritize:**
    1.  **Loading/Error Feedback:** Implement spinners, progress bars, and user-friendly error messages early in Phase 2.
    2.  **Improved Input Controls:** Enhance the image uploader as part of Phase 2. Design Figma input for Phase 3.
    3.  **Basic Layout:** Establish the multi-column structure early.
    4.  **Code Display Enhancements:** Implement tabs and copy buttons when integrating Monaco Editor (Phase 2).
    5.  **Visual Polish:** Apply consistent theming and spacing throughout.

By focusing on these areas, the application will become significantly more usable, trustworthy, and pleasant for developers to interact with.