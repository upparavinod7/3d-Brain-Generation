import pydicom

PHI_TAGS_TO_REMOVE = [
    "PatientName", "PatientID", "PatientBirthDate", "PatientSex",
    "PatientAge", "PatientWeight", "InstitutionName", "ReferringPhysicianName",
    "PatientAddress", "InsurancePlanIdentificationSequence"
]

def anonymize_dicom(dataset):
    """
    Removes Protected Health Information (PHI) metadata tags safely from a DICOM dataset.
    """
    for tag_name in PHI_TAGS_TO_REMOVE:
        if tag_name in dataset:
            del dataset[tag_name]
            
    # Set standard anonymized placeholders for core identifying fields
    dataset.PatientName = "ANONYMOUS^PATIENT"
    dataset.PatientID = "ANONYMOUS"
    return dataset

def anonymize_series(dicom_series):
    """
    Anonymizes a list of DICOM datasets in memory.
    """
    return [anonymize_dicom(d) for d in dicom_series]
