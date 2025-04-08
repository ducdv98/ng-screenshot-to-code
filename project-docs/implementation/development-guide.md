# Development Guide: Phased Approach

This document outlines the phased development approach for the Angular Screenshot to Code Generator.

## Phase 1: Core Image-to-Angular-Material-Tailwind Conversion

### 1. Setup Project
- Create Angular CLI project: `ng new angular-screenshot-to-code --standalone --ssr=false` (or use Nx).
- Add Angular Material: `ng add @angular/material` (ensure Material 3 theme).
- Setup TailwindCSS: Follow the official Tailwind guide for Angular (`npm install -D tailwindcss postcss autoprefixer`, configure `tailwind.config.js`, `postcss.config.js`, `styles.scss`).

### 2. Basic UI
- Create a simple UI with:
  - An image upload component (`<input type="file">`).
  - Placeholders for code display.
  - A placeholder for the preview.

### 3. Backend Endpoint (Image Processing)
- Setup a basic Node.js/Express or Python/FastAPI backend.
- Create an endpoint (`/api/generate-from-image`) that accepts POST requests with image data (e.g., multipart/form-data).

### 4. AI Integration (Backend)
- Install Google Generative AI SDK as primary AI service (`@google/generative-ai` npm package or `google-generativeai` Python package).
- Optionally install alternative AI SDKs (OpenAI/Anthropic) as fallbacks.
- In the endpoint:
  - Receive the image.
  - Convert image to base64.
  - Craft an initial **detailed prompt** specifying the goal: "Analyze this image. Generate an Angular component (.ts, .html, .scss) that replicates the layout and appearance. Use Angular Material components (like mat-button, mat-card, mat-input-field) where appropriate. Use TailwindCSS classes for all styling (layout, colors, typography, spacing). Provide the output as three separate code blocks for component.ts, component.html, and component.scss."
  - Send the image and prompt to the Gemini API (or fallback VLM API if needed).
  - Receive the text response.

### 5. Frontend-Backend Communication
- Frontend calls the backend API upon image upload.
- Frontend receives the generated code strings.

### 6. Display Code
- Use `<pre><code>` tags initially to display the raw code strings received from the backend.

### 7. Basic Preview (Iframe)
- Create an `<iframe>` element.
- Generate basic HTML containing the generated HTML structure and link to TailwindCSS (either via CDN for simplicity initially, or ideally inject the necessary generated CSS). Use the `srcdoc` attribute of the iframe. *Note: This won't render Angular Material components correctly initially, it will just show the HTML structure styled by Tailwind.*

### 8. Refinement
- Iteratively improve the VLM prompt based on results. Add more constraints, examples, and desired formatting.
- Focus on getting *some* Angular Material components and Tailwind classes generated correctly.

## Phase 2: Enhancing Accuracy, Preview, and UI

### 1. Improve Prompt Engineering
- Experiment heavily with prompts for Gemini 1.5 Pro/Flash models. Include examples of desired output format (few-shot). Specify Material 3 usage. Emphasize Tailwind utility classes.
- If needed, try different VLM models (like Claude or GPT-4V) to compare results and cost, but maintain Gemini as the primary choice.

### 2. Integrate Code Editor
- Replace `<pre>` tags with Monaco Editor instances for better code highlighting, formatting, and potential editing.

### 3. Improve Preview
- Investigate methods for a more accurate Angular preview. Options:
  - **Server-side Compilation (Complex):** Have the backend attempt to compile the generated Angular component and serve a preview. Difficult and potentially slow/resource-intensive.
  - **Web Components/Angular Elements (Medium):** Wrap the generated component as an Angular Element and load it dynamically. Requires build steps.
  - **Client-Side Static Rendering (Simpler):** Improve the iframe `srcdoc` approach. Generate the HTML part and include a link to the Tailwind CDN *and* the Angular Material CSS theme file. This renders static HTML styled correctly but without Angular interactivity or component logic. *This is often the most practical starting point.*

### 4. Style Extraction (Basic)
- Experiment with client-side JavaScript libraries (e.g., `color-thief`) to extract dominant colors from the image *before* sending to the AI. Include these colors in the prompt to guide the AI's color choices. Font detection from images is much harder.

## Phase 3: Figma Integration

### 1. Figma API Setup
- Register a Figma App to get API credentials.
- Implement OAuth flow for users to grant access OR allow users to input their Figma personal access token and file URL.

### 2. Backend Figma Processing
- Add a new backend endpoint (`/api/generate-from-figma`).
- Use a Figma API client library (e.g., `figma-js`) to fetch the file structure (nodes, styles) based on the provided URL and token.

### 3. Figma-to-Code Mapping Logic
- This is the core challenge here. Develop a parser/translator:
  - Iterate through Figma nodes (CANVAS -> FRAME -> GROUP/RECTANGLE/TEXT etc.).
  - Map Figma node types to HTML tags or Angular Material components (e.g., TEXT -> `<span>`/`<p>`, RECTANGLE + TEXT -> `<mat-button>`, Auto Layout FRAME -> `<div class="flex...">`.
  - Map Figma styles (fills, strokes, text properties, effects) to corresponding TailwindCSS classes. Use Figma's design token information if available.
  - Handle Auto Layout properties (direction, spacing, padding) by mapping them to Flexbox/Grid Tailwind utilities.
  - Generate the `.ts`, `.html`, `.scss` files based on this structured translation.

### 4. Frontend UI
- Add UI elements for Figma input (URL, token/OAuth button).
- Connect UI to the new backend endpoint.

## Phase 4: Polish, Testing & Advanced Features

### 1. Error Handling
- Implement robust error handling for API calls (Gemini AI, Figma), image processing, and code generation.

### 2. User Experience
- Refine loading states, progress indicators, clear error messages.

### 3. Code Editing & Refinement
- Allow users to edit the generated code directly in the Monaco editors and update the preview.

### 4. Component Splitting (Advanced)
- Explore techniques (potentially rule-based or another AI prompt) to suggest how the generated code could be split into smaller, reusable components.

### 5. Testing
- **Unit Tests:** For utility functions, Figma mapping logic (where possible).
- **Integration Tests:** For frontend-backend communication.
- **E2E Tests:** Simulate user flows (upload image -> check for code output). Testing the *accuracy* of AI output automatically is very hard. Visual regression testing on the preview might catch major layout breaks.

### 6. Optimization
- Optimize backend response times, frontend rendering performance. Manage API costs. 