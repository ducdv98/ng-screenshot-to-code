import io
from typing import Dict, Optional
import zipfile

class PackagingService:
    """
    Service responsible for packaging the assembled virtual project file structure
    into a downloadable ZIP archive.
    """
    
    def create_zip_archive(self, virtual_fs: Dict[str, str], project_name: str = "generated_angular_project") -> bytes:
        """
        Creates a ZIP archive from a virtual file system structure.
        
        Args:
            virtual_fs: Dictionary mapping file paths to content
            project_name: Name of the root folder in the ZIP archive
            
        Returns:
            bytes: The ZIP archive as bytes
        """
        # Create an in-memory ZIP file
        memory_file = io.BytesIO()
        
        # Create a ZIP archive
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Add each file from the virtual file system to the ZIP
            for file_path, content in virtual_fs.items():
                # Create the full path with the project name as the root folder
                zip_path = f"{project_name}/{file_path}"
                
                # Write the file to the ZIP archive
                zf.writestr(zip_path, content)
        
        # Seek to the beginning of the BytesIO object
        memory_file.seek(0)
        
        # Return the ZIP as bytes
        return memory_file.getvalue()
    
    def create_zip_archive_with_stream(self, virtual_fs: Dict[str, str], project_name: str = "generated_angular_project") -> io.BytesIO:
        """
        Creates a ZIP archive from a virtual file system structure and returns it as a stream.
        
        Args:
            virtual_fs: Dictionary mapping file paths to content
            project_name: Name of the root folder in the ZIP archive
            
        Returns:
            io.BytesIO: The ZIP archive as a stream
        """
        # Create an in-memory ZIP file
        memory_file = io.BytesIO()
        
        # Create a ZIP archive
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Add each file from the virtual file system to the ZIP
            for file_path, content in virtual_fs.items():
                # Create the full path with the project name as the root folder
                zip_path = f"{project_name}/{file_path}"
                
                # Write the file to the ZIP archive
                zf.writestr(zip_path, content)
        
        # Seek to the beginning of the BytesIO object
        memory_file.seek(0)
        
        # Return the stream
        return memory_file 