# Phase 3 Task Breakdown: Figma Integration & Enhancements

## Phase Goal
Add Figma designs as a primary input source for code generation, allowing users to convert Figma layouts directly into Angular Material/Tailwind components.

## Target Audience
AI Agents / Developers implementing Phase 3.

## Core Figma Integration Tasks

### 3.1 Figma API Setup & Authentication
- **Goal**: Allow the application to securely access Figma file data on behalf of the user.
- **Location**: `backend/app/core/config.py`, `backend/app/services/figma_service.py`
- **Implementation**:
  - Configure personal access token authentication
  - Set up environment variables for Figma API access
  - Create secure token handling

### 3.2 Backend Figma Processing
- **Goal**: Fetch and parse Figma file data using the Figma API.
- **Location**: `backend/app/api/v1/endpoints/generate_figma.py`, `backend/app/services/figma_service.py`
- **Implementation**:
  - Create endpoint for Figma file processing
  - Implement Figma API client using httpx
  - Handle file data retrieval with error handling

### 3.3 Figma-to-Code Mapping Logic
- **Goal**: Translate Figma node tree into Angular component code.
- **Location**: `backend/app/services/code_generator.py`
- **Implementation**:
  - Create recursive parser for Figma nodes
  - Map Figma elements to Angular Material components
  - Generate TypeScript, HTML, and SCSS code

### 3.4 Frontend Figma Input UI
- **Goal**: Create UI for Figma URL and token input.
- **Location**: `frontend/src/app/components/figma-input/`
- **Implementation**:
  - Create FigmaInputComponent with form controls
  - Add validation for Figma URLs
  - Connect to API service for backend communication

## Enhanced Functionality

### 3.5 Figma Node Selection
- **Goal**: Allow users to select specific nodes from Figma files.
- **Location**: `backend/app/services/figma_service.py`, `frontend/src/app/components/figma-input/`
- **Implementation**:
  - Add node tree extraction endpoint
  - Create node selection UI component
  - Enable targeting specific components for generation

### 3.6 Component Recognition and Mapping
- **Goal**: Identify and map Figma components to Angular Material equivalents.
- **Location**: `backend/app/services/code_generator.py`
- **Implementation**:
  - Extract component instances
  - Identify component types based on structure
  - Map to appropriate Angular Material components

### 3.7 Error Feedback for Mapping Issues
- **Goal**: Provide clear feedback about Figma mapping challenges.
- **Location**: `backend/app/services/code_generator.py`, `frontend/src/app/pages/generator-page/`
- **Implementation**:
  - Collect warnings during parsing
  - Add warnings field to response model
  - Display warnings in UI with suggested fixes

### 3.8 UI Improvements for Figma Workflow
- **Goal**: Enhance the UI to support the Figma workflow.
- **Location**: `frontend/src/app/pages/generator-page/`
- **Implementation**:
  - Add toggle between image and Figma inputs
  - Implement loading states specific to Figma API
  - Create UI for node selection and token management 