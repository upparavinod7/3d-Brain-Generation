import cv2
import numpy as np
from scipy.ndimage import gaussian_filter, median_filter

def normalize_intensity(volume, method="minmax"):
    """
    Normalizes 3D volume intensities using min-max scaling or z-score.
    """
    if method == "zscore":
        mean_val = np.mean(volume)
        std_val = np.std(volume)
        if std_val > 0:
            return (volume - mean_val) / std_val
        return volume - mean_val
    else: # minmax
        min_v, max_v = np.min(volume), np.max(volume)
        if max_v > min_v:
            return (volume - min_v) / (max_v - min_v)
        return volume

def apply_clahe_3d(volume, clip_limit=2.0, tile_grid_size=(8, 8)):
    """
    Applies Contrast Limited Adaptive Histogram Equalization (CLAHE)
    slice-by-slice along the axial Z-axis to enhance brain anatomical boundaries.
    """
    processed = np.zeros_like(volume, dtype=np.float32)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    
    for z in range(volume.shape[0]):
        slice_2d = (volume[z] * 255).astype(np.uint8)
        enhanced = clahe.apply(slice_2d)
        processed[z] = enhanced.astype(np.float32) / 255.0
        
    return processed

def denoise_volume(volume, method="gaussian", sigma=0.8):
    """
    Removes high-frequency MRI acquisition noise.
    Supported filters: 'gaussian', 'median'.
    """
    if method == "median":
        return median_filter(volume, size=3)
    else:
        return gaussian_filter(volume, sigma=sigma)

def preprocess_medical_volume(volume, apply_clahe=True, apply_denoise=True):
    """
    Full research-grade preprocessing pipeline:
    1. Min-max Intensity Normalization
    2. Denoising
    3. CLAHE Contrast Enhancement
    """
    norm_vol = normalize_intensity(volume, method="minmax")
    
    if apply_denoise:
        norm_vol = denoise_volume(norm_vol, method="gaussian", sigma=0.7)
        
    if apply_clahe:
        norm_vol = apply_clahe_3d(norm_vol, clip_limit=2.0)
        
    return norm_vol
