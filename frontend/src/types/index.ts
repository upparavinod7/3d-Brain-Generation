export interface VolumetricStats {
  total_brain_volume_cm3: number;
  grey_matter_volume_cm3: number;
  white_matter_volume_cm3: number;
  csf_volume_cm3: number;
  lesion_volume_cm3: number;
  percentages: {
    grey_matter: number;
    white_matter: number;
    csf: number;
    lesion: number;
  };
}

export interface PipelineSnapshot {
  status: string;
  stage: string;
  progress: number;
  message: string;
  scan_id: string;
  has_pathology: boolean;
  artifacts: string[];
  steps: string[];
  volumetric_summary: {
    total_volume_cm3: number;
    lesion_volume_cm3: number;
  };
}

export interface ScanData {
  scan_id: string;
  status: string;
  dimensions: number[];
  spacing: number[];
  modality: string;
  has_pathology: boolean;
  pathology_type: string;
  volumetric_stats?: VolumetricStats;
  created_at: string;
  pipeline?: PipelineSnapshot;
}

export interface MeshData {
  scan_id: string;
  vertex_count: number;
  face_count: number;
  stl_url: string;
  obj_url: string;
  glb_url: string;
  geometry?: {
    vertices: number[][];
    faces: number[][];
    normals: number[][];
  };
}

export interface SliceData {
  axis: string;
  index: number;
  mri: number[][];
  segmentation: number[][];
}

export interface ReconstructionData {
  scan_id: string;
  method: string;
  downsample_factor: number;
  reconstructed_shape: number[];
  metrics: {
    'PSNR (dB)': number;
    SSIM: number;
    MAE: number;
    MSE: number;
  };
  message: string;
}

