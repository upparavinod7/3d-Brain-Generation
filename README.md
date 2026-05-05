# 3D MRI Reconstruction (Hybrid Method)

This project implements a **Hybrid Method** combining **Trilinear Interpolation** and **Image Enhancement**, striking a perfect balance between accuracy and computational efficiency for clinical MRI data.

## Pipeline Modules
1. **Data Handling**: Loads DICOM slices and sorts them by spatial position.
2. **Anonymization**: Removes PHI (Patient Health Information) from DICOM headers and masks images if needed.
3. **Preprocessing**: Normalizes intensities, enhances contrast, and removes noise.
4. **Slice Arrangement**: Ensures proper 3D stacking of the 2D slices.
5. **Reconstruction**: Uses **Trilinear Interpolation** to fill missing slices and generate an isotropic volume.
6. **3D Volume**: Creates a continuous 3D matrix representing the brain.
7. **Visualization**: Interactive 3D visualization of the reconstructed brain using PyVista.
8. **Evaluation**: Metrics to evaluate the quality of reconstruction (Dice, PSNR, SSIM).

## Technology Stack
- **Python**
- **pydicom**
- **NumPy**
- **OpenCV**
- **SciPy**
- **PyVista** & **Matplotlib**

## Setup
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Place your DICOM `.dcm` files into `data/raw/`
5. Run the pipeline: `python main.py`
