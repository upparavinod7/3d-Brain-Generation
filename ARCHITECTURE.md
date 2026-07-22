# Technical Architecture Specification: 3D Brain Generation AI Platform

---

## System Overview

The 3D Brain Generation AI Platform is designed as a high-performance, modular medical imaging platform. It decouples core volumetric signal processing and deep learning inference from client-side WebGL rendering.

```
+-------------------------------------------------------------------------+
|                              NEXT.JS FRONTEND                           |
|  [R3F 3D Canvas]   [2D Orthogonal Viewers]   [Ingestion Drag-Drop]     |
+-------------------------------------------------------------------------+
                                   | HTTP / JSON REST
                                   v
+-------------------------------------------------------------------------+
|                             FASTAPI BACKEND                             |
|  [Ingestion Engine] [Anonymizer] [Preprocessor] [Marching Cubes Engine] |
+-------------------------------------------------------------------------+
                                   |
                                   v
+-------------------------------------------------------------------------+
|                          MEDICAL AI CORE ENGINE                         |
|  [SimpleITK / NiBabel] [PyTorch / MONAI U-Net] [Trimesh GLB Exporter]  |
+-------------------------------------------------------------------------+
```

---

## Data Pipeline Specifications

### 1. File Ingestion & Anonymization
- Reads DICOM series (`.dcm`), NIfTI (`.nii`, `.nii.gz`), NRRD, and MHA.
- Strips HIPAA PHI tags (`PatientName`, `PatientID`, `DOB`, `Institution`).
- Standardizes physical voxel dimensions to isotropic RAS+ orientation.

### 2. Signal Preprocessing
- Min-Max & Z-Score Intensity Normalization.
- N4 Bias Field Correction & Gaussian Denoising ($\sigma = 0.7$).
- 3D Contrast-Limited Adaptive Histogram Equalization (CLAHE).

### 3. Multi-Class Segmentation
- Class 0: Background
- Class 1: Cerebrospinal Fluid (CSF) & Ventricles
- Class 2: Grey Matter (Cortex)
- Class 3: White Matter (Subcortical)
- Class 4: Pathology / Hyperintense Lesion

### 4. 3D Surface Extraction (Marching Cubes)
- Converts 3D volumetric array into triangulated surface mesh via `skimage.measure.marching_cubes`.
- Applies Laplacian mesh smoothing.
- Exports binary STL, OBJ, and GLB format.
