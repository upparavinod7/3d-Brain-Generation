import time
import numpy as np
from skimage.metrics import peak_signal_noise_ratio as compute_psnr
from skimage.metrics import structural_similarity as compute_ssim

def compute_mse(target, reference):
    """Computes Mean Squared Error (MSE)."""
    return float(np.mean((target - reference) ** 2))

def compute_mae(target, reference):
    """Computes Mean Absolute Error (MAE)."""
    return float(np.mean(np.abs(target - reference)))

def evaluate_reconstruction(reconstructed_vol, gt_vol, data_range=1.0):
    """
    Evaluates a reconstructed 3D volume against Ground Truth using:
    - Peak Signal-to-Noise Ratio (PSNR) [dB] (Higher is better)
    - Structural Similarity Index (SSIM) [0 to 1] (Higher is better)
    - Mean Absolute Error (MAE) (Lower is better)
    - Mean Squared Error (MSE) (Lower is better)
    
    Parameters:
        reconstructed_vol (np.ndarray): Reconstructed 3D volume array (Z, Y, X).
        gt_vol (np.ndarray): Ground Truth 3D volume array (Z, Y, X).
        data_range (float): Maximum intensity range (default 1.0 for normalized volumes).
        
    Returns:
        dict: Metric dictionary {'PSNR (dB)': float, 'SSIM': float, 'MAE': float, 'MSE': float}
    """
    if reconstructed_vol.shape != gt_vol.shape:
        raise ValueError(f"Shape mismatch: Reconstructed {reconstructed_vol.shape} vs GT {gt_vol.shape}")
        
    # Ensure float32 array casting
    rec = np.clip(reconstructed_vol.astype(np.float32), 0, data_range)
    gt = np.clip(gt_vol.astype(np.float32), 0, data_range)
    
    mse_val = compute_mse(rec, gt)
    mae_val = compute_mae(rec, gt)
    
    # PSNR calculation
    if mse_val < 1e-10:
        psnr_val = 100.0  # Infinite signal-to-noise ratio
    else:
        psnr_val = compute_psnr(gt, rec, data_range=data_range)
        
    # Average 2D slice SSIM across Z-axis to ensure stable spatial window computation
    ssim_scores = [
        compute_ssim(gt[z], rec[z], data_range=data_range) 
        for z in range(gt.shape[0])
    ]
    ssim_val = float(np.mean(ssim_scores))
    
    return {
        "PSNR (dB)": round(float(psnr_val), 4),
        "SSIM": round(float(ssim_val), 4),
        "MAE": round(float(mae_val), 6),
        "MSE": round(float(mse_val), 6)
    }

def calculate_psnr(original, reconstructed):
    """
    Standalone PSNR helper calculation.
    """
    mse = np.mean((original - reconstructed) ** 2)
    if mse == 0:
        return float('inf')
    max_pixel = 1.0 if np.max(original) <= 1.0 else 255.0
    return float(20 * np.log10(max_pixel / np.sqrt(mse)))

def calculate_ssim(original, reconstructed, data_range=1.0):
    """
    Computes average SSIM across all Z slices.
    """
    scores = [
        compute_ssim(original[z], reconstructed[z], data_range=data_range)
        for z in range(original.shape[0])
    ]
    return float(np.mean(scores))

def calculate_dice(pred_mask, gt_mask):
    """
    Computes Dice Similarity Coefficient between two binary masks.
    """
    pred = pred_mask.astype(bool)
    gt = gt_mask.astype(bool)
    intersection = np.sum(pred & gt)
    total = np.sum(pred) + np.sum(gt)
    if total == 0:
        return 1.0
    return float(2.0 * intersection / total)
