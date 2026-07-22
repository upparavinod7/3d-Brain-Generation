import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from backend.app.services.anonymizer import anonymize_dicom_dataset, anonymize_dicom_series
except ImportError:
    from app.services.anonymizer import anonymize_dicom_dataset, anonymize_dicom_series

def anonymize_dicom(dataset):
    return anonymize_dicom_dataset(dataset)

def anonymize_series(dicom_series):
    return anonymize_dicom_series(dicom_series)
