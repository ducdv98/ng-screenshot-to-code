# Generate Code Endpoints Documentation

This document describes the API endpoints for generating and downloading a complete Angular project based on image or Figma input.

## Overview

The "generate-code" endpoints convert either an uploaded image or a Figma design into a complete, downloadable Angular project that includes:

- Angular v19+ project structure
- Angular Material v17+ components
- Tailwind CSS integration
- Proper configurations (package.json, angular.json, etc.)
- Generated components based on the input design

## Endpoints

### 1. Generate project from image

```
POST /api/v1/generate-code/image
```

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: The image file to analyze (must be an image file)

**Response:**
- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename=generated_angular_project.zip`
- Body: ZIP archive containing the complete Angular project

**Example using curl:**
```bash
curl -X POST \
  http://localhost:8000/api/v1/generate-code/image \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/screenshot.png" \
  --output generated_angular_project.zip
```

### 2. Generate project from Figma

```
POST /api/v1/generate-code/figma
```

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "file_url": "https://www.figma.com/file/{file_id}/{file_name}",
    "node_id": "123:456",  // Optional: Specific node to target
    "access_token": "your_figma_personal_access_token"
  }
  ```

**Response:**
- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename=generated_angular_project.zip`
- Body: ZIP archive containing the complete Angular project

**Example using curl:**
```bash
curl -X POST \
  http://localhost:8000/api/v1/generate-code/figma \
  -H "Content-Type: application/json" \
  -d '{
    "file_url": "https://www.figma.com/file/abcdef123456/MyDesign",
    "node_id": "123:456",
    "access_token": "your_figma_personal_access_token"
  }' \
  --output generated_angular_project.zip
```

## Project Structure

The generated ZIP file will contain a complete Angular project with the following structure:

```
generated_angular_project/
├── angular.json
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.spec.json
├── .gitignore
└── src/
    ├── main.ts
    ├── index.html
    ├── styles.scss
    └── app/
        ├── app.config.ts
        ├── app.routes.ts
        ├── app.component.html
        ├── app.component.scss
        ├── app.component.ts
        └── [component-name]/
            ├── [component-name].component.html
            ├── [component-name].component.scss
            ├── [component-name].component.ts
```

## Usage

After downloading the ZIP file:

1. Extract the contents
2. Install dependencies: `npm install`
3. Start the development server: `npm start` or `ng serve`
4. Open your browser at http://localhost:4200

## Error Handling

- HTTP 400: Invalid input (e.g., non-image file)
- HTTP 500: Server error (check response body for details) 