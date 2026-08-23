from fastapi import APIRouter
from app.api.v1.endpoints import health, scans, reconstruction, reports

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health Check"])
api_router.include_router(scans.router, prefix="/scans", tags=["MRI Scans & AI Ingestion"])
api_router.include_router(reconstruction.router, prefix="/reconstruction", tags=["3D Mesh Reconstruction"])
api_router.include_router(reports.router, prefix="/reports", tags=["Clinical Reports"])
