import io
from typing import Dict, Optional, Generator, Iterable
import zipfile
import os
import logging

class PackagingService:
    """
    Service responsible for packaging the assembled virtual project file structure
    into a downloadable ZIP archive.
    """
    
    def create_zip_archive(self, virtual_fs: Dict[str, str], project_name: str = "generated_angular_project") -> bytes:
        """
        Creates a complete ZIP archive from a virtual file system structure using Python's built-in zipfile.
        
        Args:
            virtual_fs: Dictionary mapping file paths to content
            project_name: Name of the root folder in the ZIP archive
            
        Returns:
            bytes: The ZIP archive as bytes
        """
        logging.info(f"Creating ZIP archive with {len(virtual_fs)} files")
        
        # Create an in-memory buffer for the ZIP file
        buffer = io.BytesIO()
        
        try:
            # Create a ZIP file with compression
            with zipfile.ZipFile(buffer, mode='w', compression=zipfile.ZIP_DEFLATED) as zip_file:
                # Add each file to the ZIP
                for file_path, content in virtual_fs.items():
                    # Normalize path separators for consistency
                    normalized_path = file_path.replace('\\', '/')
                    # Create the full path with the project name as the root folder
                    zip_path = f"{project_name}/{normalized_path}"
                    
                    # Convert content to bytes if it's a string
                    if isinstance(content, str):
                        content_bytes = content.encode('utf-8')
                    else:
                        content_bytes = content
                    
                    # Write the file to the ZIP
                    zip_file.writestr(zip_path, content_bytes)
                    logging.debug(f"Added file to ZIP: {zip_path}")
            
            # Reset the buffer position to the beginning
            buffer.seek(0)
            
            # Read the entire ZIP file into memory
            zip_data = buffer.getvalue()
            
            # Verify the ZIP file is valid
            with zipfile.ZipFile(io.BytesIO(zip_data)) as verification:
                # Test the integrity of the entire ZIP file
                bad_file = verification.testzip()
                if bad_file:
                    raise zipfile.BadZipFile(f"Corrupt ZIP file, bad file: {bad_file}")
            
            logging.info(f"Successfully created ZIP archive, size: {len(zip_data)} bytes")
            return zip_data
            
        except Exception as e:
            logging.error(f"Error creating ZIP archive: {str(e)}")
            raise e
        finally:
            # Ensure we close the buffer
            buffer.close()
    
    # Keep the streaming method as a backup, but we'll prioritize the complete archive
    def create_zip_stream(self, virtual_fs: Dict[str, str], project_name: str = "generated_angular_project") -> Generator[bytes, None, None]:
        """
        Creates a ZIP archive as a stream from a virtual file system structure.
        This is a fallback method and should only be used if create_zip_archive fails.
        
        Args:
            virtual_fs: Dictionary mapping file paths to content
            project_name: Name of the root folder in the ZIP archive
            
        Returns:
            Generator[bytes, None, None]: A generator yielding chunks of the ZIP file
        """
        try:
            # Create a zipstream archive with compression
            z = zipstream.ZipFile(compression=zipstream.ZIP_DEFLATED)
            
            # Add each file from the virtual file system to the ZIP
            for file_path, content in virtual_fs.items():
                # Normalize path separators
                normalized_path = file_path.replace('\\', '/')
                # Create the full path with the project name as the root folder
                zip_path = f"{project_name}/{normalized_path}"
                
                # Convert to bytes if it's a string
                if isinstance(content, str):
                    content_bytes = content.encode('utf-8')
                else:
                    content_bytes = content
                    
                # Add to the zip
                z.write_iter(zip_path, [content_bytes])
            
            # Return the generator
            return z
        except Exception as e:
            import logging
            logging.error(f"Error creating ZIP stream: {str(e)}")
            raise e 