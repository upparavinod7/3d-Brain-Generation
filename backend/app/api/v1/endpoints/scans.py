import os
import uuid
import datetime
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from app.schemas.scan import ScanCreateRequest, ScanProcessRequest, ScanResponse
from app.services.synthetic_brain import generate_synthetic_3d_brain
from app.services.preprocessor import preprocess_medical_volume
from app.services.segmentor import segment_brain_tissue, compute_volumetric_statistics
from app.services.pipeline import pipeline_service

router = APIRouter()

# In-memory storage cache for scan volumes and metadata
SCANS_DB = {}

@router.post("/synthetic", response_model=ScanResponse)
def create_synthetic_scan(request: ScanCreateRequest):
    """
    Generates a high-quality 3D synthetic Brain MRI volume.
    Instantly enables demo testing without uploading large DICOM files.
    """
    scan_id = f"SYNTH-{str(uuid.uuid4())[:8]}"
    
    vol, seg, meta = generate_synthetic_3d_brain(
        shape=tuple(request.shape),
        spacing=tuple(request.spacing),
        has_lesion=request.has_lesion,
        noise_level=request.noise_level
    )
    
    vol_stats = compute_volumetric_statistics(seg, spacing=request.spacing)
    
    pipeline = pipeline_service.build_snapshot(
        scan_id=scan_id,
        has_pathology=meta["has_pathology"],
        volumetric_stats=vol_stats,
    )

    scan_data = {
        "scan_id": scan_id,
        "status": "ready",
        "volume": vol,
        "seg_mask": seg,
        "dimensions": meta["dimensions"],
        "spacing": meta["spacing"],
        "modality": "MR T1-Weighted (Synthetic)",
        "has_pathology": meta["has_pathology"],
        "pathology_type": meta["pathology_type"],
        "volumetric_stats": vol_stats,
        "created_at": datetime.datetime.now().isoformat(),
        "pipeline": pipeline,
    }
    
    SCANS_DB[scan_id] = scan_data
    
    return ScanResponse(
        scan_id=scan_id,
        status="ready",
        dimensions=meta["dimensions"],
        spacing=meta["spacing"],
        modality="MR T1-Weighted (Synthetic)",
        has_pathology=meta["has_pathology"],
        pathology_type=meta["pathology_type"],
        volumetric_stats=vol_stats,
        created_at=scan_data["created_at"],
        pipeline=pipeline,
    )

def get_or_create_scan(scan_id: str):
    if scan_id not in SCANS_DB:
        vol, seg, meta = generate_synthetic_3d_brain(shape=(64, 128, 128), has_lesion=True)
        vol_stats = compute_volumetric_statistics(seg)
        SCANS_DB[scan_id] = {
            "scan_id": scan_id,
            "status": "ready",
            "volume": vol,
            "seg_mask": seg,
            "dimensions": meta["dimensions"],
            "spacing": meta["spacing"],
            "modality": "MR T1-Weighted (Synthetic)",
            "has_pathology": True,
            "pathology_type": "Glioma / Hyperintense Lesion",
            "volumetric_stats": vol_stats,
            "created_at": datetime.datetime.now().isoformat()
        }
    return SCANS_DB[scan_id]

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: str):
    s = get_or_create_scan(scan_id)
    return ScanResponse(
        scan_id=s["scan_id"],
        status=s["status"],
        dimensions=s["dimensions"],
        spacing=s["spacing"],
        modality=s["modality"],
        has_pathology=s["has_pathology"],
        pathology_type=s["pathology_type"],
        volumetric_stats=s["volumetric_stats"],
        created_at=s["created_at"],
        pipeline=s["pipeline"],
    )

@router.get("/{scan_id}/slice/{axis}/{slice_index}")
def get_scan_slice(scan_id: str, axis: str, slice_index: int):
    """
    Returns 2D normalized slice matrix along specified axis ('axial', 'sagittal', 'coronal').
    Includes both grayscale MRI slice intensity and segmentation overlay.
    """
    s = get_or_create_scan(scan_id)
    vol = s["volume"]
    seg = s["seg_mask"]
    
    z_dim, y_dim, x_dim = vol.shape
    
    if axis.lower() == "axial":
        idx = max(0, min(slice_index, z_dim - 1))
        mri_slice = vol[idx, :, :]
        seg_slice = seg[idx, :, :]
    elif axis.lower() == "sagittal":
        idx = max(0, min(slice_index, x_dim - 1))
        mri_slice = vol[:, :, idx]
        seg_slice = seg[:, :, idx]
    elif axis.lower() == "coronal":
        idx = max(0, min(slice_index, y_dim - 1))
        mri_slice = vol[:, idx, :]
        seg_slice = seg[:, idx, :]
    else:
        raise HTTPException(status_code=400, detail="Invalid axis. Choose 'axial', 'sagittal', or 'coronal'")

    return {
        "axis": axis,
        "index": idx,
        "mri": mri_slice.tolist(),
        "segmentation": seg_slice.tolist()
    }
