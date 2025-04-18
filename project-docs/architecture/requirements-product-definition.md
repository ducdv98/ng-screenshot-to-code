# Requirements & Product Definition (RPD)

## Vision

To create a developer tool that accelerates Angular UI development by automatically converting visual inputs (screenshots, mockups, Figma designs) into clean, functional Angular components styled with Angular Material v3 and TailwindCSS.

## Target Users

Angular Developers (Frontend Engineers, Full-Stack Engineers working with Angular).

## Core Features

### F1: Image Input
Allow users to upload image files (PNG, JPG, WEBP) representing UI screenshots or mockups.

### F2: Figma Input
Allow users to input a Figma design URL and potentially provide API credentials (or use OAuth) to access and parse Figma designs.

### F3: AI-Powered Conversion (Image)
- Send the uploaded image to Google's Gemini 1.5 Pro/Flash (primary VLM choice for cost efficiency and performance).
- Optional fallbacks to other VLMs like OpenAI's GPT-4V or Anthropic's Claude when needed.
- Prompt the VLM to generate an Angular component structure (`.ts`, `.html`, `.scss`/`.css`) based on the image.
- Instruct the VLM to prioritize using Angular Material components where appropriate (e.g., identify buttons, cards, inputs).
- Instruct the VLM to use TailwindCSS classes for layout, spacing, typography, colors, and other styling, adhering to Material 3 design principles where applicable.
- Extract styles (colors, fonts) from the image to guide the AI.

### F4: Figma Data Conversion
- Parse the Figma file structure using the Figma API.
- Translate Figma nodes (frames, text, rectangles, auto-layouts) into corresponding HTML elements and Angular Material components.
- Map Figma styles (colors, typography, effects, layout constraints) to TailwindCSS classes. Handle Auto Layout to Flexbox/Grid conversions.

### F5: Code Generation
Generate separate files for the Angular component:
- `component-name.component.ts`: Basic component class structure with `@Component` decorator.
- `component-name.component.html`: HTML template using standard tags, Angular Material components (`<mat-button>`, `<mat-card>`, etc.), and Tailwind classes.
- `component-name.component.scss` (or `.css`): Primarily for Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`), potentially minimal component-specific overrides if unavoidable.

### F6: Live Preview
Render the generated Angular component in a sandboxed environment within the application for immediate visual feedback.

### F7: Code Display
Show the generated TypeScript, HTML, and SCSS/CSS code in editable code viewers (e.g., using Monaco Editor).

### F8: Style Accuracy
Attempt to match colors, font families, font sizes, and spacing as closely as possible to the input source.

## Non-Functional Requirements

### NFR1: Accuracy
Strive for high visual fidelity between the input and the generated output, while acknowledging that "pixel perfect" is aspirational, especially for image inputs. Figma inputs should yield higher accuracy.

### NFR2: Performance
AI processing time should be reasonable (within seconds to a minute). Preview rendering should be fast.

### NFR3: Usability
Intuitive interface for uploading/linking designs and viewing results.

### NFR4: Code Quality
Generated code should be clean, readable, and follow general Angular best practices (though complex logic won't be generated).

### NFR5: Scalability
Backend should handle concurrent requests to the AI service and Figma API efficiently.

## Success Metrics

- User adoption rate.
- Conversion success rate (percentage of inputs generating usable code).
- User satisfaction surveys/feedback.
- Average time saved per component generation (estimated). 