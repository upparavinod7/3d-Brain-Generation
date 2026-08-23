import os
import json
import pandas as pd
import numpy as np

from src.phantom_generator import generate_synthetic_brain
from src.preprocessor import preprocess_volume
from src.downsampler import create_sparse_volume
from src.reconstructor import (
    reconstruct_linear_z,
    reconstruct_trilinear,
    reconstruct_cnn,
    reconstruct_proposed_tri_cnn
)
from src.evaluator import evaluate_reconstruction

def run_ablation_study(gt_volume=None, downsample_factor=4):
    """
    Executes a formal Ablation Study isolating the impact of:
    - Baseline A: Linear Z
    - Baseline B: Trilinear
    - Baseline C: Standalone 3D CNN
    - Proposed D: Trilinear + 3D CNN Refinement
    """
    if gt_volume is None:
        raw_gt = generate_synthetic_brain(shape=(64, 128, 128))
        gt_volume = preprocess_volume(raw_gt)
        
    sparse_vol, _ = create_sparse_volume(gt_volume, factor=downsample_factor)
    target_depth = gt_volume.shape[0]
    
    ablation_methods = {
        "A. Linear Z": reconstruct_linear_z,
        "B. Trilinear": reconstruct_trilinear,
        "C. Standalone 3D CNN": reconstruct_cnn,
        "D. Proposed (Tri+CNN)": reconstruct_proposed_tri_cnn
    }
    
    results = {}
    for name, fn in ablation_methods.items():
        rec = fn(sparse_vol, target_depth)
        metrics = evaluate_reconstruction(rec, gt_volume)
        results[name] = metrics
        
    print("\n" + "=" * 80)
    print(f"               ABLATION STUDY RESULTS (Sparsity Factor K={downsample_factor})")
    print("=" * 80)
    
    tri_psnr = results["B. Trilinear"]["PSNR (dB)"]
    tri_ssim = results["B. Trilinear"]["SSIM"]
    tri_mae = results["B. Trilinear"]["MAE"]
    tri_mse = results["B. Trilinear"]["MSE"]
    
    df_rows = []
    for name, m in results.items():
        d_psnr = m["PSNR (dB)"] - tri_psnr
        d_ssim = m["SSIM"] - tri_ssim
        d_mae = m["MAE"] - tri_mae
        d_mse = m["MSE"] - tri_mse
        
        row = {
            "Architecture": name,
            "PSNR (dB)": m["PSNR (dB)"],
            "Δ PSNR": round(d_psnr, 4),
            "SSIM": m["SSIM"],
            "Δ SSIM": round(d_ssim, 4),
            "MAE": m["MAE"],
            "Δ MAE": round(d_mae, 6),
            "MSE": m["MSE"],
            "Δ MSE": round(d_mse, 6)
        }
        df_rows.append(row)
        
    df = pd.DataFrame(df_rows)
    print(df.to_string(index=False))
    print("=" * 80)
    
    # Save CSV and JSON
    output_dir = os.path.join("data", "output")
    os.makedirs(output_dir, exist_ok=True)
    df.to_csv(os.path.join(output_dir, "ablation_study.csv"), index=False)
    with open(os.path.join(output_dir, "ablation_study.json"), "w") as f:
        json.dump(results, f, indent=4)
        
    print(f"Ablation results saved to {os.path.join(output_dir, 'ablation_study.csv')}\n")
    return df

if __name__ == "__main__":
    run_ablation_study()
