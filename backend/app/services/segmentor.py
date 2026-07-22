import numpy as np

def segment_brain_tissue(volume, threshold_csf=0.25, threshold_gm=0.55, threshold_wm=0.82):
    """
    Multi-class brain tissue segmentation pipeline based on intensity distribution 
    and spatial clustering.

    Labels:
        0: Background
        1: Cerebrospinal Fluid (CSF) & Ventricles
        2: Grey Matter (GM)
        3: White Matter (WM)
        4: Abnormality / Hyperintense Lesion
    """
    # Skull stripping / background mask thresholding
    brain_mask = volume > 0.08
    
    seg_mask = np.zeros(volume.shape, dtype=np.uint8)
    
    # 1. CSF
    seg_mask[brain_mask & (volume <= threshold_csf)] = 1
    
    # 2. Grey Matter
    seg_mask[brain_mask & (volume > threshold_csf) & (volume <= threshold_gm)] = 2
    
    # 3. White Matter
    seg_mask[brain_mask & (volume > threshold_gm) & (volume <= threshold_wm)] = 3
    
    # 4. Hyperintense Lesion / Abnormality
    seg_mask[brain_mask & (volume > threshold_wm)] = 4
    
    return seg_mask

def compute_dice_coefficient(pred_mask, gt_mask, label=1):
    """
    Calculates the Dice Similarity Coefficient (DSC) for a specific class label.
    Formula: 2 * |P ∩ G| / (|P| + |G|)
    """
    pred = (pred_mask == label)
    gt = (gt_mask == label)
    
    intersection = np.sum(pred & gt)
    total = np.sum(pred) + np.sum(gt)
    
    if total == 0:
        return 1.0
    return float(2.0 * intersection / total)

def compute_volumetric_statistics(seg_mask, spacing=(1.5, 1.0, 1.0)):
    """
    Computes absolute volumes in cm³ for each segmented brain structure.
    V_voxel = voxel_depth * voxel_height * voxel_width (in mm³)
    V_cm3 = V_voxel / 1000.0
    """
    voxel_vol_mm3 = np.prod(spacing)
    voxel_vol_cm3 = voxel_vol_mm3 / 1000.0
    
    csf_voxels = np.sum(seg_mask == 1)
    gm_voxels = np.sum(seg_mask == 2)
    wm_voxels = np.sum(seg_mask == 3)
    lesion_voxels = np.sum(seg_mask == 4)
    total_brain_voxels = csf_voxels + gm_voxels + wm_voxels + lesion_voxels
    
    stats = {
        "total_brain_volume_cm3": round(float(total_brain_voxels * voxel_vol_cm3), 2),
        "grey_matter_volume_cm3": round(float(gm_voxels * voxel_vol_cm3), 2),
        "white_matter_volume_cm3": round(float(wm_voxels * voxel_vol_cm3), 2),
        "csf_volume_cm3": round(float(csf_voxels * voxel_vol_cm3), 2),
        "lesion_volume_cm3": round(float(lesion_voxels * voxel_vol_cm3), 2),
        "percentages": {
            "grey_matter": round(float(gm_voxels / max(total_brain_voxels, 1) * 100), 1),
            "white_matter": round(float(wm_voxels / max(total_brain_voxels, 1) * 100), 1),
            "csf": round(float(csf_voxels / max(total_brain_voxels, 1) * 100), 1),
            "lesion": round(float(lesion_voxels / max(total_brain_voxels, 1) * 100), 1),
        }
    }
    return stats
