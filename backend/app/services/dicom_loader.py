import os
import pydicom
import numpy as np

def load_dicom_series(directory_or_files):
    """
    Loads DICOM files from a directory path or list of file paths,
    extracts tags, and sorts them along the Z-axis (ImagePositionPatient / SliceLocation).
    """
    datasets = []
    
    if isinstance(directory_or_files, str) and os.path.isdir(directory_or_files):
        files = [os.path.join(directory_or_files, f) for f in os.listdir(directory_or_files) if f.lower().endswith(('.dcm', '.dicom'))]
    elif isinstance(directory_or_files, list):
        files = directory_or_files
    else:
        files = []
        
    if not files:
        raise ValueError("No DICOM files found in provided directory or list.")
        
    for filepath in files:
        try:
            ds = pydicom.dcmread(filepath, force=True)
            if hasattr(ds, 'pixel_array'):
                datasets.append(ds)
        except Exception:
            continue

    if not datasets:
        raise ValueError("Failed to parse valid DICOM datasets with pixel array.")
        
    # Sort slices spatially along Z-axis
    try:
        datasets.sort(key=lambda x: float(x.ImagePositionPatient[2]))
    except (AttributeError, IndexError):
        try:
            datasets.sort(key=lambda x: float(x.SliceLocation))
        except AttributeError:
            try:
                datasets.sort(key=lambda x: int(x.InstanceNumber))
            except AttributeError:
                pass
                
    return datasets

def extract_dicom_volume(dicom_series):
    """
    Extracts 3D pixel array and spatial metadata from sorted DICOM datasets.
    """
    slices = [d.pixel_array for d in dicom_series]
    volume = np.stack(slices, axis=0).astype(np.float32)
    
    # Standardize intensity range to [0, 1]
    min_val, max_val = np.min(volume), np.max(volume)
    if max_val > min_val:
        volume = (volume - min_val) / (max_val - min_val)
        
    # Physical spacing
    try:
        pixel_spacing = [float(x) for x in dicom_series[0].PixelSpacing]
        x_space, y_space = pixel_spacing[1], pixel_spacing[0]
    except AttributeError:
        x_space, y_space = 1.0, 1.0
        
    try:
        z_space = abs(float(dicom_series[1].ImagePositionPatient[2]) - float(dicom_series[0].ImagePositionPatient[2]))
        if z_space == 0:
            z_space = float(dicom_series[0].SliceThickness)
    except (AttributeError, IndexError):
        try:
            z_space = float(dicom_series[0].SliceThickness)
        except AttributeError:
            z_space = 1.5
            
    metadata = {
        "modality": getattr(dicom_series[0], "Modality", "MR"),
        "patient_id": getattr(dicom_series[0], "PatientID", "ANONYMOUS"),
        "study_description": getattr(dicom_series[0], "StudyDescription", "Brain MRI"),
        "spacing": [float(z_space), float(y_space), float(x_space)],
        "shape": list(volume.shape)
    }
    
    return volume, metadata
