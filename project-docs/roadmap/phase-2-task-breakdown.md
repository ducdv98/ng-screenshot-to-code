# Phase 2 Task Breakdown: Enhancements & UX Improvements

## Phase Goal
Improve the accuracy, preview fidelity, and user experience of the core image-to-Angular-code feature. Integrate a proper code editor and basic style extraction.

## Target Audience
AI Agents / Developers implementing Phase 2.

## Tasks

### 2.1 Backend - Refine Prompt Generation Logic
- **Goal**: Improve the VLM prompt structure to increase code generation accuracy and consistency.
- **Location**: `backend/app/services/code_generator.py`
- **Implementation**:
  - Add few-shot examples to prompt
  - Specify Material 3 usage and Tailwind utilities
  - Incorporate color hints in the prompt
  - Experiment with temperature and top_p settings

### 2.2 Frontend - Install & Configure Monaco Editor
- **Goal**: Integrate the Monaco Editor library into the Angular frontend.
- **Location**: `frontend/`
- **Implementation**:
  - Install ngx-monaco-editor or similar
  - Configure assets in angular.json

### 2.3 Frontend - Create CodeViewer Component
- **Goal**: Create a reusable component to display code using Monaco Editor.
- **Location**: `frontend/src/app/components/code-viewer/`
- **Implementation**:
  - Generate standalone component
  - Add support for multiple languages (TS, HTML, SCSS)
  - Configure editor options (theme, readOnly, etc.)

### 2.4 Frontend - Implement Tabbed Code Display
- **Goal**: Replace basic code display with a tabbed interface using the new CodeViewer component.
- **Location**: `frontend/src/app/pages/generator-page/`
- **Implementation**:
  - Use MatTabGroup with tabs for TS, HTML, and SCSS
  - Integrate CodeViewer component in each tab

### 2.5 Frontend - Add 'Copy Code' Button
- **Goal**: Allow users to easily copy the code from each editor tab.
- **Location**: `frontend/src/app/pages/generator-page/, frontend/src/app/components/code-viewer/`
- **Implementation**:
  - Add copy button with cdkCopyToClipboard directive
  - Provide visual feedback using snackbar

### 2.6 Frontend - Improve Preview Static Rendering
- **Goal**: Enhance the iframe preview to include Angular Material theme CSS for better visual accuracy.
- **Location**: `frontend/src/app/components/preview-pane/, frontend/src/assets/`
- **Implementation**:
  - Add Angular Material CSS theme file to assets
  - Generate enhanced srcdoc HTML with Material theme
  - Use DomSanitizer for secure binding

### 2.7 Frontend - Implement Basic Layout Structure
- **Goal**: Structure the main page using a responsive multi-column layout and add a header.
- **Location**: `frontend/src/app/pages/generator-page/generator-page.component.html, frontend/src/app/app.component.html`
- **Implementation**:
  - Create responsive grid/flex layout with Tailwind
  - Add Material toolbar
  - Ensure mobile responsiveness

### 2.8 Frontend - Improve Image Upload Control
- **Goal**: Enhance the image upload control for better usability.
- **Location**: `frontend/src/app/components/image-uploader/, frontend/src/app/pages/generator-page/`
- **Implementation**:
  - Style upload button with Material design
  - Display selected filename
  - Add optional drag-and-drop functionality

### 2.9 Frontend - Add Loading State & Error Handling
- **Goal**: Provide clear feedback during processing and error states.
- **Location**: Various frontend components
- **Implementation**:
  - Add MatProgressSpinner during processing
  - Disable buttons during API calls
  - Display user-friendly error messages

### 2.10 Frontend - Implement Color Extraction
- **Goal**: Extract dominant colors from uploaded images to guide the AI's color choices.
- **Location**: `frontend/src/app/components/image-uploader/, frontend/src/app/services/api.service.ts`
- **Implementation**:
  - Integrate color-thief-browser library
  - Extract dominant colors from uploaded image
  - Include color data in API request 