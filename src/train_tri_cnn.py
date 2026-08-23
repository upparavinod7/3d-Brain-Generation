import os
import time
import numpy as np
import torch
import torch.nn as nn
from torch.optim import AdamW

from src.models.tri_cnn_3d import TrilinearCNNRefinement3D
from src.downsampler import create_sparse_volume
from src.reconstructor import reconstruct_trilinear
from src.preprocessor import preprocess_volume
from src.phantom_generator import generate_synthetic_brain
from src.data_handler import load_dicom_series, extract_pixel_data, get_physical_spacing

def set_seed(seed=42):
    """Ensures scientific reproducibility."""
    torch.manual_seed(seed)
    np.random.seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

def train_tri_cnn_model(
    gt_volume=None,
    downsample_factor=4,
    epochs=50,
    lr=1e-3,
    save_path="data/output/model/tri_cnn_3d.pt",
    seed=42
):
    """
    Phase B: Training Engine for Proposed Trilinear + 3D CNN Refinement Model.
    
    Training Protocol:
        Dense Volume (GT) ──► Downsample factor K ──► Sparse Volume ──► Trilinear Interpolation ──► Initial V_tri
        Optimization: Minimize L1 Loss between V_final = clamp(V_tri + F_CNN(V_tri), 0, 1) and V_GT.
    """
    set_seed(seed)
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    # 1. Obtain Ground Truth Volume
    if gt_volume is None:
        raw_dir = os.path.join("data", "raw")
        dcm_files = [f for f in os.listdir(raw_dir) if f.endswith(".dcm")] if os.path.exists(raw_dir) else []
        
        if len(dcm_files) > 0:
            print(f"[Train] Loading DICOM GT series ({len(dcm_files)} slices)...")
            series = load_dicom_series(raw_dir)
            vol_raw = extract_pixel_data(series)
            gt_volume = preprocess_volume(vol_raw)
        else:
            print("[Train] Generating Synthetic Brain Phantom GT (64x128x128)...")
            vol_raw = generate_synthetic_brain(shape=(64, 128, 128))
            gt_volume = preprocess_volume(vol_raw)
            
    target_depth = gt_volume.shape[0]
    
    # 2. Simulate Sparse MRI Acquisition
    sparse_vol, _ = create_sparse_volume(gt_volume, factor=downsample_factor)
    
    # 3. Create Initial Physical Geometric Reconstruction via Trilinear Interpolation
    v_tri = reconstruct_trilinear(sparse_vol, target_depth)
    
    # 4. Prepare Tensors (B=1, C=1, Z, Y, X)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[Train] Training on Device: {device}")
    
    input_tensor = torch.from_numpy(v_tri).unsqueeze(0).unsqueeze(0).float().to(device)
    target_tensor = torch.from_numpy(gt_volume).unsqueeze(0).unsqueeze(0).float().to(device)
    
    # 5. Initialize Model, Loss Function & Optimizer
    model = TrilinearCNNRefinement3D(base_channels=32, num_blocks=2).to(device)
    criterion = nn.L1Loss()  # L1 loss preserves sharp anatomical boundaries
    optimizer = AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    
    print(f"[Train] Starting Training for {epochs} Epochs (L1 Loss, AdamW lr={lr})...")
    start_time = time.time()
    
    model.train()
    for epoch in range(1, epochs + 1):
        optimizer.zero_grad()
        output_tensor = model(input_tensor)
        loss = criterion(output_tensor, target_tensor)
        loss.backward()
        optimizer.step()
        
        if epoch == 1 or epoch % 10 == 0 or epoch == epochs:
            print(f"  Epoch [{epoch:02d}/{epochs:02d}] | L1 Loss: {loss.item():.6f}")
            
    elapsed_time = time.time() - start_time
    print(f"[Train] Training Completed in {elapsed_time:.2f} seconds.")
    
    # Save Model Weights
    torch.save(model.state_dict(), save_path)
    print(f"[Train] Model Checkpoint successfully saved to {save_path}")
    
    return model

if __name__ == "__main__":
    train_tri_cnn_model(epochs=30)
