import os
import pydicom
import numpy as np

def load_dicom_series(directory):
    """
    Module 1: Load MRI Data
    Module 4: Slice Arrangement
    
    Loads all DICOM files from a directory, reads metadata, and sorts them 
    in the correct 3D order based on Slice Location.
    """
    dicom_files = []
    for filename in os.listdir(directory):
        if filename.endswith(".dcm"):
            filepath = os.path.join(directory, filename)
            dataset = pydicom.dcmread(filepath)
            dicom_files.append(dataset)
            
    # Sort slices by spatial position to ensure correct 3D arrangement
    # We use ImagePositionPatient[2] (Z-axis) or SliceLocation
    try:
        dicom_files.sort(key=lambda x: float(x.ImagePositionPatient[2]))
    except AttributeError:
        # Fallback if ImagePositionPatient is not available
        dicom_files.sort(key=lambda x: float(x.SliceLocation))
        
    return dicom_files

def extract_pixel_data(dicom_series):
    """
    Extracts the 2D pixel arrays from a list of DICOM datasets
    and stacks them into a 3D NumPy array.
    """
    slices = [d.pixel_array for d in dicom_series]
    return np.array(slices)

def get_physical_spacing(dicom_series):
    """
    Extracts the physical spacing between pixels and slices.
    This ensures the 3D brain looks realistic and not stretched/squished.
    """
    try:
        # Pixel spacing in X and Y (e.g. 1.0mm x 1.0mm)
        x_space, y_space = float(dicom_series[0].PixelSpacing[0]), float(dicom_series[0].PixelSpacing[1])
    except AttributeError:
        x_space, y_space = 1.0, 1.0
        
    try:
        # Distance between adjacent slices
        z_space = abs(float(dicom_series[1].ImagePositionPatient[2]) - float(dicom_series[0].ImagePositionPatient[2]))
        if z_space == 0:
             z_space = float(dicom_series[0].SliceThickness)
    except (AttributeError, IndexError):
        try:
            z_space = float(dicom_series[0].SliceThickness)
        except AttributeError:
            z_space = 2.0 # Default fallback
            
    return (z_space, y_space, x_space) # Z, Y, X

