import os
import sys
import argparse
import numpy as np

# Ensure root and backend directory are in sys.path
root_dir = os.path.abspath(os.path.dirname(__file__))
backend_dir = os.path.join(root_dir, "backend")
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

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
    parser = argparse.ArgumentParser(description="3D Brain Generation & Reconstruction AI Platform")
    parser.add_argument("--serve", action="store_true", help="Start the FastAPI REST backend server")
    parser.add_argument("--port", type=int, default=8000, help="Port to run backend server on")
    parser.add_argument("--benchmark-only", action="store_true", help="Run multi-sparsity benchmark and ablation only")
    args = parser.parse_args()

    if args.serve:
        print(f"Starting FastAPI Backend Server on http://0.0.0.0:{args.port}...")
        import uvicorn
        try:
            from backend.app.main import app
        except ImportError:
            from app.main import app
        uvicorn.run(app, host="0.0.0.0", port=args.port)
        return

    print("=" * 70)
    print("   3D BRAIN MRI RECONSTRUCTION & AI GENERATION PLATFORM")
    print("=" * 70)
    
    raw_data_dir = os.path.join("data", "raw")
    os.makedirs(raw_data_dir, exist_ok=True)
    os.makedirs(os.path.join("data", "processed"), exist_ok=True)
    os.makedirs(os.path.join("data", "output"), exist_ok=True)
    os.makedirs(os.path.join("storage", "outputs"), exist_ok=True)
    
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
    
    print("\n[5/5] Generating 3D Volume Render & Exporting Mesh & PDF Clinical Report...")
    sparse_vol, _ = create_sparse_volume(norm_volume, factor=4)
    proposed_vol = reconstruct_proposed_tri_cnn(sparse_vol, norm_volume.shape[0])
    
    # Try backend mesh export and PDF report generation if backend services available
    try:
        from backend.app.services.segmentor import segment_brain_tissue, compute_volumetric_statistics
        from backend.app.services.marching_cubes import extract_3d_mesh, export_mesh_to_formats
        from backend.app.services.pdf_generator import generate_clinical_pdf_report
        
        pred_seg = segment_brain_tissue(proposed_vol)
        stats = compute_volumetric_statistics(pred_seg)
        verts, faces, normals = extract_3d_mesh(proposed_vol, iso_level=0.25)
        mesh_paths = export_mesh_to_formats(verts, faces, normals, base_filename="brain_3d_mesh", output_dir="storage/outputs")
        pdf_path = os.path.join("storage", "outputs", "Clinical_Report.pdf")
        generate_clinical_pdf_report("MAIN-DEMO-01", {"patient_id": "MAIN-USER", "modality": "MR T1"}, stats, pdf_path)
        print(f" -> Mesh GLB generated: {mesh_paths.get('glb')}")
        print(f" -> Clinical PDF report generated: {pdf_path}")
    except Exception as e:
        print(f" -> Backend pipeline export note: {e}")

    show_3d_brain(proposed_vol, spacing=spacing, title="Proposed Method: Trilinear + 3D CNN Refinement", interactive=False)
    
    print("\n" + "=" * 70)
    print("   PROJECT EXECUTION COMPLETED SUCCESSFULLY!")
    print("   Artifacts saved in data/output/ and storage/outputs/")
    print("=" * 70)
    print("\n💡 TO LAUNCH FASTAPI BACKEND SERVER:")
    print("   Run:  python main.py --serve")
    print("   To launch Interactive 3D PyVista Viewer:")
    print("   Run:  python interactive_viewer.py --method proposed\n")

if __name__ == "__main__":
    main()

