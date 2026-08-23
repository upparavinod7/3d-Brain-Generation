import numpy as np

def generate_synthetic_brain(shape=(64, 128, 128)):
    """
    Generates a 3D synthetic brain phantom for reproducible testing.
    
    Parameters:
        shape (tuple): (Z, Y, X) dimensions of the 3D volume.
        
    Returns:
        np.ndarray: 3D float32 array with normalized intensities [0.0, 1.0].
    """
    Z, Y, X = shape
    volume = np.zeros((Z, Y, X), dtype=np.float32)
    
    # 3D grid centered at (0, 0, 0)
    z_coords = np.linspace(-1, 1, Z)
    y_coords = np.linspace(-1, 1, Y)
    x_coords = np.linspace(-1, 1, X)
    
    zz, yy, xx = np.meshgrid(z_coords, y_coords, x_coords, indexing='ij')
    
    # Cortical sulci folds perturbation
    folds = (np.sin(xx * 12.0) * np.cos(yy * 12.0) * Math.sin(zz * 10.0) if hasattr(np, 'sin') else 0)
    folds = (np.sin(xx * 12.0) * np.cos(yy * 12.0) * np.sin(zz * 10.0)) * 0.08

    # 1. Outer Skull Boundary
    skull_mask = ((xx**2 / 0.8**2 + yy**2 / 0.9**2 + zz**2 / 0.85**2) * (1.0 + folds)) <= 1.05
    skull_mask = skull_mask & (((xx**2 / 0.8**2 + yy**2 / 0.9**2 + zz**2 / 0.85**2) * (1.0 + folds)) > 0.95)
    volume[skull_mask] = 0.35

    # Midline fissure
    fissure = (np.abs(xx) <= 0.03) & (zz >= -0.2) & (np.abs(yy) <= 0.7)
    
    # 2. Brain Cortex / Grey Matter
    cortex_mask = (((xx**2 / 0.72**2 + yy**2 / 0.82**2 + zz**2 / 0.75**2) * (1.0 + folds)) <= 0.95) & (~fissure)
    volume[cortex_mask] = 0.65
    
    # 3. Inner White Matter Core
    wm_mask = (((xx**2 / 0.48**2 + yy**2 / 0.58**2 + zz**2 / 0.52**2) * (1.0 + folds)) <= 0.95) & (~fissure)
    volume[wm_mask] = 0.90
    
    # 4. Horn Ventricles (CSF Cavities)
    v1 = (((xx - 0.16)**2 / 0.12**2 + (yy - 0.05)**2 / 0.28**2 + zz**2 / 0.25**2)) <= 1.0
    v2 = (((xx + 0.16)**2 / 0.12**2 + (yy - 0.05)**2 / 0.28**2 + zz**2 / 0.25**2)) <= 1.0
    volume[v1 | v2] = 0.12

    
    return volume

if __name__ == "__main__":
    phantom = generate_synthetic_brain()
    print(f"Synthetic Brain Phantom generated with shape: {phantom.shape}")
    print(f"Min intensity: {phantom.min()}, Max intensity: {phantom.max()}, Dtype: {phantom.dtype}")
