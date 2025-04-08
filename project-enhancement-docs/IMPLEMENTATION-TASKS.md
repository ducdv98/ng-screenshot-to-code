# ng-screenshot-to-code Implementation Tasks

This document outlines all tasks required to implement the enhancements for the ng-screenshot-to-code project, based on the project enhancement documentation.

## Phase 2: Enhanced Core Conversion & Preview

### Backend Enhancements

#### 2.1 Refine Prompt Generation Logic
- **Location**: `backend/app/services/code_generator.py`
- **Steps**:
  - Analyze current Gemini API prompt
  - Gather 3-5 example image-to-code pairs
  - Modify prompt with few-shot examples
  - Explicitly specify Material 3 components and Tailwind usage
  - Add logic for color hints from frontend
  - Experiment with temperature and top_p parameters

### Frontend Enhancements

#### 2.2 Install & Configure Monaco Editor
- **Location**: `frontend/`
- **Steps**:
  - Install ngx-monaco-editor package
  - Configure assets in angular.json if needed
  - Ensure dependencies are synchronized

#### 2.3 Create CodeViewer Component
- **Location**: `frontend/src/app/components/code-viewer/`
- **Steps**:
  - Generate component with Angular CLI
  - Import necessary modules
  - Define input properties for language, code, and readOnly
  - Configure Monaco editor options
  - Implement template with Monaco editor directive
  - Add basic styling

#### 2.4 Implement Tabbed Code Display
- **Location**: `frontend/src/app/pages/generator-page/`
- **Steps**:
  - Import MatTabsModule and CodeViewerComponent
  - Replace existing code display with mat-tab-group
  - Create tabs for TypeScript, HTML, and SCSS
  - Embed CodeViewer component in each tab
  - Bind appropriate language and code properties

#### 2.5 Add 'Copy Code' Button
- **Location**: `frontend/src/app/pages/generator-page/, frontend/src/app/components/code-viewer/`
- **Steps**:
  - Import necessary modules (MatButton, MatIcon, etc.)
  - Add copy button to each tab or within CodeViewer
  - Implement clipboard functionality
  - Add visual feedback on successful copy

#### 2.6 Improve Preview Static Rendering
- **Location**: `frontend/src/app/components/preview-pane/, frontend/src/assets/`
- **Steps**:
  - Add Angular Material theme CSS to assets
  - Create/update PreviewPaneComponent
  - Implement method to construct srcdoc string
  - Include Tailwind and Material theme CSS links
  - Use DomSanitizer for security bypass
  - Bind iframe srcdoc attribute

#### 2.7 Implement Basic Layout Structure
- **Location**: `frontend/src/app/pages/generator-page/generator-page.component.html, frontend/src/app/app.component.html`
- **Steps**:
  - Add Material toolbar with application title
  - Create responsive grid layout with Tailwind
  - Organize content into columns for input, code, and preview
  - Ensure mobile responsiveness

#### 2.8-2.10 Additional Frontend Tasks
- **Color Extraction**: Implement client-side color extraction from uploaded images
- **Loading States**: Add progress indicators during processing
- **Error Handling**: Display user-friendly error messages

## Phase 3: Figma Integration

### Backend Implementation

#### 3.1 Figma API Setup & Authentication
- **Location**: `backend/app/core/config.py` and related files
- **Steps**:
  - Register Figma app for API credentials
  - Choose authentication method (Personal Access Token or OAuth)
  - Configure environment variables
  - Create authentication handling logic

#### 3.2 Backend Figma Processing
- **Location**: `backend/app/api/v1/endpoints/generate_figma.py, backend/app/services/figma_service.py`
- **Steps**:
  - Install Figma API client library
  - Create endpoint for Figma-to-code generation
  - Implement FigmaService for API communication
  - Develop file data retrieval method
  - Handle API errors appropriately

#### 3.3 Figma-to-Code Mapping Logic
- **Location**: `backend/app/services/code_generator.py`
- **Steps**:
  - Study Figma API response structure
  - Implement recursive node tree parser
  - Create mappings from Figma nodes to HTML/Angular components
  - Map styles (colors, typography, layout) to Tailwind classes
  - Generate component code (.ts, .html, .scss)

### Frontend Implementation

#### 3.4 Figma Input UI & Integration
- **Location**: `frontend/src/app/pages/generator-page/, frontend/src/app/components/figma-input/`
- **Steps**:
  - Create FigmaInputComponent with fields for URL and token
  - Update ApiService with Figma generation method
  - Connect UI to backend endpoint
  - Display generated code in CodeViewer component

### Phase 3 Enhancements

#### 3.E1 Figma Node Tree Structure Endpoint
- **Location**: `backend/app/api/v1/endpoints/, backend/app/services/figma_service.py`
- **Steps**:
  - Create Pydantic model for node structure
  - Implement API endpoint for fetching structure
  - Add service method to extract selectable nodes
  - Return simplified tree structure

#### 3.E2 Figma Node Selection UI
- **Location**: `frontend/src/app/components/figma-input/, frontend/src/app/services/api.service.ts`
- **Steps**:
  - Add UI for displaying selectable nodes
  - Implement node selection functionality
  - Update API service to include node ID
  - Connect selection to code generation

#### 3.E3 Target Specific Figma Node for Generation
- **Location**: `backend/app/api/v1/endpoints/generate_figma.py, backend/app/services/code_generator.py`
- **Steps**:
  - Update request model to include node_id
  - Modify code generator to start from specific node
  - Implement node lookup logic
  - Handle errors for invalid node IDs

#### 3.E4 Basic Figma Component Recognition
- **Location**: `backend/app/services/code_generator.py`
- **Steps**:
  - Identify Figma component instances
  - Extract component information
  - Add component metadata to generated HTML
  - Prepare for future component mapping

#### 3.E5 Improved Mapping Error Feedback
- **Location**: `backend/app/services/code_generator.py, frontend/src/app/pages/generator-page/`
- **Steps**:
  - Collect warnings during parsing
  - Include warnings in API response
  - Display warnings in UI
  - Clear warnings between generations

## Additional Enhancements

### Multi-Model Support
- **Location**: `backend/app/services/ai_service.py, frontend/src/app/pages/generator-page/`
- **Steps**:
  - Abstract AI service for multiple models
  - Add model selection UI
  - Implement secure API key handling
  - Update configuration for model management

### UX/UI Improvements
- **Location**: Various frontend components
- **Steps**:
  - Improve layout and structure
  - Enhance input controls
  - Add feedback and state management
  - Ensure visual design consistency
  - Apply Material Design principles
  - Ensure accessibility

## Documentation Updates
- Update README.md with current status
- Document technology stack and project structure
- Add setup and running instructions
- Update contribution guidelines

## Phase 4: Polish, Testing & Advanced Features
- Comprehensive error handling
- User experience refinements
- Code editing capabilities
- Testing implementation
- Performance optimization
- Component splitting suggestions

This task list will be updated as implementation progresses and additional requirements are identified. 