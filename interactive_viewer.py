import os
import argparse
import numpy as np

from src.data_handler import load_dicom_series, extract_pixel_data, get_physical_spacing
from src.anonymizer import anonymize_series
from src.preprocessor import preprocess_volume
from src.phantom_generator import generate_synthetic_brain
from src.downsampler import create_sparse_volume
from src.reconstructor import (
    reconstruct_nearest_neighbor,
    reconstruct_linear_z,
    reconstruct_trilinear,
    reconstruct_cnn,
    reconstruct_gan,
    reconstruct_proposed_tri_cnn
)
from src.visualizer import show_3d_brain, show_interactive_orthogonal_slicer

def launch_interactive_brain_viewer(method="proposed", mode="volume", downsample_factor=4):
    """
    Launches an interactive 3D Brain Viewer application window.
    
    Parameters:
        method (str): Reconstruction method ('gt', 'nn', 'linear', 'trilinear', 'cnn', 'gan', 'proposed').
        mode (str): 'volume' (3D surface/volume render) or 'slice' (3D orthogonal plane cutter).
        downsample_factor (int): Sparsity factor K (e.g. K=4).
    """
    print("=" * 70)
    print("        INTERACTIVE 3D BRAIN MRI VISUALIZATION TOOL")
    print("=" * 70)
    
    raw_dir = os.path.join("data", "raw")
    dcm_files = [f for f in os.listdir(raw_dir) if f.endswith(".dcm")] if os.path.exists(raw_dir) else []
    
    if len(dcm_files) > 0:
        print(f"[Viewer] Loading DICOM volume ({len(dcm_files)} slices)...")
        series = load_dicom_series(raw_dir)
        series = anonymize_series(series)
        vol_raw = extract_pixel_data(series)
        spacing = get_physical_spacing(series)
    else:
        print("[Viewer] Generating Synthetic 3D Brain Phantom...")
        vol_raw = generate_synthetic_brain(shape=(64, 128, 128))
        spacing = (4.0, 1.0, 1.0)
        
    gt_vol = preprocess_volume(vol_raw)
    target_depth = gt_vol.shape[0]
    
    if method == "gt":
        print("[Viewer] Selected Ground Truth Volume.")
        vol_to_view = gt_vol
        title = "Ground Truth 3D Brain"
    else:
        print(f"[Viewer] Generating sparse volume (K={downsample_factor}) and running '{method}' reconstruction...")
        sparse_vol, _ = create_sparse_volume(gt_vol, factor=downsample_factor)
        
        method_map = {
            "nn": (reconstruct_nearest_neighbor, "Nearest Neighbor"),
            "linear": (reconstruct_linear_z, "Linear Z"),
            "trilinear": (reconstruct_trilinear, "Trilinear Interpolation"),
            "cnn": (reconstruct_cnn, "3D CNN"),
            "gan": (reconstruct_gan, "3D GAN"),
            "proposed": (reconstruct_proposed_tri_cnn, "Proposed Method: Trilinear + 3D CNN Refinement")
        }
        
        if method not in method_map:
            raise ValueError(f"Unknown method '{method}'. Choose from: gt, nn, linear, trilinear, cnn, gan, proposed.")
            
        fn, title_name = method_map[method]
        vol_to_view = fn(sparse_vol, target_depth)
        title = f"{title_name} (K={downsample_factor})"
        
    if mode == "slice":
        show_interactive_orthogonal_slicer(vol_to_view, spacing=spacing, title=title)
    else:
        show_3d_brain(vol_to_view, spacing=spacing, title=title, interactive=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Interactive 3D Brain MRI Viewer")
    parser.add_argument(
        "--method",
        type=str,
        default="proposed",
        choices=["gt", "nn", "linear", "trilinear", "cnn", "gan", "proposed"],
        help="Reconstruction method to visualize (default: proposed)"
    )
    parser.add_argument(
        "--mode",
        type=str,
        default="volume",
        choices=["volume", "slice"],
        help="Viewing mode: 'volume' (3D volume render) or 'slice' (interactive orthogonal slicer)"
    )
    parser.add_argument(
        "--factor",
        type=int,
        default=4,
        help="Sparsity downsampling factor K (default: 4)"
    )
    
    args = parser.parse_args()
    launch_interactive_brain_viewer(method=args.method, mode=args.mode, downsample_factor=args.factor)
