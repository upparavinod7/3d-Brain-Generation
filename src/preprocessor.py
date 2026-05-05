import cv2
import numpy as np

def apply_preprocessing(image_slice):
    """
    Module 3: Preprocessing Module
    
    Applies noise removal, contrast enhancement, and intensity normalization
    to a single 2D slice.
    """
    # 1. Normalize intensity to 0-255 for OpenCV compatibility
    norm_image = cv2.normalize(image_slice, None, 0, 255, cv2.NORM_MINMAX)
    norm_image = np.uint8(norm_image)
    
    # 2. Noise Removal: Gaussian Blurring
    # Removes high-frequency noise from the MRI scan
    blurred = cv2.GaussianBlur(norm_image, (3, 3), 0)
    
    # 3. Contrast Enhancement: Histogram Equalization (CLAHE)
    # Improves the contrast of the brain tissue without blowing up background noise
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(blurred)
    
    return enhanced

def preprocess_volume(volume_array):
    """
    Applies preprocessing to all slices in a 3D volume.
    """
    processed_slices = []
    for i in range(volume_array.shape[0]):
        processed = apply_preprocessing(volume_array[i])
        processed_slices.append(processed)
        
    return np.array(processed_slices)
