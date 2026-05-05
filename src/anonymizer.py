def anonymize_dicom(dataset):
    """
    Module 2: Anonymization Module
    
    Removes Patient Health Information (PHI) to comply with ethical usage.
    """
    # Replace sensitive patient metadata with anonymous placeholders
    dataset.PatientName = "Anonymous^Patient"
    dataset.PatientID = "000000"
    dataset.PatientBirthDate = ""
    dataset.PatientSex = ""
    
    # We can also add image masking here if there are burned-in text details,
    # but for most MRI DICOMs, cleaning the metadata is the primary step.
    return dataset

def anonymize_series(dicom_series):
    """
    Applies anonymization to a full series of DICOM datasets.
    """
    return [anonymize_dicom(d) for d in dicom_series]
