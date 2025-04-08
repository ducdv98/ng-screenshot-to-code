# Technology Stack

This document outlines the technology stack used in the Angular Screenshot to Code Generator project.

## Frontend

- **Framework**: Angular (latest stable version, e.g., v17+)
- **UI Components**: Angular Material (v17+ for Material 3)
- **Styling**: TailwindCSS (latest version)
- **State Management (Optional)**: NgRx or Angular Signals (if complexity grows)
- **Code Editor**: Monaco Editor (for displaying/editing generated code)
- **Language**: TypeScript

## Backend

- **Language/Framework**: Python with FastAPI
  - Excellent AI/ML libraries
  - Good async support
  - Lightweight and performant

## AI Integration

### Primary AI Model
- **Google Gemini 1.5 Pro/Flash** (Default)
  - Strong vision capabilities with good cost efficiency
  - Integration via Google Generative AI SDK (`google-generativeai` Python package)

### Alternative Models
- **GPT-4 Vision** (Alternative)
  - High capability, higher cost
  - Integration via OpenAI API Client Library (`openai` Python package)

- **Claude 3 Opus/Sonnet/Haiku** (Alternative)
  - Strong vision capabilities
  - Potentially better cost/performance balance - Sonnet/Haiku
  - Integration via Anthropic API Client Library (Python package)

## Figma Integration

- **Official Figma API**: For accessing and parsing Figma designs
- **Python Libraries**: Appropriate HTTP client for API communication

## Database (Optional)

- **PostgreSQL** or **MongoDB**
  - For user accounts, saving generated components, usage tracking (if needed)

## Deployment

### Frontend
- **Options**: Vercel, Netlify, AWS S3/CloudFront, Azure Static Web Apps

### Backend
- **Serverless Options**: Vercel Serverless Functions, Netlify Functions, AWS Lambda, Google Cloud Functions, Azure Functions
- **Traditional Options**: PaaS (Heroku, Render) / IaaS (EC2, VMs) 