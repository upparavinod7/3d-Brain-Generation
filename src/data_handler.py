import os
import pydicom
import numpy as np

def load_dicom_series(directory):
    """
    Loads all DICOM files from a directory and sorts them spatially along the Z-axis.
    """
    dicom_datasets = []
    
    if not os.path.exists(directory):
        raise FileNotFoundError(f"Directory {directory} does not exist.")
        
    for root, _, files in os.walk(directory):
        for fname in files:
            if fname.lower().endswith(('.dcm', '.dicom')):
                fpath = os.path.join(root, fname)
                try:
                    ds = pydicom.dcmread(fpath)
                    dicom_datasets.append(ds)
                except Exception as e:
                    print(f"Warning: Failed to read DICOM file {fpath}: {e}")
                    
    if not dicom_datasets:
        return []
        
    # Sort slices spatially by ImagePositionPatient Z coordinate or SliceLocation
    try:
        dicom_datasets.sort(key=lambda d: float(d.ImagePositionPatient[2]))
    except AttributeError:
        try:
            dicom_datasets.sort(key=lambda d: float(d.SliceLocation))
        except AttributeError:
            dicom_datasets.sort(key=lambda d: int(d.InstanceNumber))
            
    return dicom_datasets

def extract_pixel_data(dicom_series):
    """
    Extracts 2D pixel arrays from DICOM datasets and stacks them into a 3D NumPy array (Z, Y, X).
    """
    if not dicom_series:
        raise ValueError("Empty DICOM series provided.")
        
    import cv2
    slices = [ds.pixel_array.astype(np.float32) for ds in dicom_series]
    target_shape = slices[0].shape
    
    resized_slices = []
    for s in slices:
        if s.shape != target_shape:
            s_resized = cv2.resize(s, (target_shape[1], target_shape[0]), interpolation=cv2.INTER_LINEAR)
            resized_slices.append(s_resized)
        else:
            resized_slices.append(s)
            
    volume = np.stack(resized_slices, axis=0)
    return volume


def get_physical_spacing(dicom_series):
    """
    Returns physical voxel spacing (Z_spacing, Y_spacing, X_spacing) in mm.
    """
    if not dicom_series:
        return (1.0, 1.0, 1.0)
        
    # In-plane spacing (Y, X)
    try:
        y_space = float(dicom_series[0].PixelSpacing[0])
        x_space = float(dicom_series[0].PixelSpacing[1])
    except (AttributeError, IndexError):
        y_space, x_space = 1.0, 1.0
        
    # Inter-slice spacing (Z)
    if len(dicom_series) > 1:
        try:
            z_space = abs(float(dicom_series[1].ImagePositionPatient[2]) - float(dicom_series[0].ImagePositionPatient[2]))
        except (AttributeError, IndexError):
            try:
                z_space = float(dicom_series[0].SliceThickness)
            except AttributeError:
                z_space = 2.0
    else:
        z_space = 1.0
        
    return (z_space, y_space, x_space)

