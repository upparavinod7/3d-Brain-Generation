import os
import argparse
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from backend.app.services.synthetic_brain import generate_synthetic_3d_brain
    from backend.app.services.preprocessor import preprocess_medical_volume
    from backend.app.services.segmentor import segment_brain_tissue, compute_volumetric_statistics
    from backend.app.services.marching_cubes import extract_3d_mesh, export_mesh_to_formats
    from backend.app.services.pdf_generator import generate_clinical_pdf_report
except ImportError:
    from app.services.synthetic_brain import generate_synthetic_3d_brain
    from app.services.preprocessor import preprocess_medical_volume
    from app.services.segmentor import segment_brain_tissue, compute_volumetric_statistics
    from app.services.marching_cubes import extract_3d_mesh, export_mesh_to_formats
    from app.services.pdf_generator import generate_clinical_pdf_report

def run_cli_pipeline(args):
    print("=" * 65)
    print(" 3D Brain Generation AI Platform - Command Line Pipeline ")
    print("=" * 65)
    
    print("\n[1/5] Generating/Loading 3D Brain MRI Volume...")
    vol, seg, meta = generate_synthetic_3d_brain(
        shape=(64, 128, 128),
        spacing=(1.5, 1.0, 1.0),
        has_lesion=not args.no_pathology
    )
    print(f" -> Volume shape: {vol.shape}, Pathology present: {meta['has_pathology']}")
    
    print("\n[2/5] Applying AI Medical Preprocessing (Normalization + CLAHE + Denoising)...")
    proc_vol = preprocess_medical_volume(vol)
    print(" -> Preprocessing complete.")
    
    print("\n[3/5] Performing Multi-Class Tissue & Abnormality Segmentation...")
    pred_seg = segment_brain_tissue(proc_vol)
    stats = compute_volumetric_statistics(pred_seg)
    print(f" -> Total Brain Volume: {stats['total_brain_volume_cm3']} cm³")
    print(f" -> Grey Matter: {stats['grey_matter_volume_cm3']} cm³ ({stats['percentages']['grey_matter']}%)")
    print(f" -> White Matter: {stats['white_matter_volume_cm3']} cm³ ({stats['percentages']['white_matter']}%)")
    print(f" -> CSF / Ventricles: {stats['csf_volume_cm3']} cm³ ({stats['percentages']['csf']}%)")
    print(f" -> Pathology / Lesion: {stats['lesion_volume_cm3']} cm³ ({stats['percentages']['lesion']}%)")
    
    print("\n[4/5] Executing 3D Marching Cubes Iso-surface Surface Extraction...")
    verts, faces, normals = extract_3d_mesh(proc_vol, iso_level=args.iso_level)
    print(f" -> Mesh vertices: {len(verts)}, faces: {len(faces)}")
    
    output_dir = args.output_dir
    os.makedirs(output_dir, exist_ok=True)
    paths = export_mesh_to_formats(verts, faces, normals, base_filename="cli_brain_mesh", output_dir=output_dir)
    print(f" -> Exported GLB: {paths['glb']}")
    print(f" -> Exported STL: {paths['stl']}")
    print(f" -> Exported OBJ: {paths['obj']}")
    
    print("\n[5/5] Generating Publication-Grade PDF Clinical Report...")
    pdf_path = os.path.join(output_dir, "CLI_Clinical_Report.pdf")
    generate_clinical_pdf_report("CLI-DEMO-01", {"patient_id": "CLI-USER", "modality": "MR T1"}, stats, pdf_path)
    print(f" -> Report generated: {pdf_path}")
    
    print("\n" + "=" * 65)
    print(" Pipeline Completed Successfully! ")
    print("=" * 65)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="3D Brain Generation CLI Pipeline")
    parser.add_argument("--no-pathology", action="store_true", help="Generate normal brain without lesion")
    parser.add_argument("--iso-level", type=float, default=0.25, help="Marching Cubes iso-surface threshold")
    parser.add_argument("--output-dir", type=str, default="storage/outputs", help="Directory for generated artifacts")
    
    args = parser.parse_args()
    run_cli_pipeline(args)
