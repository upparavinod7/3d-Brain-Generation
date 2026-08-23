from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.api.v1.endpoints.scans import get_or_create_scan
from app.services.pdf_generator import generate_clinical_pdf_report

router = APIRouter()

@router.get("/{scan_id}/pdf")
def download_pdf_report(scan_id: str):
    """
    Generates and downloads a publication-ready PDF clinical analysis report.
    """
    s = get_or_create_scan(scan_id)
    
    patient_info = {
        "patient_id": f"PATIENT-{scan_id}",
        "modality": s["modality"],
        "study_description": "Volumetric 3D MRI Reconstruction",
        "spacing": s["spacing"],
        "shape": s["dimensions"]
    }
    
    pdf_path = f"storage/outputs/report_{scan_id}.pdf"
    generate_clinical_pdf_report(scan_id, patient_info, s["volumetric_stats"], pdf_path)
    
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"3D_Brain_Report_{scan_id}.pdf")
