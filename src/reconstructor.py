import numpy as np
from scipy.ndimage import zoom

def reconstruct_3d_volume(volume, target_depth):
    """
    Module 5 & 6: Reconstruction & 3D Volume Construction
    
    PROPOSED TECHNIQUE: Trilinear Interpolation
    
    This function takes the stacked 2D slices (which have gaps between them)
    and interpolates missing data to create a smooth, continuous 3D volume.
    """
    current_depth = volume.shape[0]
    
    # Calculate the zoom factor for the Z-axis (depth)
    # We leave X and Y (width, height) unchanged by using a zoom factor of 1.0
    z_factor = target_depth / current_depth
    
    # Apply Trilinear Interpolation (order=1 in scipy zoom is linear/trilinear)
    # This fills the missing slices between the original ones.
    print(f"Applying Trilinear Interpolation. Scaling depth from {current_depth} to {target_depth}...")
    reconstructed_volume = zoom(volume, zoom=(z_factor, 1.0, 1.0), order=1)
    
    return reconstructed_volume
