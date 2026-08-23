import os
import time
import json
import pandas as pd
import numpy as np

from src.phantom_generator import generate_synthetic_brain
from src.preprocessor import preprocess_volume
from src.downsampler import create_sparse_volume
from src.reconstructor import (
    reconstruct_nearest_neighbor,
    reconstruct_linear_z,
    reconstruct_trilinear,
    reconstruct_cnn,
    reconstruct_gan,
    reconstruct_proposed_tri_cnn
)
from src.evaluator import evaluate_reconstruction
from src.visualizer import plot_qualitative_comparison

def run_controlled_benchmark(gt_volume=None, downsample_factors=[2, 4, 6]):
    """
    Executes a controlled benchmark comparing all baseline methods against the Proposed Method
    across multiple sparsity levels (K=2, K=4, K=6).
    """
    if gt_volume is None:
        print("[Benchmark] Generating Synthetic Brain Phantom (64x128x128)...")
        raw_gt = generate_synthetic_brain(shape=(64, 128, 128))
        gt_volume = preprocess_volume(raw_gt)
        
    target_depth = gt_volume.shape[0]
    
    methods = {
        "Nearest Neighbor": reconstruct_nearest_neighbor,
        "Linear Z": reconstruct_linear_z,
        "Trilinear": reconstruct_trilinear,
        "3D CNN": reconstruct_cnn,
        "3D GAN": reconstruct_gan,
        "Proposed (Tri+CNN)": reconstruct_proposed_tri_cnn
    }
    
    all_results = {}
    all_rows = []
    
    output_dir = os.path.join("data", "output")
    os.makedirs(output_dir, exist_ok=True)
    
    for K in downsample_factors:
        print("\n" + "=" * 85)
        print(f"       BENCHMARK EVALUATION FOR SPARSITY FACTOR K={K} (Retaining {100//K}% Slices)")
        print("=" * 85)
        
        sparse_vol, _ = create_sparse_volume(gt_volume, factor=K)
        print(f"Sparse Input Shape: {sparse_vol.shape} -> Target Depth: {target_depth} slices\n")
        
        print(f"{'Method':<22} | {'PSNR (dB) ↑':<11} | {'SSIM ↑':<8} | {'MAE ↓':<10} | {'MSE ↓':<10} | {'Time (s) ↓':<10}")
        print("-" * 85)
        
        reconstructions_K = {}
        results_K = {}
        
        for name, method_fn in methods.items():
            t0 = time.time()
            rec_vol = method_fn(sparse_vol, target_depth)
            t_elapsed = time.time() - t0
            
            metrics = evaluate_reconstruction(rec_vol, gt_volume)
            metrics["Time (s)"] = round(t_elapsed, 4)
            
            results_K[name] = metrics
            reconstructions_K[name] = rec_vol
            
            row = {
                "Sparsity K": K,
                "Method": name,
                "PSNR (dB)": metrics["PSNR (dB)"],
                "SSIM": metrics["SSIM"],
                "MAE": metrics["MAE"],
                "MSE": metrics["MSE"],
                "Time (s)": metrics["Time (s)"]
            }
            all_rows.append(row)
            
            print(f"{name:<22} | {metrics['PSNR (dB)']:<11.4f} | {metrics['SSIM']:<8.4f} | {metrics['MAE']:<10.6f} | {metrics['MSE']:<10.6f} | {metrics['Time (s)']:<10.4f}")
            
        print("-" * 85)
        all_results[f"K={K}"] = results_K
        
        # Save slice comparison grid for K=4
        if K == 4:
            plot_qualitative_comparison(gt_volume, reconstructions_K, save_path=os.path.join(output_dir, "benchmark_comparison.png"))
            
    # Export CSV & JSON
    df = pd.DataFrame(all_rows)
    csv_path = os.path.join(output_dir, "metrics.csv")
    json_path = os.path.join(output_dir, "metrics.json")
    
    df.to_csv(csv_path, index=False)
    with open(json_path, "w") as f:
        json.dump(all_results, f, indent=4)
        
    print(f"\n[Benchmark] Complete metrics saved to:")
    print(f"  - CSV:  {csv_path}")
    print(f"  - JSON: {json_path}\n")
    
    return all_results, df

if __name__ == "__main__":
    run_controlled_benchmark(downsample_factors=[2, 4, 6])
