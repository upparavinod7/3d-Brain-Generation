import numpy as np

def calculate_psnr(original, reconstructed):
    """
    Peak Signal-to-Noise Ratio (PSNR) calculation.
    """
    mse = np.mean((original - reconstructed) ** 2)
    if mse == 0:
        return float('inf')
    max_pixel = 1.0 if np.max(original) <= 1.0 else 255.0
    return float(20 * np.log10(max_pixel / np.sqrt(mse)))
