from fastapi import APIRouter, HTTPException
from app.api.v1.endpoints.scans import SCANS_DB, get_or_create_scan
from app.schemas.scan import MeshResponse, ReconstructionRequest, ReconstructionResponse
from app.services.marching_cubes import extract_3d_mesh, export_mesh_to_formats

import sys
import os

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from src.downsampler import create_sparse_volume
from src.reconstructor import (
    reconstruct_proposed_tri_cnn,
    reconstruct_trilinear,
    reconstruct_linear_z,
    reconstruct_nearest_neighbor,
    reconstruct_cnn,
    reconstruct_gan
)
from src.evaluator import evaluate_reconstruction

router = APIRouter()

@router.post("/{scan_id}/mesh", response_model=MeshResponse)
def generate_3d_mesh(scan_id: str, iso_level: float = 0.25, step_size: int = 1):
    """
    Runs Marching Cubes algorithm to generate 3D brain mesh geometry (GLB, STL, OBJ).
    """
    s = get_or_create_scan(scan_id)
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

@router.post("/{scan_id}/reconstruct", response_model=ReconstructionResponse)
def run_3d_reconstruction(scan_id: str, request: ReconstructionRequest):
    """
    Performs 3D MRI reconstruction using specified method (Proposed Trilinear + 3D CNN, Trilinear, CNN, GAN, etc.).
    Calculates PSNR, SSIM, MAE, and MSE metrics against full-resolution ground truth.
    """
    s = get_or_create_scan(scan_id)
    gt_volume = s["volume"]
    target_depth = gt_volume.shape[0]
    
    factor = request.downsample_factor
    sparse_vol, _ = create_sparse_volume(gt_volume, factor=factor)
    
    method = request.method.lower()
    if method == "proposed":
        rec_vol = reconstruct_proposed_tri_cnn(sparse_vol, target_depth)
        method_name = "Proposed (Trilinear + 3D CNN)"
    elif method in ["trilinear", "tri"]:
        rec_vol = reconstruct_trilinear(sparse_vol, target_depth)
        method_name = "3D Trilinear Interpolation"
    elif method in ["linear", "linear_z"]:
        rec_vol = reconstruct_linear_z(sparse_vol, target_depth)
        method_name = "1D Linear Z Interpolation"
    elif method == "nearest":
        rec_vol = reconstruct_nearest_neighbor(sparse_vol, target_depth)
        method_name = "Nearest Neighbor Interpolation"
    elif method == "cnn":
        rec_vol = reconstruct_cnn(sparse_vol, target_depth)
        method_name = "3D CNN Super-Resolution"
    elif method == "gan":
        rec_vol = reconstruct_gan(sparse_vol, target_depth)
        method_name = "3D GAN Generator"
    else:
        rec_vol = reconstruct_proposed_tri_cnn(sparse_vol, target_depth)
        method_name = "Proposed (Trilinear + 3D CNN)"
        
    metrics = evaluate_reconstruction(rec_vol, gt_volume)
    
    # Regenerate 3D mesh surface for reconstructed volume
    try:
        verts, faces, normals, _ = extract_3d_mesh(rec_vol, iso_level=0.12, spacing=s.get("spacing", (1.0, 1.0, 1.0)), target_spacing=(1.0, 1.0, 1.0), step_size=1)
        export_mesh_to_formats(verts, faces, normals, base_filename=scan_id)
        export_mesh_to_formats(verts, faces, normals, base_filename="brain_3d_mesh")
    except Exception as e:
        print(f"Mesh generation warning for reconstruction {scan_id}: {e}")

    # Store reconstructed volume in scan DB for fast slice viewing
    s["volume"] = rec_vol
    s["pipeline"]["stage"] = "reconstruction_complete"
    s["pipeline"]["message"] = f"Reconstructed using {method_name} at K={factor} (PSNR: {metrics['PSNR (dB)']} dB)"
    
    return ReconstructionResponse(
        scan_id=scan_id,
        method=method_name,
        downsample_factor=factor,
        reconstructed_shape=list(rec_vol.shape),
        metrics=metrics,
        message=f"3D reconstruction completed with {method_name} (PSNR: {metrics['PSNR (dB)']} dB, SSIM: {metrics['SSIM']})"
    )

