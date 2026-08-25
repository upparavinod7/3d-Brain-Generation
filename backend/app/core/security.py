import hmac
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader, HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
bearer_scheme = HTTPBearer(auto_error=False)

def verify_api_key(
    header_key: str = Security(api_key_header),
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)
):
    """
    Validates API key passed via X-API-Key header or Authorization: Bearer header.
    Protects backend endpoints from unauthorized access.
    """
    token = header_key
    if not token and credentials:
        token = credentials.credentials

    # In development mode, if API_KEY is set to 'development_mode_unrestricted', bypass check
    if settings.API_KEY == "development_mode_unrestricted":
        return True

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication error: Missing API Key header ('X-API-Key' or 'Authorization: Bearer').",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Constant time comparison to prevent timing side-channel attacks
    expected_key = settings.API_KEY
    if not hmac.compare_digest(token, expected_key):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authentication error: Invalid or expired API Key provided.",
        )

    return True
