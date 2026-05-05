import os
import numpy as np
from src.data_handler import load_dicom_series, extract_pixel_data, get_physical_spacing
from src.anonymizer import anonymize_series
from src.preprocessor import preprocess_volume
from src.reconstructor import reconstruct_3d_volume
from src.visualizer import show_slice, show_3d_brain

def main():
    print("=== 3D MRI Reconstruction Pipeline ===")
    
    raw_data_dir = os.path.join("data", "raw")
    
    # Check if data directory exists and has files
    if not os.path.exists(raw_data_dir) or len(os.listdir(raw_data_dir)) == 0:
        print(f"Error: No DICOM files found in {raw_data_dir}")
        print("Please place your sample .dcm files in that folder and run again.")
        # Creating dummy folders so user sees where to put data
        os.makedirs(raw_data_dir, exist_ok=True)
        os.makedirs(os.path.join("data", "processed"), exist_ok=True)
        os.makedirs(os.path.join("data", "output"), exist_ok=True)
        return

    print("\n[1/7] Loading and arranging MRI slices...")
    dicom_series = load_dicom_series(raw_data_dir)
    print(f"Loaded {len(dicom_series)} slices.")
    
    print("\n[2/7] Anonymizing metadata...")
    clean_series = anonymize_series(dicom_series)
    
    print("\n[3/7] Extracting pixel data...")
    volume = extract_pixel_data(clean_series)
    spacing = get_physical_spacing(clean_series)
    print(f"Original volume shape: {volume.shape}")
    print(f"Physical spacing (Z, Y, X): {spacing}")
    
    print("\n[4/7] Hybrid Method Part 1: Image Enhancement (CLAHE + Noise Removal)...")
    processed_volume = preprocess_volume(volume)
    
    print("\n[5/7] Hybrid Method Part 2: Trilinear Interpolation...")
    # Dynamically calculate target slices for an Isotropic (perfectly proportional) volume
    # Target depth = current_depth * (Z_spacing / X_spacing)
    isotropic_target_depth = int(volume.shape[0] * (spacing[0] / min(spacing[1], spacing[2])))
    print(f"Calculated optimal isotropic depth: {isotropic_target_depth} slices")
    
    reconstructed_volume = reconstruct_3d_volume(processed_volume, target_depth=isotropic_target_depth)
    print(f"Reconstructed volume shape: {reconstructed_volume.shape}")
    
    # Calculate new Z spacing after interpolation
    new_z_space = spacing[0] * (volume.shape[0] / isotropic_target_depth)
    new_spacing = (new_z_space, spacing[1], spacing[2])
    
    print("\n[6/7] Creating 3D representation...")
    # Show a middle slice to verify it looks correct before 3D mapping
    mid_slice = reconstructed_volume[reconstructed_volume.shape[0] // 2]
    show_slice(mid_slice, "Middle Slice (Reconstructed)")
    
    print("\n[7/7] Visualization...")
    show_3d_brain(reconstructed_volume, spacing=new_spacing)
    
    print("\n=== Pipeline Complete ===")

if __name__ == "__main__":
    main()
