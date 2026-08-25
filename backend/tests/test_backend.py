import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.synthetic_brain import generate_synthetic_3d_brain
from app.services.preprocessor import preprocess_medical_volume
from app.services.segmentor import segment_brain_tissue, compute_dice_coefficient, compute_volumetric_statistics
from app.services.marching_cubes import extract_3d_mesh, export_mesh_to_formats

from app.core.config import settings

client = TestClient(app, headers={"X-API-Key": settings.API_KEY})

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_synthetic_brain_generator():
    vol, seg, meta = generate_synthetic_3d_brain(shape=(32, 64, 64), has_lesion=True)
    assert vol.shape == (32, 64, 64)
    assert seg.shape == (32, 64, 64)
    assert meta["has_pathology"] is True

def test_preprocessing():
    vol, _, _ = generate_synthetic_3d_brain(shape=(16, 32, 32))
    proc_vol = preprocess_medical_volume(vol, apply_clahe=True, apply_denoise=True)
    assert proc_vol.shape == (16, 32, 32)
    assert proc_vol.min() >= 0.0 and proc_vol.max() <= 1.0

def test_segmentation_and_metrics():
    vol, seg, _ = generate_synthetic_3d_brain(shape=(16, 32, 32))
    pred_seg = segment_brain_tissue(vol)
    assert pred_seg.shape == (16, 32, 32)
    
    dice = compute_dice_coefficient(pred_seg, seg, label=2)
    assert 0.0 <= dice <= 1.0
    
    stats = compute_volumetric_statistics(seg)
    assert "total_brain_volume_cm3" in stats

def test_marching_cubes_mesh():
    vol, _, _ = generate_synthetic_3d_brain(shape=(16, 32, 32))
    verts, faces, normals, resampled_shape = extract_3d_mesh(vol, iso_level=0.3)
    assert len(verts) > 0
    assert len(faces) > 0
    assert len(resampled_shape) == 3

def test_synthetic_scan_api():
    payload = {
        "has_lesion": True,
        "noise_level": 0.02,
        "shape": [16, 32, 32],
        "spacing": [1.5, 1.0, 1.0]
    }
    response = client.post("/api/v1/scans/synthetic", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "SYNTH-" in data["scan_id"]
    
    # Test slice API
    slice_resp = client.get(f"/api/v1/scans/{data['scan_id']}/slice/axial/8")
    assert slice_resp.status_code == 200
    slice_data = slice_resp.json()
    assert "mri" in slice_data

def test_reconstruction_api():
    synth_resp = client.post("/api/v1/scans/synthetic", json={"shape": [16, 32, 32], "spacing": [1.5, 1.0, 1.0]})
    scan_id = synth_resp.json()["scan_id"]
    
    rec_resp = client.post(f"/api/v1/reconstruction/{scan_id}/reconstruct", json={"method": "proposed", "downsample_factor": 2})
    assert rec_resp.status_code == 200
    rec_data = rec_resp.json()
    assert "Proposed" in rec_data["method"]
    assert "PSNR (dB)" in rec_data["metrics"]
    assert rec_data["metrics"]["PSNR (dB)"] > 0

def test_api_key_security():
    # Unauthenticated client without API key header
    unauth_client = TestClient(app)
    unauth_resp = unauth_client.post("/api/v1/scans/synthetic", json={"shape": [16, 32, 32]})
    assert unauth_resp.status_code == 401
    
    # Client with invalid API key
    invalid_client = TestClient(app, headers={"X-API-Key": "invalid_fake_key_12345"})
    invalid_resp = invalid_client.post("/api/v1/scans/synthetic", json={"shape": [16, 32, 32]})
    assert invalid_resp.status_code == 403

