# Screenshot to Angular Code

A tool that converts screenshots and Figma designs into Angular components using AI.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Keys Configuration](#api-keys-configuration)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)

## Features

- **Image-to-Code**: Upload screenshots or UI mockups and convert them to Angular components
- **Figma-to-Code**: Input Figma designs and convert them to Angular components
- **Angular Material & TailwindCSS**: Generated components use Angular Material and TailwindCSS for styling
- **Multiple AI Providers**: Support for OpenAI, Anthropic Claude, and Google Gemini
- **Live Preview**: Instantly preview the generated components
- **Code Editing**: View and edit the generated TypeScript, HTML, and SCSS code
- **Download Options**: Download the generated files for use in your Angular projects

## Prerequisites

Before setting up the application, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
  - [Download Node.js](https://nodejs.org/)
  - Verify with: `node -v`
- **npm**: Usually comes with Node.js
  - Verify with: `npm -v`
- **Python**: v3.11 or higher
  - [Download Python](https://www.python.org/downloads/)
  - Verify with: `python --version` or `python3 --version`
- **Angular CLI**: For running the frontend
  - Install with: `npm install -g @angular/cli`
  - Verify with: `ng version`
- **Git**: For cloning the repository (optional)
  - [Download Git](https://git-scm.com/downloads)
  - Verify with: `git --version`

## Setup & Installation

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment**:
   
   On macOS/Linux:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
   
   On Windows:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file to add your API keys (see [API Keys Configuration](#api-keys-configuration) section).

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

## Running the Application

### Start the Backend Server

1. **Ensure you're in the backend directory with the virtual environment activated**:
   
   If you're not already there:
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   
   The backend will run on `http://localhost:8000` by default.
   - API documentation will be available at `http://localhost:8000/docs`

### Start the Frontend Application

1. **Ensure you're in the frontend directory**:
   
   If you're not already there:
   ```bash
   cd frontend
   ```

2. **Start the Angular development server**:
   ```bash
   ng serve
   ```
   
   The application will be available at `http://localhost:4200`.

## API Keys Configuration

You need at least one of the following API keys to use the AI features:

### OpenAI (GPT-4 Vision)
- Get your API key from: [OpenAI Platform](https://platform.openai.com/)
- Add to your `.env` file:
  ```
  OPENAI_API_KEY=your_openai_api_key_here
  OPENAI_MODEL=gpt-4-vision-preview
  ```

### Anthropic Claude
- Get your API key from: [Anthropic Console](https://console.anthropic.com/)
- Add to your `.env` file:
  ```
  ANTHROPIC_API_KEY=your_anthropic_api_key_here
  ANTHROPIC_MODEL=claude-3-sonnet-20240229
  ```

### Google Gemini
- Get your API key from: [Google AI Studio](https://ai.google.dev/)
- Add to your `.env` file:
  ```
  GEMINI_API_KEY=your_gemini_api_key_here
  GEMINI_MODEL=gemini-2.0-flash
  ```

### Figma Integration (Optional)
If you want to use the Figma integration:
- Get your access token from Figma
- Add to your `.env` file:
  ```
  FIGMA_ACCESS_TOKEN=your_figma_access_token_here
  ```

### Setting the Default Provider
You can set your preferred AI provider in the `.env` file:
```
DEFAULT_VLM_PROVIDER=gemini  # Choose one of: "openai", "anthropic", or "gemini"
```

## Usage Guide

1. Open the application in your browser at `http://localhost:4200`
2. Choose your preferred AI provider in settings (OpenAI, Claude, or Gemini)
3. Upload a screenshot or input Figma design details
4. Wait for the AI to process and generate the code
5. View and edit the generated code in the editor
6. Preview the component in real-time
7. Download the component files for use in your Angular project

## Troubleshooting

### Backend Issues
- **Connection refused**: Ensure the backend server is running
- **API key errors**: Verify your API keys are correctly set in the `.env` file
- **Module not found errors**: Ensure all dependencies are installed with `pip install -r requirements.txt`
- **Port already in use**: Change the port using `uvicorn app.main:app --reload --port 8001`

### Frontend Issues
- **Dependency errors**: Ensure you've installed all dependencies with `npm install`
- **Angular version mismatch**: Check that your Angular CLI version is compatible with the project
- **Connection to backend failed**: Verify the backend is running and accessible

For further assistance, please refer to the documentation or raise an issue in the repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 