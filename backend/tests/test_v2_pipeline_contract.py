from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app, headers={"X-API-Key": settings.API_KEY})


def test_synthetic_scan_exposes_pipeline_metadata():
    response = client.post(
        "/api/v1/scans/synthetic",
        json={
            "has_lesion": True,
            "noise_level": 0.02,
            "shape": [16, 32, 32],
            "spacing": [1.5, 1.0, 1.0],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["pipeline"]["status"] == "ready"
    assert payload["pipeline"]["stage"] == "reconstruction"
    assert payload["pipeline"]["progress"] >= 90
