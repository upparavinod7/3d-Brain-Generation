from typing import Any, Dict, List


class PipelineService:
    def build_snapshot(
        self,
        *,
        scan_id: str,
        stage: str = "reconstruction",
        has_pathology: bool,
        volumetric_stats: Dict[str, Any],
        progress: int = 94,
    ) -> Dict[str, Any]:
        return {
            "status": "ready",
            "stage": stage,
            "progress": progress,
            "message": "The scan has completed preprocessing, segmentation, and mesh preparation for review.",
            "scan_id": scan_id,
            "has_pathology": has_pathology,
            "artifacts": [
                "3D surface reconstruction",
                "segmentation metrics",
                "clinical report scaffold",
            ],
            "steps": [
                "ingestion",
                "preprocessing",
                "segmentation",
                "reconstruction",
            ],
            "volumetric_summary": {
                "total_volume_cm3": volumetric_stats.get("total_brain_volume_cm3", 0.0),
                "lesion_volume_cm3": volumetric_stats.get("lesion_volume_cm3", 0.0),
            },
        }


pipeline_service = PipelineService()
