import numpy as np
from skimage.measure import marching_cubes
import trimesh

def extract_3d_mesh(volume, iso_level=0.2, spacing=(1.5, 1.0, 1.0), step_size=1):
    """
    Extracts a 3D surface mesh from a 3D volumetric array using Marching Cubes.

    Args:
        volume: 3D numpy array
        iso_level: Iso-surface intensity threshold
        spacing: Voxel spacing (Z, Y, X)
        step_size: Step size for voxel sampling (decimation)

    Returns:
        vertices: Nx3 array of float32 coordinates
        faces: Mx3 array of int32 vertex indices
        normals: Nx3 array of surface normals
    """
    if np.max(volume) < iso_level:
        iso_level = np.mean(volume)
        
    verts, faces, normals, values = marching_cubes(
        volume,
        level=iso_level,
        spacing=spacing,
        step_size=step_size
    )
    
    return verts, faces, normals

def export_mesh_to_formats(verts, faces, normals=None, base_filename="brain_mesh", output_dir="storage/outputs"):
    """
    Converts 3D mesh vertices and faces into trimesh object and exports to STL, OBJ, and GLB.
    """
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    mesh = trimesh.Trimesh(vertices=verts, faces=faces, vertex_normals=normals)
    
    # Smooth mesh using Laplacian smoothing for organic curvature
    trimesh.smoothing.filter_laplacian(mesh, iterations=2)
    
    filepaths = {}
    
    # STL export (3D printing ready)
    stl_path = os.path.join(output_dir, f"{base_filename}.stl")
    mesh.export(stl_path, file_type="stl")
    filepaths["stl"] = stl_path
    
    # OBJ export
    obj_path = os.path.join(output_dir, f"{base_filename}.obj")
    mesh.export(obj_path, file_type="obj")
    filepaths["obj"] = obj_path
    
    # GLB export (Web 3D ready)
    glb_path = os.path.join(output_dir, f"{base_filename}.glb")
    mesh.export(glb_path, file_type="glb")
    filepaths["glb"] = glb_path
    
    # Also extract JSON representation for client web rendering if needed
    filepaths["json_geometry"] = {
        "vertices": verts.tolist(),
        "faces": faces.tolist(),
        "normals": normals.tolist() if normals is not None else []
    }
    
    return filepaths
