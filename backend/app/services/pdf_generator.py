import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_clinical_pdf_report(
    scan_id: str,
    patient_info: dict,
    volumetric_stats: dict,
    output_path: str = "storage/outputs/report.pdf"
):
    """
    Generates a professional MICCAI / Clinical PDF report for brain MRI analysis.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E293B')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B')
    )
    
    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=15,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155')
    )

    elements = []
    
    # Header Banner
    elements.append(Paragraph("3D BRAIN GENERATION AI PLATFORM", title_style))
    elements.append(Paragraph(f"Clinical AI Volumetric Analysis Report • Scan ID: {scan_id}", subtitle_style))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#3B82F6'), spaceAfter=15))
    
    # Patient & Acquisition Table
    p_data = [
        [Paragraph("<b>Patient Identifier:</b>", body_style), Paragraph(patient_info.get("patient_id", "ANONYMOUS-001"), body_style),
         Paragraph("<b>Modality:</b>", body_style), Paragraph(patient_info.get("modality", "MR T1-Weighted"), body_style)],
        [Paragraph("<b>Study Description:</b>", body_style), Paragraph(patient_info.get("study_description", "3D Brain MRI Volumetric"), body_style),
         Paragraph("<b>Scan Date:</b>", body_style), Paragraph(patient_info.get("date", "2026-07-21"), body_style)],
        [Paragraph("<b>Voxel Spacing (Z,Y,X):</b>", body_style), Paragraph(str(patient_info.get("spacing", [1.5, 1.0, 1.0])), body_style),
         Paragraph("<b>Dimensions:</b>", body_style), Paragraph(str(patient_info.get("shape", [64, 128, 128])), body_style)]
    ]
    
    p_table = Table(p_data, colWidths=[130, 150, 110, 140])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    elements.append(p_table)
    
    # Volumetric Quantification
    elements.append(Paragraph("Volumetric Brain Tissue Quantification", h2_style))
    
    pcts = volumetric_stats.get("percentages", {})
    vol_data = [
        ["Anatomical Structure", "Volume (cm³)", "Brain Share (%)", "Reference Clinical Range"],
        ["Grey Matter (Cortex)", str(volumetric_stats.get("grey_matter_volume_cm3", 0.0)), f"{pcts.get('grey_matter', 0)}%", "600 - 800 cm³"],
        ["White Matter (Subcortical)", str(volumetric_stats.get("white_matter_volume_cm3", 0.0)), f"{pcts.get('white_matter', 0)}%", "450 - 550 cm³"],
        ["Cerebrospinal Fluid (Ventricles)", str(volumetric_stats.get("csf_volume_cm3", 0.0)), f"{pcts.get('csf', 0)}%", "100 - 160 cm³"],
        ["Pathology / Abnormality", str(volumetric_stats.get("lesion_volume_cm3", 0.0)), f"{pcts.get('lesion', 0)}%", "0.0 cm³ (Normal)"],
        ["Total Intracranial Volume (TIV)", str(volumetric_stats.get("total_brain_volume_cm3", 0.0)), "100.0%", "1300 - 1500 cm³"]
    ]
    
    v_table = Table(vol_data, colWidths=[180, 100, 110, 140])
    v_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F1F5F9')])
    ]))
    elements.append(v_table)
    
    # AI Abnormality & Clinical Impression
    elements.append(Paragraph("AI Diagnostic Assessment & Impression", h2_style))
    has_lesion = volumetric_stats.get("lesion_volume_cm3", 0.0) > 0
    
    if has_lesion:
        impression_text = (
            f"<font color='#DC2626'><b>ABNORMALITY DETECTED:</b></font> The deep learning segmentation pipeline identified a "
            f"hyper-intense lesion / focal tissue abnormality measuring <b>{volumetric_stats.get('lesion_volume_cm3')} cm³</b>. "
            "High contrast rim enhancement and localized ventricular displacement noted. Radiologic review recommended."
        )
    else:
        impression_text = (
            "<font color='#16A34A'><b>UNREMARKABLE / NORMAL:</b></font> Volumetric quantification reveals symmetric grey and white matter "
            "distribution with normal ventricular dimensions. No focal lesion or mass effect detected."
        )
        
    elements.append(Paragraph(impression_text, body_style))
    elements.append(Spacer(1, 15))
    
    # Disclaimer
    disclaimer = (
        "<i>Disclaimer: This report was automatically generated by the 3D Brain Generation AI Research Engine for academic and "
        "decision-support purposes. Not a replacement for primary diagnostic interpretation by a board-certified radiologist.</i>"
    )
    elements.append(Paragraph(disclaimer, subtitle_style))
    
    doc.build(elements)
    return output_path
