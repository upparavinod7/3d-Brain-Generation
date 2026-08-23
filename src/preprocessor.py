import numpy as np
import cv2

def robust_intensity_normalization(volume, p_low=1.0, p_high=99.0):
    """
    Applies percentile-based robust intensity normalization to [0.0, 1.0].
    
    Parameters:
        volume (np.ndarray): 3D float32 input volume.
        p_low (float): Lower intensity percentile threshold (default 1.0%).
        p_high (float): Upper intensity percentile threshold (default 99.0%).
        
    Returns:
        np.ndarray: Normalized 3D volume with range [0.0, 1.0].
    """
    vol = volume.astype(np.float32)
    
    # Compute robust percentile thresholds over foreground (non-zero voxels)
    non_zero_voxels = vol[vol > 0.01]
    if len(non_zero_voxels) == 0:
        q_low, q_high = np.percentile(vol, (p_low, p_high))
    else:
        q_low, q_high = np.percentile(non_zero_voxels, (p_low, p_high))
        
    if q_high <= q_low:
        q_high = q_low + 1e-5
        
    # Clip outliers and scale to [0, 1]
    vol_clipped = np.clip(vol, q_low, q_high)
    vol_norm = (vol_clipped - q_low) / (q_high - q_low)
    
    return vol_norm

def apply_clahe_2d_slice(slice_2d, clip_limit=2.0, tile_grid_size=(8, 8)):
    """
    Applies Contrast-Limited Adaptive Histogram Equalization (CLAHE) to a 2D slice.
    
    Parameters:
        slice_2d (np.ndarray): 2D float32 slice in range [0, 1].
        clip_limit (float): Threshold for contrast limiting.
        tile_grid_size (tuple): Size of grid for histogram equalization.
        
    Returns:
        np.ndarray: Enhanced 2D float32 slice in range [0, 1].
    """
    # OpenCV CLAHE expects 8-bit integer input
    slice_uint8 = (np.clip(slice_2d, 0, 1) * 255.0).astype(np.uint8)
    
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    enhanced_uint8 = clahe.apply(slice_uint8)
    
    return (enhanced_uint8.astype(np.float32) / 255.0)

def preprocess_volume(volume, apply_clahe=False):
    """
    Full 3D Preprocessing Pipeline for MRI Volumes.
    
    Parameters:
        volume (np.ndarray): Input 3D volume (Z, Y, X).
        apply_clahe (bool): Whether to perform CLAHE enhancement.
        
    Returns:
        np.ndarray: Preprocessed 3D volume normalized to [0, 1].
    """
    # Step 1: Robust Percentile Normalization
    norm_vol = robust_intensity_normalization(volume)
    
    # Step 2: Optional Slice-by-Slice CLAHE enhancement
    if apply_clahe:
        enhanced_slices = [apply_clahe_2d_slice(norm_vol[z]) for z in range(norm_vol.shape[0])]
        norm_vol = np.stack(enhanced_slices, axis=0)
        
    return norm_vol

def apply_preprocessing(image_slice):
    """
    Normalizes a 2D image slice to [0, 1].
    """
    slice_min = np.min(image_slice)
    slice_max = np.max(image_slice)
    if slice_max > slice_min:
        return (image_slice - slice_min) / (slice_max - slice_min)
    return image_slice

if __name__ == "__main__":
    from src.phantom_generator import generate_synthetic_brain
    raw_vol = generate_synthetic_brain() * 2000.0  # Scale to raw intensity range
    proc_vol = preprocess_volume(raw_vol, apply_clahe=True)
    
    print(f"Raw Vol Range:  [{raw_vol.min():.1f}, {raw_vol.max():.1f}]")
    print(f"Processed Range: [{proc_vol.min():.4f}, {proc_vol.max():.4f}]")

