# 🧠 3D Brain MRI Reconstruction & Medical AI Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2-EE4C2C.svg)](https://pytorch.org)
[![scikit-image](https://img.shields.io/badge/scikit--image-Marching%20Cubes-4C8CBF.svg)](https://scikit-image.org)
[![trimesh](https://img.shields.io/badge/trimesh-mesh%20processing-00B0FF.svg)](https://trimsh.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/upparavinod7/3d-Brain-Generation/actions/workflows/ci.yml/badge.svg)](https://github.com/upparavinod7/3d-Brain-Generation/actions)

A research-grade platform for 3D brain MRI reconstruction from real DICOM data. Combines a **FastAPI** backend with a **Next.js** frontend to deliver anatomically faithful 3D brain surface meshes, multi-class tissue segmentation, 2D orthogonal slice viewing, and clinical PDF reports.

---

## ✨ Key Features

- **Anatomical 3D Brain Surface Reconstruction** — True skull-stripped brain segmentation (3D Otsu + connected-component isolation) feeds Marching Cubes to produce the actual cortical surface from DICOM data, not a rectangular slab.
- **Anisotropic → Isotropic Resampling** — Raw DICOM volumes (e.g. 6 mm slice spacing) are resampled to 1.0 mm isotropic before mesh extraction.
- **Taubin Mesh Smoothing** — Non-shrinking smoothing (12 iterations) preserves gyri/sulci folds while eliminating voxel stair-step artifacts.
- **Interactive 3D WebGL Viewer** — React Three Fiber / Three.js viewer with OrbitControls, wireframe mode, opacity slider, and view mode switching (Realistic DICOM Surface / DTI Fiber Tractography / Anatomical Layers).
- **2D Orthogonal Slice Viewer** — Synchronized Axial, Sagittal, and Coronal views with Window/Level presets (Brain, Bone, High Contrast) and segmentation overlays.
- **Multi-Class Tissue Segmentation** — Grey Matter, White Matter, CSF/Ventricles, and hyperintense lesion detection with absolute volumetric statistics (cm³).
- **Hybrid AI Reconstruction** — Research pipeline supporting Trilinear Interpolation, 3D CNN, GAN, and a proposed Trilinear + 3D CNN hybrid model with multi-sparsity (K=2, 4, 6) benchmarking.
- **HIPAA-Compliant Anonymizer** — Automatic scrubbing of PHI metadata (`PatientName`, `PatientID`, `DOB`, `Institution`).
- **Clinical PDF Report Generator** — Auto-generates patient reports with scan parameters, volumetric stats, and Dice scores.
- **Mesh Export** — One-click export to `.GLB` (web), `.STL` (3D printing), and `.OBJ` formats.
- **GitHub Actions CI** — Automated pytest test suite on every push/PR.

---

## 🗂️ Project Structure

```
3d-Brain-Generation/
├── backend/                         # FastAPI REST backend
│   ├── app/
│   │   ├── api/v1/endpoints/        # REST API: scans, reconstruction, reports, health
│   │   ├── core/config.py           # App settings (Pydantic)
│   │   ├── schemas/scan.py          # Request/Response schemas
│   │   ├── services/
│   │   │   ├── segmentor.py         # 3D skull stripping + tissue segmentation
│   │   │   ├── marching_cubes.py    # Brain mask → 1.0mm isotropic → Marching Cubes → Taubin
│   │   │   ├── preprocessor.py      # CLAHE, Gaussian denoising, normalization
│   │   │   ├── dicom_loader.py      # DICOM series loader
│   │   │   ├── nifti_loader.py      # NIfTI loader
│   │   │   ├── synthetic_brain.py   # Synthetic MRI phantom generator
│   │   │   ├── pdf_generator.py     # Clinical PDF report
│   │   │   └── pipeline.py          # Pipeline state manager
│   │   └── main.py                  # FastAPI app + CORS + static file server
│   ├── tests/                       # Pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── src/                             # Research pipeline (CLI / benchmarking)
│   ├── data_handler.py              # DICOM ingestion & spatial sorting
│   ├── preprocessor.py              # Volume preprocessing
│   ├── reconstructor.py             # Proposed Tri+CNN hybrid model inference
│   ├── downsampler.py               # Sparse slice sampling (K=2,4,6)
│   ├── evaluator.py                 # PSNR, SSIM, MAE, MSE evaluation
│   ├── benchmark.py                 # Multi-sparsity controlled benchmark
│   ├── ablation.py                  # Ablation study runner
│   ├── phantom_generator.py         # Synthetic brain phantom
│   ├── anonymizer.py                # PHI metadata scrubber
│   ├── visualizer.py                # 3D matplotlib / Open3D visualizer
│   └── models/
│       ├── tri_cnn_3d.py            # Proposed Trilinear + 3D CNN model (PyTorch)
│       ├── cnn_3d.py                # Baseline 3D CNN model
│       └── gan_3d.py                # GAN-based reconstruction model
│
├── frontend/                        # Next.js 14 App Router frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx             # Landing page
│       │   ├── viewer/page.tsx      # 3D viewer + controls + metrics
│       │   ├── upload/page.tsx      # DICOM upload interface
│       │   └── docs/page.tsx        # API documentation page
│       └── components/
│           ├── viewer3d/BrainCanvas.tsx         # Three.js / R3F 3D brain canvas
│           └── sliceViewer/OrthogonalViewer.tsx # 2D Axial/Sagittal/Coronal viewer
│
├── data/
│   ├── raw/                         # Place DICOM (.dcm) files here
│   └── output/                      # Benchmark & ablation output artifacts
│
├── storage/outputs/                 # Generated GLB / STL / OBJ / PDF files
├── debug/                           # Brain mask PNGs & debug mesh GLBs
│
├── main.py                          # Unified entrypoint (--serve / --benchmark-only)
├── docker-compose.yml
├── .github/workflows/ci.yml
└── ARCHITECTURE.md
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Virtual environment tool (venv)

---

### 1. Clone & Set Up Python Environment

```bash
git clone https://github.com/upparavinod7/3d-Brain-Generation.git
cd 3d-Brain-Generation

# Create and activate virtual environment (from project root)
python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

# Install all dependencies
pip install -r backend/requirements.txt
pip install -r requirements.txt
```

---

### 2. Add DICOM Data

Place your `.dcm` files in the `data/raw/` directory:

```bash
cp /path/to/your/dicom/files/*.dcm data/raw/
```

> The pipeline auto-discovers all `.dcm` files in `data/raw/` on startup.  
> If no DICOM files are found, it falls back to a synthetic brain phantom.

---

### 3. Start the Backend

```bash
# From project root with venv active
python main.py --serve
```

- Backend API: **`http://localhost:8000`**
- Interactive API Docs: **`http://localhost:8000/docs`**
- Static mesh files: **`http://localhost:8000/static/outputs/brain_3d_mesh.glb`**

---

### 4. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install       # first time only
npm run dev
```

- Frontend App: **`http://localhost:3000`**

---

### 5. Open the Application

| Page | URL |
|---|---|
| 🏠 Home | `http://localhost:3000` |
| 📤 Upload DICOM | `http://localhost:3000/upload` |
| 🧠 3D Viewer | `http://localhost:3000/viewer` |
| 📖 API Docs | `http://localhost:8000/docs` |

> **Note:** On first visit to `/viewer`, the backend loads the DICOM series and runs the full reconstruction pipeline (brain extraction → resampling → Marching Cubes → mesh export). This takes **60–120 seconds** on first run. Subsequent loads are instant.

---

## 🐳 Docker Compose

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## 🔬 3D Reconstruction Pipeline

```
Raw DICOM (.dcm)
     │
     ▼
DICOM Loader  ← ImagePositionPatient spatial sorting
     │
     ▼
Intensity Normalization (min-max)
     │
     ▼
3D Brain Extraction (Skull Stripping)
  ├─ 3D Otsu threshold on non-zero tissue
  ├─ 3D morphological opening  (removes scalp/air boundaries)
  ├─ Connected component isolation  (largest brain component)
  └─ 3D hole filling
     │  foreground ratio: ~0.14  (correct for human brain MRI)
     ▼
Anisotropic → 1.0 mm Isotropic Resampling  (scipy.ndimage.zoom)
     │
     ▼
Marching Cubes  (skimage, level=0.5 on binary mask)
     │
     ▼
Largest Mesh Component Isolation  (trimesh)
     │
     ▼
Taubin Smoothing  (12 iterations, non-shrinking)
     │
     ▼
Export: GLB / STL / OBJ  →  storage/outputs/
```

---

## 🤖 AI Research Models

| Model | Description |
|---|---|
| **Proposed ⭐** | Trilinear Interpolation + 3D CNN residual refinement |
| **Trilinear** | Mathematical trilinear interpolation baseline |
| **3D CNN** | Pure convolutional super-resolution |
| **3D GAN** | Generative adversarial reconstruction |

Run benchmark across sparsity levels K=2, 4, 6:

```bash
python main.py --benchmark-only
```

Results saved to `data/output/` as CSV, JSON, and PNG comparison charts.

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/api/v1/scans/{scan_id}` | Load scan & run reconstruction |
| `POST` | `/api/v1/scans/upload` | Upload DICOM series |
| `GET` | `/api/v1/scans/{scan_id}/slice/{plane}/{index}` | Get 2D MRI slice |
| `POST` | `/api/v1/reconstruction/{scan_id}` | Run AI reconstruction |
| `GET` | `/api/v1/reports/{scan_id}/pdf` | Download clinical PDF report |
| `GET` | `/static/outputs/brain_3d_mesh.glb` | Download 3D brain mesh (GLB) |
| `GET` | `/static/outputs/brain_3d_mesh.stl` | Download 3D brain mesh (STL) |

---

## 🧪 Running Tests

```bash
cd backend
pytest
```

CI runs automatically on every push/PR via GitHub Actions (`.github/workflows/ci.yml`).

---

## 📦 Dependencies

### Backend (Python)
| Package | Purpose |
|---|---|
| `fastapi`, `uvicorn` | REST API server |
| `pydicom` | DICOM file reading |
| `nibabel` | NIfTI file reading |
| `scikit-image` | Marching Cubes, Otsu thresholding |
| `scipy` | 3D morphological operations, resampling |
| `trimesh` | Mesh processing, Taubin smoothing, GLB/STL/OBJ export |
| `numpy`, `opencv-python-headless` | Volume processing |
| `torch` (PyTorch) | CNN/GAN AI reconstruction models |
| `reportlab` | Clinical PDF generation |

### Frontend (Node.js)
| Package | Purpose |
|---|---|
| `next` 14 | React App Router framework |
| `three`, `@react-three/fiber` | WebGL 3D rendering |
| `@react-three/drei` | OrbitControls, STLLoader, helpers |
| `lucide-react` | UI icons |
| `tailwindcss` | Utility-first CSS |

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
