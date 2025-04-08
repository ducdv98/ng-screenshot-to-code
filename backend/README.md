# Screenshot to Angular Code Backend

This backend service powers the conversion of images and Figma designs to Angular components using AI.

## Features

- Convert screenshots and UI mockups to Angular components
- Convert Figma designs to Angular components
- Integration with OpenAI and Anthropic's vision models
- Support for Angular Material and TailwindCSS styling

## Tech Stack

- FastAPI
- OpenAI API (GPT-4 Vision)
- Anthropic API (Claude 3)
- Figma API
- Python 3.11+

## Setup and Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and add your API keys:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

## Running the Backend

For development:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Swagger documentation is available at `http://localhost:8000/docs`.

## API Endpoints

### Image to Code

```
POST /api/v1/generate-image/
```

Upload an image file to generate an Angular component.

### Figma to Code

```
POST /api/v1/generate-figma/
```

Provide a Figma URL and access token to generate an Angular component.

## Configuration

Configuration is managed through environment variables. See `.env.example` for available options.

## Architecture

The backend follows a layered architecture:

- API Layer: FastAPI endpoints
- Service Layer: Business logic for AI and Figma processing
- Utility Layer: Helper functions for image processing, etc.

## Development

To run tests:
```bash
pytest
``` 