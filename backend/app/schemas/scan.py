from pydantic import BaseModel
from typing import List, Dict, Optional, Any


class PipelineSnapshot(BaseModel):
    status: str
    stage: str
    progress: int
    message: str
    scan_id: str
    has_pathology: bool
    artifacts: List[str]
    steps: List[str]
    volumetric_summary: Dict[str, Any]


class ScanCreateRequest(BaseModel):
    has_lesion: bool = True
    noise_level: float = 0.03
    shape: List[int] = [64, 128, 128]
    spacing: List[float] = [1.5, 1.0, 1.0]

class ScanProcessRequest(BaseModel):
    apply_clahe: bool = True
    apply_denoise: bool = True
    iso_level: float = 0.25

class ScanResponse(BaseModel):
    scan_id: str
    status: str
    dimensions: List[int]
    spacing: List[float]
    modality: str = "MR T1-Weighted"
    has_pathology: bool
    pathology_type: str
    volumetric_stats: Optional[Dict[str, Any]] = None
    created_at: str
    pipeline: PipelineSnapshot

class MeshResponse(BaseModel):
    scan_id: str
    vertex_count: int
    face_count: int
    stl_url: str
    obj_url: str
    glb_url: str
    geometry: Optional[Dict[str, Any]] = None

class ReconstructionRequest(BaseModel):
    method: str = "proposed" # 'proposed', 'trilinear', 'linear', 'nearest', 'cnn', 'gan'
    downsample_factor: int = 4

class ReconstructionResponse(BaseModel):
    scan_id: str
    method: str
    downsample_factor: int
    reconstructed_shape: List[int]
    metrics: Dict[str, float]
    message: str

