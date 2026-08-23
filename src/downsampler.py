import numpy as np

def create_sparse_volume(dense_volume, factor=4):
    """
    Simulates a sparse MRI acquisition by extracting every K-th slice along the Z-axis.
    
    Parameters:
        dense_volume (np.ndarray): 3D Ground Truth array of shape (Z, Y, X).
        factor (int): Downsampling factor K (e.g. K=4 removes 3 out of 4 slices).
        
    Returns:
        tuple:
            - sparse_volume (np.ndarray): Undersampled volume of shape (Z // factor, Y, X).
            - sample_indices (np.ndarray): Indices of the retained slices in the original volume.
    """
    if not isinstance(dense_volume, np.ndarray) or dense_volume.ndim != 3:
        raise ValueError("Input volume must be a 3D NumPy array of shape (Z, Y, X).")
        
    Z = dense_volume.shape[0]
    sample_indices = np.arange(0, Z, factor)
    
    # Slice downsampling along Axis 0 (Z-axis)
    sparse_volume = dense_volume[sample_indices, :, :].copy()
    
    return sparse_volume, sample_indices

if __name__ == "__main__":
    from phantom_generator import generate_synthetic_brain
    
    dense_gt = generate_synthetic_brain(shape=(64, 128, 128))
    sparse, indices = create_sparse_volume(dense_gt, factor=4)
    
    print(f"Dense GT volume shape: {dense_gt.shape}")
    print(f"Sparse volume shape:   {sparse.shape}")
    print(f"Sampled slice indices: {indices}")
