import io
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_dependencies():
    """Mock all dependencies required for testing the generate_code endpoints."""
    with patch("app.api.v1.endpoints.generate_code.AIService") as mock_ai_service, \
         patch("app.api.v1.endpoints.generate_code.CodeGenerator") as mock_code_generator, \
         patch("app.api.v1.endpoints.generate_code.ProjectAssemblerService") as mock_project_assembler, \
         patch("app.api.v1.endpoints.generate_code.PackagingService") as mock_packaging_service, \
         patch("app.api.v1.endpoints.generate_code.FigmaService") as mock_figma_service:
        
        # Configure AI Service
        ai_service_instance = mock_ai_service.return_value
        ai_service_instance.process_image.return_value = {"description": "A test UI"}
        
        # Configure Code Generator
        code_gen_instance = mock_code_generator.return_value
        generated_code = MagicMock()
        generated_code.component_name = "test-component"
        generated_code.component_ts = "// TS code"
        generated_code.component_html = "<!-- HTML code -->"
        generated_code.component_scss = "/* SCSS code */"
        generated_code.components = [
            {
                "componentName": "TestComponent",
                "typescript": "// TypeScript code",
                "html": "<!-- HTML code -->",
                "scss": "/* SCSS code */"
            }
        ]
        generated_code.routing = [{"path": "", "componentName": "TestComponent"}]
        code_gen_instance.generate_from_image_description.return_value = generated_code
        code_gen_instance.generate_from_figma_data.return_value = generated_code
        
        # Configure Project Assembler
        project_assembler_instance = mock_project_assembler.return_value
        project_assembler_instance.assemble_project.return_value = {
            "package.json": "{\"name\": \"test-project\"}",
            "src/app/test-component/test-component.component.ts": "// Test TS"
        }
        
        # Configure Packaging Service
        packaging_instance = mock_packaging_service.return_value
        zip_stream = io.BytesIO(b"mock zip content")
        packaging_instance.create_zip_archive_with_stream.return_value = zip_stream
        
        # Configure Figma Service
        figma_service_instance = mock_figma_service.return_value
        figma_service_instance.fetch_figma_design.return_value = {"file_data": {"document": {}}}
        
        yield

def test_generate_project_from_image(mock_dependencies):
    """Test generating a project from image."""
    # Create a mock image file
    mock_image = io.BytesIO(b"mock image content")
    mock_image.name = "test.png"
    
    response = client.post(
        "/api/v1/generate-code/image",
        files={"file": ("test.png", mock_image, "image/png")}
    )
    
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/zip"
    assert "attachment; filename=generated_angular_project.zip" in response.headers["Content-Disposition"]
    assert response.content == b"mock zip content"

def test_generate_project_from_figma(mock_dependencies):
    """Test generating a project from Figma URL."""
    response = client.post(
        "/api/v1/generate-code/figma",
        json={
            "file_url": "https://www.figma.com/file/test",
            "node_id": "123:456",
            "access_token": "test-token"
        }
    )
    
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/zip"
    assert "attachment; filename=generated_angular_project.zip" in response.headers["Content-Disposition"]
    assert response.content == b"mock zip content" 