import numpy as np
from cv2 import PSNR

def calculate_psnr(original, reconstructed):
    """
    Module 8: Evaluation Module
    
    Calculates the Peak Signal-to-Noise Ratio (PSNR) between the original
    and reconstructed volumes (if ground truth is available).
    """
    return PSNR(original, reconstructed)

def calcualte_ssim(original, reconstructed):
    pass

def calucalte_dice(original, reconstructed):
    pass

