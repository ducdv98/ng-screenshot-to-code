import unittest
from app.services.project_assembler_service import ProjectAssemblerService

class TestProjectAssemblerService(unittest.TestCase):
    def setUp(self):
        self.assembler = ProjectAssemblerService()
    
    def test_to_kebab_case(self):
        """Test the _to_kebab_case method for various inputs."""
        test_cases = [
            ("TestComponent", "test-component"),
            ("testComponent", "test-component"),
            ("test_component", "test-component"),
            ("Test Component", "test-component"),
            ("test-component", "test-component"),
            ("TEST_COMPONENT", "test-component"),
            ("test--component", "test-component")
        ]
        
        for input_str, expected in test_cases:
            with self.subTest(input_str=input_str):
                self.assertEqual(self.assembler._to_kebab_case(input_str), expected)
    
    def test_to_class_name(self):
        """Test the _to_class_name method for various inputs."""
        test_cases = [
            ("test-component", "TestComponent"),
            ("testComponent", "TestComponent"),
            ("TestComponent", "TestComponent"),
            ("test_component", "TestComponent"),
            ("test component", "TestComponent")
        ]
        
        for input_str, expected in test_cases:
            with self.subTest(input_str=input_str):
                self.assertEqual(self.assembler._to_class_name(input_str), expected)
    
    def test_assemble_project_basic(self):
        """Test assembling a project with a single component and no routing."""
        # Create a mock component
        components = [{
            "componentName": "TestComponent",
            "typescript": "// TypeScript code for TestComponent",
            "html": "<!-- HTML for TestComponent -->",
            "scss": "/* SCSS for TestComponent */"
        }]
        
        # Assemble the project
        virtual_fs = self.assembler.assemble_project(components)
        
        # Verify the structure
        self.assertIn("src/app/test-component/test-component.component.ts", virtual_fs)
        self.assertIn("src/app/test-component/test-component.component.html", virtual_fs)
        self.assertIn("src/app/test-component/test-component.component.scss", virtual_fs)
        
        # Verify the content
        self.assertEqual(virtual_fs["src/app/test-component/test-component.component.ts"], 
                        "// TypeScript code for TestComponent")
        self.assertEqual(virtual_fs["src/app/test-component/test-component.component.html"], 
                        "<!-- HTML for TestComponent -->")
        self.assertEqual(virtual_fs["src/app/test-component/test-component.component.scss"], 
                        "/* SCSS for TestComponent */")
        
        # Check app component HTML includes the main component
        self.assertIn("<app-test-component></app-test-component>", 
                     virtual_fs["src/app/app.component.html"])
    
    def test_assemble_project_with_routing(self):
        """Test assembling a project with components and routing."""
        # Create mock components
        components = [
            {
                "componentName": "MainPage",
                "typescript": "// TypeScript code for MainPage",
                "html": "<!-- HTML for MainPage -->",
                "scss": "/* SCSS for MainPage */"
            },
            {
                "componentName": "AboutPage",
                "typescript": "// TypeScript code for AboutPage",
                "html": "<!-- HTML for AboutPage -->",
                "scss": "/* SCSS for AboutPage */"
            }
        ]
        
        # Create mock routing
        routing = [
            {
                "path": "",
                "componentName": "MainPage"
            },
            {
                "path": "about",
                "componentName": "AboutPage"
            }
        ]
        
        # Assemble the project
        virtual_fs = self.assembler.assemble_project(components, routing)
        
        # Verify the structure
        self.assertIn("src/app/main-page/main-page.component.ts", virtual_fs)
        self.assertIn("src/app/about-page/about-page.component.ts", virtual_fs)
        
        # Verify the routing file
        routes_ts = virtual_fs["src/app/app.routes.ts"]
        self.assertIn("import { MainPage } from './main-page/main-page.component';", routes_ts)
        self.assertIn("import { AboutPage } from './about-page/about-page.component';", routes_ts)
        self.assertIn("{ path: '', component: MainPage }", routes_ts)
        self.assertIn("{ path: 'about', component: AboutPage }", routes_ts)
    
    def test_assemble_project_empty_components(self):
        """Test assembling a project with an empty components list."""
        # Assemble the project with empty components
        virtual_fs = self.assembler.assemble_project([])
        
        # Verify that the basic structure is still created
        self.assertIn("package.json", virtual_fs)
        self.assertIn("angular.json", virtual_fs)
        self.assertIn("tsconfig.json", virtual_fs)
        
        # The app component HTML should not reference any generated component
        self.assertEqual("<div class=\"app-container\">\n" +
                        "  <app-generated-component></app-generated-component>\n" +
                        "</div>\n" +
                        "\n" +
                        "<router-outlet></router-outlet>\n", 
                        virtual_fs["src/app/app.component.html"])

if __name__ == "__main__":
    unittest.main() 