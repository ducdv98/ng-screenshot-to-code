# MVP Task List: Screenshot to Angular Code Generator

## Project Goal

Build a Minimum Viable Product (MVP) of an application that takes an image (screenshot/mockup) as input and generates corresponding Angular component code (TypeScript, HTML, SCSS) using AI (primarily Google's Gemini API), styled with Angular Material and TailwindCSS. The MVP will display the generated code and a basic static preview.

## Target Audience

AI Agents / Developers implementing the MVP.

## Instructions

Complete the following tasks sequentially. Each task includes detailed steps and test cases to verify completion.

## Task 1.1: Backend - Project Setup & Basic App

**Goal**: Initialize the FastAPI project structure and have a minimal running server with CORS and a health check endpoint.

**Location**: `backend/`

### Detailed Steps:

1. Create the main `backend` directory.
2. Inside `backend`, create the directory structure: `app/`, `app/api/`, `app/api/v1/`, `app/core/`, `app/models/`, `app/services/`.
3. Create empty `__init__.py` files in `app`, `app/api`, `app/api/v1`, `app/core`, `app/models`, `app/services`.
4. Create `app/main.py`.
5. Create `app/core/config.py`.
6. Create `requirements.txt`.
7. Create `.env.example` (can be empty initially).
8. Add dependencies to `requirements.txt`.
9. Run `pip install -r requirements.txt`. (Ideally within a virtual environment).
10. Implement `backend/app/core/config.py`.
11. Implement `backend/app/main.py`.

### Expected Results:

1. **Test 1.1.1**: Navigate to the `backend` directory.
2. **Test 1.1.2**: Run `pip install -r requirements.txt` (within a virtual environment is recommended).
   - Expected: Command completes successfully without errors.
3. **Test 1.1.3**: Run `uvicorn app.main:app --reload --port 8000`.
   - Expected: Server starts without errors, logs indicate listening on `http://0.0.0.0:8000`. Log message about `.env` file status should appear.
4. **Test 1.1.4**: Access `http://localhost:8000/health` in a browser or via `curl`.
   - Expected: Response body is `{"status": "ok"}` with status code `200`.
5. **Test 1.1.5**: Access `http://localhost:8000/docs` in a browser.
   - Expected: FastAPI Swagger UI loads successfully, showing the `/health` endpoint.

## Task 1.2: Frontend - Project Setup & Basic UI Shell

**Goal**: Initialize the Angular project with Material & Tailwind, create the main page shell, and ensure basic styling works.

**Location**: `frontend/` (relative to project root)

### Detailed Steps:

1. Navigate to the project root directory (containing the `backend` folder).
2. Run `ng new frontend --standalone --routing=true --style=scss --skip-tests`. Respond `N` or `false` to SSR for MVP simplicity.
3. Navigate into the new directory: `cd frontend`.
4. Run `ng add @angular/material`. Choose a theme (e.g., Indigo/Pink), set up Typography (Yes), include Animations (Yes).
5. Run `npm install -D tailwindcss postcss autoprefixer`.
6. Run `npx tailwindcss init -p`. This creates `tailwind.config.js` and `postcss.config.js`.
7. Configure `frontend/tailwind.config.js`.
8. Configure `frontend/src/styles.scss`.
9. Run `ng generate component pages/GeneratorPage --standalone`.
10. Configure `frontend/src/app/app.routes.ts`.
11. Replace the content in `frontend/src/app/app.component.html` with just `<router-outlet></router-outlet>`.
12. Add basic placeholder content and apply a Tailwind class in `frontend/src/app/pages/generator-page/generator-page.component.html`.
13. Ensure `CommonModule` is imported in `generator-page.component.ts` if needed for directives.

### Expected Results:

1. **Test 1.2.1**: Run `npm install` inside the `frontend` directory.
   - Expected: Command completes successfully without errors.
2. **Test 1.2.2**: Run `ng serve`.
   - Expected: Application compiles and runs without errors. Browser opens (or navigate manually) to `http://localhost:4200`.
3. **Test 1.2.3**: View `http://localhost:4200`.
   - Expected: See a title bar with "Screenshot to Angular Code Generator" styled with Tailwind classes (large text, bold, centered, indigo background, white text). See the placeholder sections below with titles. No console errors in the browser's developer tools related to setup.

## Task 1.3: Frontend - Image Upload Component

**Goal**: Create a reusable UI component to allow users to select an image file and emit the selection.

**Location**: `frontend/src/app/components/image-uploader/, frontend/src/app/pages/generator-page/`

### Detailed Steps:

1. Run `ng generate component components/ImageUploader --standalone`.
2. Import `MatButtonModule` and `CommonModule` in image-uploader.component.ts.
3. Implement onFileSelected method.
4. Add file input and button UI in image-uploader.component.html.
5. Style the component using Tailwind classes.
6. Add preview functionality.
7. Use the component in the generator page.
8. Implement generator page component to handle the emitted file.

**Note**: This is a simplified representation. The actual task would include more detailed steps and code samples. 