import requests
import os
import base64
from PIL import Image, ImageDraw
import io
import sys

def create_test_image():
    """Create a simple test image for testing"""
    img = Image.new('RGB', (300, 200), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple button
    draw.rectangle([(50, 50), (250, 100)], fill='blue', outline='blue')
    draw.text((120, 65), "Click Me", fill="white")
    
    # Draw a simple input field
    draw.rectangle([(50, 120), (250, 150)], fill='white', outline='black')
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()

def test_gemini_integration():
    """Test the Gemini API integration by sending a test image to the backend API"""
    print("Running E2E test for Gemini API integration...")
    
    # Create test image
    test_image = create_test_image()
    
    # Prepare the request
    url = "http://localhost:8000/api/v1/generate-image/"
    
    files = {
        'file': ('test_image.png', test_image, 'image/png')
    }
    
    try:
        # Send the request
        response = requests.post(url, files=files)
        
        # Check if the request was successful
        if response.status_code == 200:
            result = response.json()
            
            # Check if the required fields are in the response
            if "component_ts" in result and "component_html" in result and "component_scss" in result:
                print("✅ Test passed! Gemini API integration is working correctly.")
                print("\nGenerated Component:")
                print(f"Component Name: {result.get('component_name', 'Not provided')}")
                print(f"HTML: {result['component_html'][:200]}...")
                print(f"TS: {result['component_ts'][:200]}...")
                print(f"SCSS: {result['component_scss'][:200]}...")
                return True
            else:
                print("❌ Test failed! Response doesn't contain expected fields.")
                print(f"Response: {result}")
                return False
        else:
            print(f"❌ Test failed! Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_gemini_integration()
    sys.exit(0 if success else 1)
