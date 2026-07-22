from scipy.ndimage import zoom

def reconstruct_3d_volume(volume, target_depth):
    """
    Interpolates 2D stacked slices along the depth axis Z to construct an isotropic 3D volume.
    """
    current_depth = volume.shape[0]
    z_factor = target_depth / max(current_depth, 1)
    reconstructed_volume = zoom(volume, zoom=(z_factor, 1.0, 1.0), order=1)
    return reconstructed_volume
