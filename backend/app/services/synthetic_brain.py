import numpy as np
from scipy.ndimage import gaussian_filter

def generate_synthetic_3d_brain(
    shape=(64, 128, 128),
    spacing=(1.5, 1.0, 1.0),
    has_lesion=True,
    noise_level=0.03
):
    """
    Generates a high-quality 3D synthetic Brain MRI volume with anatomically 
    plausible brain structure (Skull, Grey Matter, White Matter, Ventricles, CSF, 
    and optional Glioma/Lesion).

    Returns:
        volume: 3D numpy array float32 normalized [0, 1]
        seg_mask: 3D numpy array uint8 (0: Bkg, 1: CSF, 2: GM, 3: WM, 4: Lesion)
        metadata: dict containing spacing, dimensions, pathology info
    """
    z_dim, y_dim, x_dim = shape
    z, y, x = np.ogrid[:z_dim, :y_dim, :x_dim]
    
    center_z, center_y, center_x = z_dim / 2.0, y_dim / 2.0, x_dim / 2.0
    
    # Radii for head skull and brain
    rad_x, rad_y, rad_z = x_dim * 0.38, y_dim * 0.42, z_dim * 0.40
    
    # Normalized radial distance squared
    dist_sq = ((x - center_x) / rad_x) ** 2 + ((y - center_y) / rad_y) ** 2 + ((z - center_z) / rad_z) ** 2
    
    # Base masks
    skull_mask = (dist_sq <= 1.05) & (dist_sq > 0.95)
    brain_mask = dist_sq <= 0.95
    
    # Internal structures: Ventricles (inner bilateral ellipsoids)
    v_left = (((x - (center_x - 12)) / 8) ** 2 + ((y - center_y) / 20) ** 2 + ((z - center_z) / 10) ** 2) <= 1.0
    v_right = (((x - (center_x + 12)) / 8) ** 2 + ((y - center_y) / 20) ** 2 + ((z - center_z) / 10) ** 2) <= 1.0
    ventricles_mask = (v_left | v_right) & brain_mask
    
    # Deep White Matter core
    wm_dist = ((x - center_x) / (rad_x * 0.65)) ** 2 + ((y - center_y) / (rad_y * 0.68)) ** 2 + ((z - center_z) / (rad_z * 0.65)) ** 2
    wm_mask = (wm_dist <= 1.0) & brain_mask & (~ventricles_mask)
    
    # Grey Matter cortex layer (outer layer of brain)
    gm_mask = brain_mask & (~wm_mask) & (~ventricles_mask)
    
    # CSF background & ventricle liquid
    csf_mask = ventricles_mask | ((dist_sq <= 0.98) & (dist_sq > 0.92))
    
    # Lesion / Abnormality
    lesion_mask = np.zeros(shape, dtype=bool)
    if has_lesion:
        les_x, les_y, les_z = center_x + 18, center_y - 10, center_z + 2
        les_dist = (((x - les_x) / 10) ** 2 + ((y - les_y) / 12) ** 2 + ((z - les_z) / 8) ** 2)
        lesion_mask = (les_dist <= 1.0) & brain_mask
    
    # Construct Segmentation Label Map:
    # 0: Background, 1: CSF, 2: Grey Matter, 3: White Matter, 4: Lesion/Tumor
    seg_mask = np.zeros(shape, dtype=np.uint8)
    seg_mask[csf_mask] = 1
    seg_mask[gm_mask] = 2
    seg_mask[wm_mask] = 3
    if has_lesion:
        seg_mask[lesion_mask] = 4
        
    # Construct Synthetic MRI T1-weighted intensity values
    # Standard T1 values: WM > GM > CSF
    volume = np.zeros(shape, dtype=np.float32)
    volume[skull_mask] = 0.6
    volume[gm_mask] = 0.45
    volume[wm_mask] = 0.85
    volume[csf_mask] = 0.15
    if has_lesion:
        # Hyper-intense lesion center with edema ring
        volume[lesion_mask] = 0.95
        
    # Apply spatial smoothing to make transitions organic like real MRI scans
    volume = gaussian_filter(volume, sigma=0.8)
    
    # Add Rician / Gaussian MRI acquisition noise
    noise = np.random.normal(loc=0.0, scale=noise_level, size=shape)
    volume = np.clip(volume + noise, 0.0, 1.0)
    
    metadata = {
        "dimensions": list(shape),
        "spacing": list(spacing),
        "has_pathology": has_lesion,
        "pathology_type": "Glioma / Hyperintense Lesion" if has_lesion else "None",
        "volumes_cm3": {
            "grey_matter": float(np.sum(seg_mask == 2) * np.prod(spacing) / 1000.0),
            "white_matter": float(np.sum(seg_mask == 3) * np.prod(spacing) / 1000.0),
            "csf": float(np.sum(seg_mask == 1) * np.prod(spacing) / 1000.0),
            "lesion": float(np.sum(seg_mask == 4) * np.prod(spacing) / 1000.0) if has_lesion else 0.0,
        }
    }
    
    return volume, seg_mask, metadata
