# Project Roadmap: Screenshot/Figma to Angular Code Generator

This document outlines the planned development phases following the successful completion of the Minimum Viable Product (MVP - Phase 1).

## Current Status (Post-MVP / Phase 1 Complete)

*   **Image Input:** Users can upload images (PNG, JPG, WEBP).
*   **AI Conversion:** Backend uses Google Gemini (primarily) to analyze the image and generate Angular component code (.ts, .html, .scss) using Angular Material and TailwindCSS.
*   **Code Display:** Generated code is displayed using basic `<pre><code>` tags (or potentially an initial Monaco Editor integration if Task 1.3 was fully realized).
*   **Basic Preview:** A static HTML preview is rendered in an `iframe` using `srcdoc`, styled with Tailwind via CDN (limited accuracy, no Angular logic).
*   **Tech Stack:** Angular frontend, FastAPI backend.

## Next Steps

### Focus Area 1: Enhance Core Conversion & Preview (Phase 2)

*Goal: Improve the quality, accuracy, and user experience of the existing image-to-code feature.*

*   **Improve Prompt Engineering:**
    *   Experiment with Gemini 1.5 Pro/Flash prompts (few-shot examples, detailed constraints).
    *   Specify Material 3 usage explicitly.
    *   Compare results/costs with alternative VLMs (Claude, GPT-4V) if necessary.
*   **Integrate Advanced Code Editor:**
    *   Replace basic code display with Monaco Editor for syntax highlighting, formatting, and potential editing capabilities.
*   **Improve Preview Rendering:**
    *   Enhance the `iframe` preview to link Angular Material CSS themes alongside Tailwind for better static visual fidelity.
    *   Investigate (but likely defer) more complex solutions like server-side compilation or Angular Elements.
*   **Basic Style Extraction:**
    *   Implement client-side color extraction (e.g., using `color-thief`) to inform the AI prompt.

*Reference: See `phase-2-enhancements.md` for details.*

### Focus Area 2: Implement Figma Integration (Phase 3)

*Goal: Add Figma designs as a primary input source for code generation.*

*   **Figma API Setup:** Implement authentication (OAuth or Personal Access Token).
*   **Backend Figma Processing:** Create a new API endpoint and service to fetch and parse Figma file data using the Figma API.
*   **Develop Figma-to-Code Mapping Logic:** Translate Figma nodes (Frames, Text, Rectangles, Auto Layout) and styles into corresponding HTML elements, Angular Material components, and TailwindCSS classes. This is a complex core task.
*   **Frontend UI:** Add UI elements for Figma URL input and authentication.

*Reference: See `phase-3-figma-integration.md` for details.*

### Focus Area 3: Polish, Testing & Advanced Features (Phase 4)

*Goal: Improve robustness, user experience, and add advanced capabilities.*

*   **Error Handling:** Implement comprehensive error handling across the stack (AI API calls, Figma API calls, internal processing).
*   **User Experience:** Refine loading states, progress indicators, and error messages.
*   **Code Editing:** Enable users to edit the generated code in Monaco and update the preview.
*   **Testing:** Implement unit, integration, and E2E tests. Explore visual regression testing for the preview.
*   **Optimization:** Address performance bottlenecks and manage API costs.
*   **(Advanced):** Explore component splitting suggestions.

*These items can be integrated throughout development or tackled as a distinct phase.* 