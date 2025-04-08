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

## Securing API Keys

To protect your API keys when working with version control:

1. Never commit the actual `.env` file to Git:
   - The `.env` file is included in `.gitignore` to prevent accidental commits
   - Only commit `.env.example` with placeholder values
  
2. For local development:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your actual API keys
   OPENAI_API_KEY=your_actual_key
   ANTHROPIC_API_KEY=your_actual_key
   GEMINI_API_KEY=your_actual_key
   ```

3. For production deployment:
   - Set environment variables directly on your hosting platform
   - Many platforms (Heroku, Vercel, etc.) provide secure ways to store secrets
   - Consider using a secrets manager for cloud deployments

4. When collaborating:
   - Share API keys through secure channels (password managers, encrypted messages)
   - Consider using separate API keys for each team member during development
   - Use production keys only in staging/production environments

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