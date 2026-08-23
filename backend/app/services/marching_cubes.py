import os
import numpy as np
import scipy.ndimage as ndimage
from skimage.measure import marching_cubes
import trimesh
from app.services.segmentor import extract_clean_binary_brain_mask

def extract_3d_mesh(volume, iso_level=0.12, spacing=(5.98, 0.898, 0.898), target_spacing=(1.0, 1.0, 1.0), step_size=1):
    """
    Extracts a single continuous 3D anatomical brain surface mesh from MRI volume.
    
    Pipeline:
    1. Robust 3D Brain Extraction (skull stripping) -> Binary brain mask (0=bg, 1=brain)
    2. Anisotropic -> Isotropic 1.0mm resampling
    3. Marching Cubes surface extraction on BINARY MASK at level 0.5
    4. Mesh cleanup (retaining largest connected 3D brain component)
    5. Taubin non-shrinking mesh smoothing
    """
    # 1. Obtain clean 3D binary brain mask (0 = background, 1 = brain)
    if volume.dtype == np.uint8 and np.max(volume) <= 1:
        binary_mask = volume > 0
    else:
        binary_mask = extract_clean_binary_brain_mask(volume) > 0

        
    binary_mask = ndimage.binary_opening(binary_mask, structure=np.ones((2, 2, 2)))
    binary_mask = ndimage.binary_closing(binary_mask, structure=np.ones((3, 3, 3)))
    binary_mask = ndimage.binary_fill_holes(binary_mask)

    # 2. Resample to isotropic grid (1.0mm x 1.0mm x 1.0mm)
    zoom_factors = [spacing[i] / target_spacing[i] for i in range(3)]
    resampled_mask = ndimage.zoom(binary_mask.astype(float), zoom_factors, order=1) > 0.45

    # 3. Marching Cubes extraction
    verts, faces, normals, values = marching_cubes(
        resampled_mask,
        level=0.5,
        spacing=target_spacing,
        step_size=step_size
    )

    # 4. Filter connected components (keep largest continuous brain component)
    mesh = trimesh.Trimesh(vertices=verts, faces=faces, vertex_normals=normals)
    components = mesh.split(only_watertight=False)
    if len(components) > 0:
        mesh = max(components, key=lambda c: len(c.vertices))

    # 5. Taubin smoothing (preserves anatomical gyri & sulci folds without shrinking)
    trimesh.smoothing.filter_taubin(mesh, iterations=8)
    mesh.fix_normals()

    return mesh.vertices, mesh.faces, mesh.vertex_normals, list(resampled_mask.shape)

def export_mesh_to_formats(verts, faces, normals=None, base_filename="brain_3d_mesh", output_dir="storage/outputs"):
    """
    Exports 3D mesh to STL, OBJ, and GLB formats.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    mesh = trimesh.Trimesh(vertices=verts, faces=faces, vertex_normals=normals)
    filepaths = {}

    # GLB export
    glb_path = os.path.join(output_dir, f"{base_filename}.glb")
    mesh.export(glb_path, file_type="glb")
    filepaths["glb"] = glb_path

    # STL export
    stl_path = os.path.join(output_dir, f"{base_filename}.stl")
    mesh.export(stl_path, file_type="stl")
    filepaths["stl"] = stl_path

    # OBJ export
    obj_path = os.path.join(output_dir, f"{base_filename}.obj")
    mesh.export(obj_path, file_type="obj")
    filepaths["obj"] = obj_path

    return filepaths

