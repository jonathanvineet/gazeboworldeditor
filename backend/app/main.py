"""
Gazebo Studio Backend
FastAPI server for asset management, fuel integration, and mesh processing
"""

from fastapi import FastAPI, HTTPException, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import httpx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Gazebo Studio API",
    version="1.0.0",
    description="Backend API for browser-based robotics simulation IDE"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {"status": "ok", "service": "gazebo-studio-backend"}


# ============================================================================
# FUEL SEARCH
# ============================================================================

FUEL_API_URL = "https://fuel.gazeborobotics.org/1.0"
FUEL_CACHE_DIR = "/tmp/gazebo_fuel_cache"

os.makedirs(FUEL_CACHE_DIR, exist_ok=True)


@app.get("/api/fuel/search")
async def search_fuel_models(q: str = Query(..., min_length=1), page: int = Query(1, ge=1)):
    """
    Search Gazebo Fuel for models
    
    Args:
        q: Search query (model name, tag, etc)
        page: Page number (1-indexed)
    
    Returns:
        List of matching models with metadata
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Search for models in Fuel
            response = await client.get(
                f"{FUEL_API_URL}/models",
                params={
                    "q": q,
                    "page": page,
                    "per_page": 12,
                }
            )
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "results": data.get("results", []),
                "totalCount": data.get("total_count", 0),
                "pageSize": 12,
                "page": page,
            }
            
    except httpx.TimeoutException:
        logger.error(f"Timeout searching Fuel for: {q}")
        raise HTTPException(status_code=504, detail="Fuel server timeout")
    except httpx.HTTPError as e:
        logger.error(f"Error searching Fuel: {e}")
        raise HTTPException(status_code=502, detail="Error connecting to Fuel")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/fuel/model/{owner}/{model_name}")
async def get_fuel_model_metadata(owner: str, model_name: str):
    """Get detailed metadata for a specific Fuel model"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{FUEL_API_URL}/models/{owner}/{model_name}"
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Error fetching model: {e}")
        raise HTTPException(status_code=500, detail="Error fetching model")


@app.get("/api/fuel/download/{owner}/{model_name}")
async def download_fuel_model(owner: str, model_name: str):
    """Download model ZIP from Fuel"""
    try:
        cache_path = os.path.join(FUEL_CACHE_DIR, f"{owner}_{model_name}.zip")
        
        # Check cache first
        if os.path.exists(cache_path):
            return FileResponse(
                path=cache_path,
                filename=f"{model_name}.zip",
                media_type="application/zip"
            )
        
        # Download from Fuel
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(
                f"{FUEL_API_URL}/models/{owner}/{model_name}/files",
                follow_redirects=True
            )
            response.raise_for_status()
            
            # Save to cache
            with open(cache_path, "wb") as f:
                f.write(response.content)
            
            return FileResponse(
                path=cache_path,
                filename=f"{model_name}.zip",
                media_type="application/zip"
            )
            
    except Exception as e:
        logger.error(f"Error downloading model: {e}")
        raise HTTPException(status_code=500, detail="Error downloading model")


# ============================================================================
# ASSET RESOLUTION
# ============================================================================

@app.get("/api/assets/resolve/{path:path}")
async def resolve_asset(path: str):
    """
    Resolve model:// URI to actual asset
    
    Example: model://sun resolves to sun/model.sdf
    """
    # This would fetch from local cache or Fuel
    try:
        if path.startswith("model://"):
            model_name = path.replace("model://", "").split("/")[0]
            
            # Return metadata about where to fetch the model
            return {
                "type": "model",
                "name": model_name,
                "source": "fuel",
                "downloadUrl": f"/api/fuel/download/default/{model_name}"
            }
        
        return {"error": "Invalid asset path"}
    except Exception as e:
        logger.error(f"Error resolving asset: {e}")
        raise HTTPException(status_code=500, detail="Error resolving asset")


# ============================================================================
# IMPORT / UPLOAD
# ============================================================================

@app.post("/api/import/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload and process SDF/URDF/ZIP files"""
    try:
        # Save uploaded file
        upload_dir = "/tmp/gazebo_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        filepath = os.path.join(upload_dir, file.filename)
        
        async with aiofiles.open(filepath, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        return {
            "filename": file.filename,
            "size": len(content),
            "filepath": filepath
        }
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")


# ============================================================================
# EXPORT
# ============================================================================

@app.post("/api/export/world")
async def export_world(world_data: dict):
    """Export world to .world file"""
    try:
        # Convert world_data to SDF XML
        # This would use xmlbuilder or similar
        return {"status": "exported", "format": "world"}
    except Exception as e:
        logger.error(f"Export error: {e}")
        raise HTTPException(status_code=500, detail="Export failed")


# ============================================================================
# PHYSICS PREVIEW
# ============================================================================

@app.post("/api/physics/preview")
async def physics_preview(world_data: dict):
    """Run physics simulation preview"""
    try:
        # This would run a brief physics simulation
        return {"status": "preview_complete"}
    except Exception as e:
        logger.error(f"Physics preview error: {e}")
        raise HTTPException(status_code=500, detail="Physics preview failed")


# ============================================================================
# MESH PROCESSING
# ============================================================================

@app.post("/api/meshes/convert")
async def convert_mesh(file: UploadFile = File(...), target_format: str = Query("glb")):
    """Convert mesh to target format (GLTF, GLB, OBJ, etc)"""
    try:
        # This would use mesh libraries to convert formats
        return {"status": "converted", "format": target_format}
    except Exception as e:
        logger.error(f"Mesh conversion error: {e}")
        raise HTTPException(status_code=500, detail="Mesh conversion failed")


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
