import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from backend.app.services.dicom_loader import load_dicom_series as _load_dicom_series
    from backend.app.services.dicom_loader import extract_dicom_volume as _extract_dicom_volume
except ImportError:
    from app.services.dicom_loader import load_dicom_series as _load_dicom_series
    from app.services.dicom_loader import extract_dicom_volume as _extract_dicom_volume

def load_dicom_series(directory):
    return _load_dicom_series(directory)

def extract_pixel_data(dicom_series):
    volume, _ = _extract_dicom_volume(dicom_series)
    return volume

def get_physical_spacing(dicom_series):
    _, meta = _extract_dicom_volume(dicom_series)
    return tuple(meta["spacing"])
