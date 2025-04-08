from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings

class FigmaService:
    """
    Service for interacting with the Figma API to fetch design data.
    """
    def __init__(self):
        self.base_url = "https://api.figma.com/v1"
        
    async def fetch_figma_design(
        self, 
        file_url: str, 
        node_id: Optional[str] = None,
        access_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Fetch design data from Figma API.
        
        Args:
            file_url: URL of the Figma file
            node_id: Optional node ID to target specific frame
            access_token: Access token for Figma API (falls back to settings if not provided)
            
        Returns:
            Dictionary containing the Figma design data
        """
        # Extract file key from URL
        # Example URL: https://www.figma.com/file/FILE_KEY/file_name
        file_key = self._extract_file_key(file_url)
        
        # Use provided token or fallback to settings
        token = access_token or settings.FIGMA_ACCESS_TOKEN
        if not token:
            raise ValueError("Figma access token is required")
        
        # Fetch file data
        async with httpx.AsyncClient() as client:
            headers = {
                "X-Figma-Token": token
            }
            
            # Fetch file data
            file_response = await client.get(
                f"{self.base_url}/files/{file_key}",
                headers=headers
            )
            file_response.raise_for_status()
            file_data = file_response.json()
            
            # If node ID is provided, filter to that node
            if node_id:
                nodes_response = await client.get(
                    f"{self.base_url}/files/{file_key}/nodes?ids={node_id}",
                    headers=headers
                )
                nodes_response.raise_for_status()
                nodes_data = nodes_response.json()
                
                # Fetch image fills if any
                if 'nodes' in nodes_data and node_id in nodes_data['nodes']:
                    return {
                        "file_data": file_data,
                        "node_data": nodes_data['nodes'][node_id]
                    }
                else:
                    raise ValueError(f"Node ID {node_id} not found in Figma file")
                    
            return {
                "file_data": file_data
            }
    
    def _extract_file_key(self, figma_url: str) -> str:
        """Extract file key from Figma URL."""
        # Extract the file key from the URL
        # Example URL: https://www.figma.com/file/FILE_KEY/file_name
        if '/file/' not in figma_url:
            raise ValueError("Invalid Figma URL. Expected format: https://www.figma.com/file/FILE_KEY/...")
            
        parts = figma_url.split('/file/')
        if len(parts) < 2:
            raise ValueError("Invalid Figma URL")
            
        file_key_and_name = parts[1].split('/')
        if not file_key_and_name:
            raise ValueError("Invalid Figma URL")
            
        return file_key_and_name[0] 