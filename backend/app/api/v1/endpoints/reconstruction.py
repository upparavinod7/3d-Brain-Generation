from fastapi import APIRouter, HTTPException
from app.api.v1.endpoints.scans import SCANS_DB
from app.schemas.scan import MeshResponse
from app.services.marching_cubes import extract_3d_mesh, export_mesh_to_formats

router = APIRouter()

@router.post("/{scan_id}/mesh", response_model=MeshResponse)
def generate_3d_mesh(scan_id: str, iso_level: float = 0.25, step_size: int = 1):
    """
    Runs Marching Cubes algorithm to generate 3D brain mesh geometry (GLB, STL, OBJ).
    """
    if scan_id not in SCANS_DB:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    s = SCANS_DB[scan_id]
    vol = s["volume"]
    spacing = s["spacing"]
    
    verts, faces, normals = extract_3d_mesh(vol, iso_level=iso_level, spacing=spacing, step_size=step_size)
    
    paths = export_mesh_to_formats(verts, faces, normals, base_filename=f"mesh_{scan_id}")
    
    return MeshResponse(
        scan_id=scan_id,
        vertex_count=len(verts),
        face_count=len(faces),
        stl_url=f"/static/outputs/mesh_{scan_id}.stl",
        obj_url=f"/static/outputs/mesh_{scan_id}.obj",
        glb_url=f"/static/outputs/mesh_{scan_id}.glb",
        geometry=paths["json_geometry"]
    )
