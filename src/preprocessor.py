import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from backend.app.services.preprocessor import preprocess_medical_volume, apply_clahe_3d
except ImportError:
    from app.services.preprocessor import preprocess_medical_volume, apply_clahe_3d

def apply_preprocessing(image_slice):
    from backend.app.services.preprocessor import normalize_intensity
    norm = normalize_intensity(image_slice)
    return norm

def preprocess_volume(volume_array):
    return preprocess_medical_volume(volume_array)
