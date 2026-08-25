from fastapi import APIRouter, Depends
from app.api.v1.endpoints import health, scans, reconstruction, reports
from app.core.security import verify_api_key

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health Check"])
api_router.include_router(scans.router, prefix="/scans", tags=["MRI Scans & AI Ingestion"], dependencies=[Depends(verify_api_key)])
api_router.include_router(reconstruction.router, prefix="/reconstruction", tags=["3D Mesh Reconstruction"], dependencies=[Depends(verify_api_key)])
api_router.include_router(reports.router, prefix="/reports", tags=["Clinical Reports"], dependencies=[Depends(verify_api_key)])
