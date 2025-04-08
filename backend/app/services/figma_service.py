from typing import Dict, Any, List, Optional, Tuple
import re
import httpx
from urllib.parse import urlparse, parse_qs
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
        file_key = self._extract_file_key(file_url)
        
        # Use provided token or fallback to settings
        token = access_token or settings.FIGMA_ACCESS_TOKEN
        if not token:
            raise ValueError("Figma access token is required")
        
        # Create HTTP client with authentication headers
        headers = {
            "X-Figma-Token": token,
            "Content-Type": "application/json"
        }
        
        try:
            async with httpx.AsyncClient(headers=headers, timeout=30.0) as client:            
                # Fetch file data
                file_data = await self._fetch_file_data(client, file_key)
                
                # If node ID is provided, fetch node-specific data
                if node_id:
                    node_data = await self._fetch_node_data(client, file_key, node_id)
                    
                    # Fetch image fills if any to get the actual rendered nodes
                    images_data = await self._fetch_image_fills(client, file_key, [node_id])
                    
                    return {
                        "file_data": file_data,
                        "node_data": node_data,
                        "images_data": images_data
                    }
                    
                return {
                    "file_data": file_data
                }
                
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 403:
                raise ValueError("Invalid or expired Figma access token")
            elif e.response.status_code == 404:
                raise ValueError(f"Figma file or node not found: {file_key}")
            else:
                raise ValueError(f"Figma API error: {str(e)}")
        except httpx.RequestError as e:
            raise ValueError(f"Network error while accessing Figma API: {str(e)}")
        except Exception as e:
            raise ValueError(f"Error processing Figma data: {str(e)}")
    
    async def fetch_file_nodes(
        self,
        file_url: str,
        access_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Fetch a simplified list of top-level nodes from a Figma file.
        
        Args:
            file_url: URL of the Figma file
            access_token: Access token for Figma API
            
        Returns:
            Dictionary containing node information
        """
        file_key = self._extract_file_key(file_url)
        
        # Use provided token or fallback to settings
        token = access_token or settings.FIGMA_ACCESS_TOKEN
        if not token:
            raise ValueError("Figma access token is required")
        
        headers = {
            "X-Figma-Token": token,
            "Content-Type": "application/json"
        }
        
        try:
            async with httpx.AsyncClient(headers=headers, timeout=30.0) as client:
                # Fetch file data
                file_data = await self._fetch_file_data(client, file_key)
                
                # Extract selectable nodes (pages, frames, components)
                selectable_nodes = self._extract_selectable_nodes(file_data)
                
                return {
                    "file_key": file_key,
                    "file_name": file_data.get("name", "Untitled"),
                    "nodes": selectable_nodes
                }
                
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 403:
                raise ValueError("Invalid or expired Figma access token")
            elif e.response.status_code == 404:
                raise ValueError(f"Figma file not found: {file_key}")
            else:
                raise ValueError(f"Figma API error: {str(e)}")
        except httpx.RequestError as e:
            raise ValueError(f"Network error while accessing Figma API: {str(e)}")
    
    async def _fetch_file_data(self, client: httpx.AsyncClient, file_key: str) -> Dict[str, Any]:
        """Fetch basic file data from Figma API."""
        response = await client.get(f"{self.base_url}/files/{file_key}")
        response.raise_for_status()
        return response.json()
    
    async def _fetch_node_data(self, client: httpx.AsyncClient, file_key: str, node_id: str) -> Dict[str, Any]:
        """Fetch detailed node data."""
        response = await client.get(f"{self.base_url}/files/{file_key}/nodes?ids={node_id}")
        response.raise_for_status()
        nodes_data = response.json()
        
        if 'nodes' in nodes_data and node_id in nodes_data['nodes']:
            return nodes_data['nodes'][node_id]
        else:
            raise ValueError(f"Node ID {node_id} not found in Figma file")
    
    async def _fetch_image_fills(self, client: httpx.AsyncClient, file_key: str, node_ids: List[str]) -> Dict[str, Any]:
        """Fetch image fills for nodes."""
        node_ids_param = ','.join(node_ids)
        response = await client.get(
            f"{self.base_url}/images/{file_key}?ids={node_ids_param}&format=png&scale=2"
        )
        response.raise_for_status()
        return response.json()
    
    def _extract_selectable_nodes(self, file_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract selectable nodes (pages, frames, components) from file data."""
        selectable_nodes = []
        
        if 'document' in file_data:
            # Process each page
            for page in file_data['document'].get('children', []):
                page_node = {
                    'id': page.get('id', ''),
                    'name': page.get('name', 'Unnamed Page'),
                    'type': page.get('type', 'PAGE'),
                    'children': []
                }
                
                # Process frames and components within the page
                for child in page.get('children', []):
                    if child.get('type') in ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE']:
                        child_node = {
                            'id': child.get('id', ''),
                            'name': child.get('name', 'Unnamed Element'),
                            'type': child.get('type', 'UNKNOWN')
                        }
                        page_node['children'].append(child_node)
                
                selectable_nodes.append(page_node)
        
        return selectable_nodes
    
    def _extract_file_key(self, figma_url: str) -> str:
        """
        Extract file key from Figma URL.
        Supports various Figma URL formats:
        - https://www.figma.com/file/KEY/name
        - https://www.figma.com/proto/KEY/name
        - https://www.figma.com/design/KEY/name
        """
        # Try regex matching for standard Figma URLs
        file_key_match = re.search(r'figma\.com\/(?:file|proto|design)\/([a-zA-Z0-9]+)', figma_url)
        if file_key_match:
            return file_key_match.group(1)
            
        # Try parsing URL components for other formats
        parsed_url = urlparse(figma_url)
        path_parts = parsed_url.path.split('/')
        
        # Look for common patterns in the path
        for part in path_parts:
            if re.match(r'^[a-zA-Z0-9]{22,40}$', part):  # Figma keys are typically 22-40 chars
                return part
                
        # Try getting from query params (some shared links have the key as a param)
        query_params = parse_qs(parsed_url.query)
        if 'file-key' in query_params:
            return query_params['file-key'][0]
            
        raise ValueError("Invalid Figma URL. Expected format: https://www.figma.com/file/FILE_KEY/...") 