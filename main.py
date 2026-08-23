import os
import numpy as np
from src.data_handler import load_dicom_series, extract_pixel_data, get_physical_spacing
from src.anonymizer import anonymize_series
from src.preprocessor import preprocess_volume
from src.phantom_generator import generate_synthetic_brain
from src.benchmark import run_controlled_benchmark
from src.ablation import run_ablation_study
from src.visualizer import show_3d_brain
from src.reconstructor import reconstruct_proposed_tri_cnn
from src.downsampler import create_sparse_volume

def main():
    print("=" * 70)
    print("   3D BRAIN MRI RECONSTRUCTION: EVALUATION & ABLATION BENCHMARK")
    print("=" * 70)
    
    raw_data_dir = os.path.join("data", "raw")
    os.makedirs(raw_data_dir, exist_ok=True)
    os.makedirs(os.path.join("data", "processed"), exist_ok=True)
    os.makedirs(os.path.join("data", "output"), exist_ok=True)
    
    dicom_files = [f for f in os.listdir(raw_data_dir) if f.endswith(".dcm")]
    
    if len(dicom_files) > 0:
        print(f"\n[1/5] Loading {len(dicom_files)} DICOM slices from {raw_data_dir}...")
        series = load_dicom_series(raw_data_dir)
        series = anonymize_series(series)
        volume = extract_pixel_data(series)
        spacing = get_physical_spacing(series)
        print(f"Loaded DICOM Volume shape: {volume.shape}, Spacing (Z, Y, X): {spacing}")
    else:
        print("\n[1/5] No DICOM files in data/raw/. Generating Synthetic 3D Brain Phantom...")
        volume = generate_synthetic_brain(shape=(64, 128, 128))
        spacing = (4.0, 1.0, 1.0)
        print(f"Synthetic Brain Volume shape: {volume.shape}, Spacing (Z, Y, X): {spacing}")
        
    print("\n[2/5] Preprocessing and Robust Intensity Normalization...")
    norm_volume = preprocess_volume(volume)
    
    print("\n[3/5] Executing Multi-Sparsity Controlled Benchmark (K=2, K=4, K=6)...")
    results, metrics_df = run_controlled_benchmark(norm_volume, downsample_factors=[2, 4, 6])
    
    print("\n[4/5] Executing Formal Ablation Study (K=4)...")
    ablation_df = run_ablation_study(norm_volume, downsample_factor=4)
    
    print("\n[5/5] Generating 3D Volume Render Snapshot for Proposed Method...")
    sparse_vol, _ = create_sparse_volume(norm_volume, factor=4)
    proposed_vol = reconstruct_proposed_tri_cnn(sparse_vol, norm_volume.shape[0])
    show_3d_brain(proposed_vol, spacing=spacing, title="Proposed Method: Trilinear + 3D CNN Refinement", interactive=False)
    
    print("\n" + "=" * 70)
    print("   PROJECT EXECUTION COMPLETED SUCCESSFULLY!")
    print("   Artifacts saved in data/output/")
    print("=" * 70)
    print("\n💡 TO INTERACT WITH THE 3D BRAIN VOLUME IN AN INTERACTIVE WINDOW:")
    print("   Run:  python interactive_viewer.py --method proposed")
    print("   Or for 3D orthogonal slice cutting:")
    print("   Run:  python interactive_viewer.py --method proposed --mode slice\n")

if __name__ == "__main__":
    main()
