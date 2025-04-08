# Project Structure

A clear project structure for the Angular + FastAPI application, designed to be understandable for implementation, potentially by other developers or AI agents. This structure separates the frontend (Angular) and backend (FastAPI) concerns logically.

## Root Directory (`angular-screenshot-to-code/`)

Contains the `backend/` and `frontend/` subdirectories. The main `README.md` provides an overview of the entire project, setup instructions for both frontend and backend, and how to run them together.

## Backend Directory (`backend/`)

### Technology: Python with FastAPI

#### Core Components

- **Entry Point**: `app/main.py`
  - Initializes the FastAPI application
  - Includes CORS middleware (essential for communication with the frontend)
  - Mounts the API routers

- **API Endpoints** (`app/api/v1/endpoints/`)
  - `generate_image.py`: Handles POST requests with image data
  - `generate_figma.py`: Handles POST requests with Figma URL/token

- **Services** (`app/services/`)
  - `ai_service.py`: Communicates with the external VLM API
  - `figma_service.py`: Communicates with the Figma API
  - `code_generator.py`: Orchestrates the code generation process

- **Models**: Pydantic models for data validation
- **Core**: Configuration loading, especially for API keys
- **Dependencies**: Listed in `requirements.txt`
- **Environment Variables**: Stored in `.env` (not committed to repo)

### Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── generate_image.py
│   │   │   │   └── generate_figma.py
│   │   │   └── router.py
│   │   │   
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── models/
│   │   │   ├── image_input.py
│   │   │   ├── figma_input.py
│   │   │   └── generated_code.py
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── figma_service.py
│   │   │   └── code_generator.py
│   │   ├── utils/
│   │   │   └── image_processing.py
│   │   └── main.py
│   ├── tests/
│   ├── .env.example
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md
```

## Frontend Directory (`frontend/`)

### Technology: Angular (using Standalone Components pattern)

#### Core Components

- **Entry Point**: `src/main.ts`
- **Configuration**: 
  - `angular.json` (build/serve)
  - `tailwind.config.js`, `postcss.config.js` 
  - `src/styles.scss` (Tailwind/global styles)

- **Core Component**: `src/app/app.component.ts`
- **Routing**: Defined in `src/app/app.routes.ts`
- **Main UI**: `src/app/pages/generator-page/`
- **Reusable Components**: `src/app/components/`
  - `code-viewer/`: Monaco-based code display
  - `image-uploader/`: Image upload handling
  - `figma-input/`: Figma input handling
  - `preview-pane/`: Live preview rendering

- **API Communication**: `src/app/services/api.service.ts`
- **Preview Logic**: `src/app/services/preview.service.ts`
- **Models**: TypeScript interfaces matching backend models

### Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── code-viewer/
│   │   │   ├── image-uploader/
│   │   │   ├── figma-input/
│   │   │   └── preview-pane/
│   │   ├── pages/
│   │   │   └── generator-page/
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   └── preview.service.ts
│   │   ├── models/
│   │   │   ├── generated-code.model.ts
│   │   │   └── api-request.model.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   ├── environments/
│   ├── main.ts
│   ├── styles.scss
│   └── index.html
├── angular.json
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── README.md
```

## Development Workflow

1. Run the backend server: `cd backend && uvicorn app.main:app --reload`
2. Run the frontend server: `cd frontend && ng serve`
3. Ensure the frontend's environment configuration points to the correct backend URL
4. Ensure the backend has CORS configured correctly to allow requests from the frontend's origin

This structure provides a solid foundation, separating concerns and using standard conventions for both FastAPI and Angular development. 