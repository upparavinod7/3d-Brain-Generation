import os
import nibabel as nib
import numpy as np

def load_nifti_volume(filepath):
    """
    Loads NIfTI (.nii or .nii.gz) files using NiBabel.
    Standardizes orientation to RAS+ and extracts volume + spacing metadata.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"NIfTI file not found: {filepath}")
        
    img = nib.load(filepath)
    # Reorient image to canonical RAS orientation
    canonical_img = nib.as_closest_canonical(img)
    
    volume = canonical_img.get_fdata().astype(np.float32)
    header = canonical_img.header
    
    # Transpose dimensions if necessary to ensure standard [Z, Y, X] ordering
    if volume.ndim == 4:
        volume = volume[..., 0] # Extract 1st time-point if 4D
        
    # Reorder to (Depth, Height, Width)
    volume = np.transpose(volume, (2, 1, 0))
    
    # Standardize intensity range to [0, 1]
    min_val, max_val = np.min(volume), np.max(volume)
    if max_val > min_val:
        volume = (volume - min_val) / (max_val - min_val)
        
    zooms = header.get_zooms()[:3]
    spacing = [float(zooms[2]), float(zooms[1]), float(zooms[0])] # Z, Y, X
    
    metadata = {
        "dimensions": list(volume.shape),
        "spacing": spacing,
        "data_type": str(header.get_data_dtype()),
        "description": "NIfTI Neuroimaging Volume"
    }
    
    return volume, metadata

def save_nifti_volume(volume, output_filepath, spacing=(1.5, 1.0, 1.0)):
    """
    Saves a 3D numpy array volume as a standard NIfTI (.nii.gz) image file.
    """
    # Transpose back from (Z, Y, X) to (X, Y, Z) for NIfTI convention
    nii_array = np.transpose(volume, (2, 1, 0))
    
    # Construct affine matrix with physical spacing
    affine = np.diag([spacing[2], spacing[1], spacing[0], 1.0])
    
    nifti_img = nib.Nifti1Image(nii_array, affine)
    nib.save(nifti_img, output_filepath)
    return output_filepath
