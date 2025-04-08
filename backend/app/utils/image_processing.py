import base64
from io import BytesIO
from typing import Tuple
from PIL import Image
from fastapi import HTTPException

def validate_image_size(image_data: bytes, max_size_mb: int) -> None:
    """
    Validate that the image size is within the allowed limits.
    
    Args:
        image_data: Raw image bytes
        max_size_mb: Maximum allowed size in MB
        
    Raises:
        HTTPException: If the image size exceeds the limit
    """
    # Check size in bytes
    size_in_mb = len(image_data) / (1024 * 1024)
    if size_in_mb > max_size_mb:
        raise HTTPException(
            status_code=413,
            detail=f"Image size ({size_in_mb:.2f} MB) exceeds the maximum allowed size ({max_size_mb} MB)"
        )

def extract_dominant_colors(image_data: bytes, num_colors: int = 5) -> list:
    """
    Extract dominant colors from an image.
    
    Args:
        image_data: Raw image bytes
        num_colors: Number of dominant colors to extract
        
    Returns:
        List of RGB color tuples
    """
    try:
        # Open image using PIL
        img = Image.open(BytesIO(image_data))
        img = img.convert('RGB')
        
        # Resize image to speed up processing
        img.thumbnail((100, 100))
        
        # Use color quantization to find dominant colors
        reduced_img = img.quantize(colors=num_colors)
        palette = reduced_img.getpalette()
        color_counts = reduced_img.getcolors()
        
        colors = []
        if color_counts and palette:
            # Sort colors by frequency (most frequent first)
            color_counts.sort(reverse=True)
            
            for count, index in color_counts[:num_colors]:
                r = palette[index*3]
                g = palette[index*3+1]
                b = palette[index*3+2]
                colors.append((r, g, b))
                
        return colors
    except Exception as e:
        # If error occurs, just return empty list
        print(f"Error extracting colors: {str(e)}")
        return []

def image_to_base64(image_data: bytes) -> str:
    """
    Convert image bytes to base64 string.
    
    Args:
        image_data: Raw image bytes
        
    Returns:
        Base64-encoded string
    """
    return base64.b64encode(image_data).decode('utf-8')

def get_image_dimensions(image_data: bytes) -> Tuple[int, int]:
    """
    Get the dimensions (width, height) of an image.
    
    Args:
        image_data: Raw image bytes
        
    Returns:
        Tuple of (width, height)
    """
    try:
        img = Image.open(BytesIO(image_data))
        return img.size
    except Exception as e:
        print(f"Error getting image dimensions: {str(e)}")
        return (0, 0)  # Return dummy dimensions on error 