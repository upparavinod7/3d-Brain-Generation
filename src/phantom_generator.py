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
    
    # Create 3D grid centered at (0, 0, 0)
    z_coords = np.linspace(-1, 1, Z)
    y_coords = np.linspace(-1, 1, Y)
    x_coords = np.linspace(-1, 1, X)
    
    zz, yy, xx = np.meshgrid(z_coords, y_coords, x_coords, indexing='ij')
    
    # 1. Outer Skull Boundary (Ellipsoid: x^2/a^2 + y^2/b^2 + z^2/c^2 <= 1)
    skull_mask = (xx**2 / 0.8**2 + yy**2 / 0.9**2 + zz**2 / 0.85**2) <= 1.0
    volume[skull_mask] = 0.3  # Skull bone / dura intensity
    
    # 2. Brain Cortex / Brain Matter (Inner Ellipsoid)
    cortex_mask = (xx**2 / 0.7**2 + yy**2 / 0.8**2 + zz**2 / 0.75**2) <= 1.0
    volume[cortex_mask] = 0.7  # Grey matter intensity
    
    # 3. Inner White Matter Core
    wm_mask = (xx**2 / 0.5**2 + yy**2 / 0.6**2 + zz**2 / 0.55**2) <= 1.0
    volume[wm_mask] = 0.9  # White matter intensity
    
    # 4. Ventricles (CSF - Fluid Filled Cavities, low/dark signal on T1)
    ventricle1 = ((xx - 0.15)**2 / 0.15**2 + (yy - 0.1)**2 / 0.25**2 + zz**2 / 0.3**2) <= 1.0
    ventricle2 = ((xx + 0.15)**2 / 0.15**2 + (yy - 0.1)**2 / 0.25**2 + zz**2 / 0.3**2) <= 1.0
    volume[ventricle1] = 0.1
    volume[ventricle2] = 0.1
    
    return volume

if __name__ == "__main__":
    phantom = generate_synthetic_brain()
    print(f"Synthetic Brain Phantom generated with shape: {phantom.shape}")
    print(f"Min intensity: {phantom.min()}, Max intensity: {phantom.max()}, Dtype: {phantom.dtype}")
