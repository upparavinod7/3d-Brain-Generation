import pydicom

PHI_TAGS_TO_REMOVE = [
    "PatientName", "PatientID", "PatientBirthDate", "PatientSex",
    "PatientAge", "PatientWeight", "InstitutionName", "ReferringPhysicianName",
    "PatientAddress"
]

def anonymize_dicom(dataset):
    """
    Removes Protected Health Information (PHI) metadata tags safely from a DICOM dataset.
    """
    for tag_name in PHI_TAGS_TO_REMOVE:
        if hasattr(dataset, tag_name):
            try:
                delattr(dataset, tag_name)
            except Exception:
                pass
            
    # Set standard anonymized placeholders for core identifying fields
    dataset.PatientName = "ANONYMOUS^PATIENT"
    dataset.PatientID = "ANONYMOUS"
    return dataset

def anonymize_series(dicom_series):
    """
    Anonymizes a list of DICOM datasets in memory.
    """
    return [anonymize_dicom(d) for d in dicom_series]


