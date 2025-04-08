# Screenshot to Angular Code

A tool that converts screenshots and Figma designs into Angular components using AI.

## Features

- **Image-to-Code**: Upload screenshots or UI mockups and convert them to Angular components
- **Figma-to-Code**: Input Figma designs and convert them to Angular components
- **Angular Material & TailwindCSS**: Generated components use Angular Material and TailwindCSS for styling
- **Live Preview**: Instantly preview the generated components
- **Code Editing**: View and edit the generated TypeScript, HTML, and SCSS code
- **Download Options**: Download the generated files for use in your Angular projects

## Technology Stack

### Frontend
- Angular (v17+)
- Angular Material (v17+)
- TailwindCSS
- Monaco Editor (for code editing)
- TypeScript

### Backend
- FastAPI (Python)
- OpenAI GPT-4 Vision API
- Anthropic Claude API
- Figma API

## Project Structure

The project consists of two main parts:

- **frontend/**: Angular application
- **backend/**: FastAPI backend service

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- Angular CLI

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env to add your API keys
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
ng serve
```

The application will be available at `http://localhost:4200`.

## Usage

1. Open the application in your browser
2. Upload a screenshot or input Figma design details
3. Wait for the AI to process and generate the code
4. View and edit the generated code in the Monaco editor
5. Preview the component in real-time
6. Download the component files for use in your project

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 