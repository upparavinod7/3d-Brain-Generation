import os
import numpy as np
import torch
from scipy.ndimage import map_coordinates, zoom

from src.models.cnn_3d import SRCNN3D
from src.models.gan_3d import Generator3D
from src.models.tri_cnn_3d import TrilinearCNNRefinement3D

# Global lightweight baseline models
_cnn_model = SRCNN3D()
_cnn_model.eval()

_gan_generator = Generator3D()
_gan_generator.eval()

# Proposed Model Instance
_tri_cnn_model = TrilinearCNNRefinement3D(base_channels=32, num_blocks=2)
_checkpoint_path = os.path.join("data", "output", "model", "tri_cnn_3d.pt")
if os.path.exists(_checkpoint_path):
    try:
        _tri_cnn_model.load_state_dict(torch.load(_checkpoint_path, map_location="cpu"))
        print(f"[Reconstructor] Loaded trained Proposed Model checkpoint from {_checkpoint_path}")
    except Exception as e:
        print(f"[Reconstructor] Note: Using randomly initialized Proposed Model ({e})")
_tri_cnn_model.eval()

def reconstruct_nearest_neighbor(sparse_volume, target_depth):
    """Method 1: Nearest Neighbor Interpolation (Order 0)."""
    Z_sparse, Y, X = sparse_volume.shape
    zoom_factor = (target_depth / Z_sparse, 1.0, 1.0)
    return zoom(sparse_volume, zoom_factor, order=0, mode='nearest')

def reconstruct_linear_z(sparse_volume, target_depth):
    """
    Method 2: 1D Linear Interpolation along Z-axis (Order 1).
    Note: Degenerates identically to Trilinear when X and Y are fully sampled.
    """
    Z_sparse, Y, X = sparse_volume.shape
    zoom_factor = (target_depth / Z_sparse, 1.0, 1.0)
    return zoom(sparse_volume, zoom_factor, order=1, mode='reflect')

def reconstruct_trilinear(sparse_volume, target_depth):
    """
    Method 3: 3D Trilinear Interpolation across (Z, Y, X) grid.
    Note: Reduces mathematically to 1D Linear interpolation along Z when X and Y are on integer grid coordinates.
    """
    Z_sparse, Y, X = sparse_volume.shape
    z_coords = np.linspace(0, Z_sparse - 1, target_depth)
    y_coords = np.arange(Y)
    x_coords = np.arange(X)
    
    zz, yy, xx = np.meshgrid(z_coords, y_coords, x_coords, indexing='ij')
    coords = np.array([zz, yy, xx])
    return map_coordinates(sparse_volume, coords, order=1, mode='reflect')

def reconstruct_cnn(sparse_volume, target_depth):
    """Method 4: 3D CNN Super-Resolution Network."""
    initial = reconstruct_linear_z(sparse_volume, target_depth)
    tensor_in = torch.from_numpy(initial).unsqueeze(0).unsqueeze(0).float()
    with torch.no_grad():
        tensor_out = _cnn_model(tensor_in)
    return tensor_out.squeeze(0).squeeze(0).cpu().numpy()

def reconstruct_gan(sparse_volume, target_depth):
    """Method 5: Standalone 3D GAN Generator."""
    initial = reconstruct_nearest_neighbor(sparse_volume, target_depth)
    tensor_in = torch.from_numpy(initial).unsqueeze(0).unsqueeze(0).float()
    with torch.no_grad():
        tensor_out = _gan_generator(tensor_in)
    return tensor_out.squeeze(0).squeeze(0).cpu().numpy()

def reconstruct_hybrid_trilinear_gan(sparse_volume, target_depth):
    """Method 6: Hybrid Trilinear + 3D GAN Generative Refinement."""
    trilinear_vol = reconstruct_trilinear(sparse_volume, target_depth)
    tensor_in = torch.from_numpy(trilinear_vol).unsqueeze(0).unsqueeze(0).float()
    with torch.no_grad():
        tensor_out = _gan_generator(tensor_in)
    return tensor_out.squeeze(0).squeeze(0).cpu().numpy()

def reconstruct_proposed_tri_cnn(sparse_volume, target_depth):
    """
    PROPOSED METHOD: Trilinear Interpolation + 3D Residual CNN Refinement.
    
    Pipeline:
        Sparse MRI ──► 3D Trilinear Interpolation ──► 3D Residual CNN Refinement ──► Final Reconstructed 3D Volume
    """
    # 1. Trilinear Geometric Initializer
    v_tri = reconstruct_trilinear(sparse_volume, target_depth)
    
    # 2. 3D Residual CNN Correction
    tensor_in = torch.from_numpy(v_tri).unsqueeze(0).unsqueeze(0).float()
    with torch.no_grad():
        tensor_out = _tri_cnn_model(tensor_in)
        
    return tensor_out.squeeze(0).squeeze(0).cpu().numpy()
