# 🧠 3D Brain Generation & Medical AI Platform

[![MICCAI 2026 Ready](https://img.shields.io/badge/MICCAI-2026-blue.svg)](https://miccai.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js 14+](https://img.shields.io/badge/Next.js-14.2.0-black.svg)](https://nextjs.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2-EE4C2C.svg)](https://pytorch.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docker Ready](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://docker.com)

A FAANG & MICCAI research-grade open-source platform for 3D Brain MRI reconstruction, automatic multi-class tissue segmentation, Marching Cubes mesh generation, 2D orthogonal slice visualization, and clinical PDF report generation.

---

## 🚀 Key Features

- **Interactive 3D Brain WebGL Viewer**: Built with React Three Fiber (`R3F`), Three.js, and Drei. Supports OrbitControls, clipping planes, transparency sliders, tissue highlighting, and wireframe mode.
- **2D Orthogonal Slice Viewer**: Synchronized Axial, Sagittal, and Coronal views with crosshair alignment, Window/Level presets (Brain, Bone, High Contrast), and segmentation overlays.
- **AI Multi-Class Tissue Segmentation**: Automatic segmentation of Grey Matter (GM), White Matter (WM), Cerebrospinal Fluid (CSF/Ventricles), and focal lesions/gliomas with absolute volume calculation ($\text{cm}^3$).
- **3D Marching Cubes Mesh Engine**: Fast surface mesh extraction with Laplacian smoothing. Export models to `.GLB`, `.STL` (3D printing ready), and `.OBJ`.
- **Universal Data Ingestion**: Supports DICOM series (`.dcm`), NIfTI (`.nii`, `.nii.gz`), NRRD, MHA, PNG/JPG slice series, and compressed ZIP archives.
- **HIPAA-Compliant Anonymizer**: Automatic scrubbing of PHI metadata tags (`PatientName`, `PatientID`, `DOB`, `Institution`).
- **Publication-Grade PDF Exporter**: Automatic clinical PDF report generation summarizing scan acquisition parameters, volumetric statistics, Dice scores, and radiologic impressions.
- **Synthetic 3D Brain Generator**: Embedded high-fidelity 3D synthetic MRI volume generator for instant zero-setup offline previewing and test suites.

---

## 🛠️ Architecture

```
3d-Brain-Generation/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST API endpoints (scans, mesh, reports, health)
│   │   ├── core/            # Config, security & settings
│   │   ├── services/        # Synthetic brain, preprocessor, segmentor, marching_cubes, pdf
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # Pytest automated test suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router (Landing, Viewer, Upload, Docs)
│   │   ├── components/      # R3F 3D Canvas, Orthogonal Slice Viewers, Navbar, Footer
│   │   └── lib/             # API client & types
│   ├── package.json
│   └── Dockerfile
├── legacy/
│   └── cli.py               # Headless CLI batch execution pipeline
├── docker-compose.yml
└── ARCHITECTURE.md
```

---

## 💻 Quick Start

### 1. Docker Compose (Recommended)
```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **FastAPI Backend & Docs**: `http://localhost:8000/docs`

---

### 2. Manual Local Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

### 3. CLI Batch Pipeline (Terminal Mode)
```bash
python legacy/cli.py --iso-level 0.25 --output-dir storage/outputs
```

---

## 🧪 Running Automated Tests
```bash
cd backend
pytest
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
