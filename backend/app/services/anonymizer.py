import pydicom

# HIPAA PHI tags to strip or replace
PHI_TAGS = [
    "PatientName", "PatientID", "PatientBirthDate", "PatientSex",
    "PatientAge", "PatientAddress", "InstitutionName", "InstitutionalDepartmentName",
    "ReferringPhysicianName", "PhysiciansOfRecord", "OperatorsName"
]

def anonymize_dicom_dataset(dataset):
    """
    Scrubs all Protected Health Information (PHI) tags from a DICOM dataset
    to satisfy HIPAA compliance requirements for research release.
    """
    for tag in PHI_TAGS:
        if hasattr(dataset, tag):
            if tag == "PatientName":
                setattr(dataset, tag, "ANONYMOUS^PATIENT")
            elif tag == "PatientID":
                setattr(dataset, tag, "ANON-00000")
            else:
                setattr(dataset, tag, "")
                
    return dataset

def anonymize_dicom_series(datasets):
    """
    Applies HIPAA anonymization across an entire series of DICOM datasets.
    """
    return [anonymize_dicom_dataset(ds) for ds in datasets]
