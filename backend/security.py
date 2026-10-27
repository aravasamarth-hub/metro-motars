"""
Metro Motors — Enterprise Backend Security & RBAC Module
Provides token-based authentication (JWT), password hashing (bcrypt),
and granular Role-Based Access Control (RBAC) dependencies for FastAPI.
"""

import os
from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# Environment & Production Configuration
IS_PRODUCTION = os.environ.get("ENV", "").lower() == "production" or os.environ.get("ENVIRONMENT", "").lower() == "production"

# JWT configuration
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "metro_motors_secure_jwt_secret_key_2026_dev")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

# Reusable HTTP Bearer security scheme
security_bearer = HTTPBearer(auto_error=False)

# Granular Permission Registry mapped to Showroom Roles:
# OWNER: Full showroom & financial access
# MANAGER: Operational showroom access with financial reports, no deletion/user admin
# WORKER: Operational showroom access (prices, agent fees & bills shielded)
# CUSTOMER: Zero internal showroom access
ROLE_PERMISSIONS: dict[str, dict[str, bool]] = {
    "OWNER": {
        "can_view_prices": True,
        "can_view_agent_financials": True,
        "can_view_payments": True,
        "can_view_bills": True,
        "can_view_finances": True,
        "can_delete_bills": True,
        "can_delete_deals": True,
        "can_manage_users": True,
        "can_export_reports": True,
        "can_create_deals": True,
        "can_edit_deals": True,
    },
    "MANAGER": {
        "can_view_prices": True,
        "can_view_agent_financials": False,
        "can_view_payments": True,
        "can_view_bills": True,
        "can_view_finances": False,
        "can_delete_bills": False,
        "can_delete_deals": False,
        "can_manage_users": False,
        "can_export_reports": True,
        "can_create_deals": True,
        "can_edit_deals": True,
    },
    "WORKER": {
        "can_view_prices": False,
        "can_view_agent_financials": False,
        "can_view_payments": False,
        "can_view_bills": False,
        "can_view_finances": False,
        "can_delete_bills": False,
        "can_delete_deals": False,
        "can_manage_users": False,
        "can_export_reports": False,
        "can_create_deals": True,
        "can_edit_deals": True,
    },
    "CUSTOMER": {
        "can_view_prices": False,
        "can_view_agent_financials": False,
        "can_view_payments": False,
        "can_view_bills": False,
        "can_view_finances": False,
        "can_delete_bills": False,
        "can_delete_deals": False,
        "can_manage_users": False,
        "can_export_reports": False,
        "can_create_deals": False,
        "can_edit_deals": False,
    },
}

def hash_password(password: str) -> str:
    """Hash password using salted bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed string. In production, plaintext hashes are strictly rejected."""
    if not hashed_password:
        return False
    # Check if legacy plaintext matches (auto-migration support, ONLY allowed in dev/test)
    if not hashed_password.startswith("$2b$") and not hashed_password.startswith("$2a$"):
        if IS_PRODUCTION:
            return False
        return plain_password == hashed_password
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_permissions_for_role(role: str) -> dict[str, bool]:
    """Retrieve normalized permissions map for a given role (least privilege default: CUSTOMER)."""
    return ROLE_PERMISSIONS.get(role.upper(), ROLE_PERMISSIONS["CUSTOMER"]).copy()


def create_access_token(
    subject: str,
    name: str,
    role: str,
    expires_delta: timedelta | None = None,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Issue a signed JWT bearer token with expiration and role claims."""
    expire = datetime.now(UTC) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    role_key = role.upper()
    if role_key == "AGENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AGENT access has been removed. Valid roles are OWNER and WORKER.",
        )
    claims: dict[str, Any] = {
        "sub": subject.lower().strip(),
        "name": name,
        "role": role_key,
        "permissions": get_permissions_for_role(role_key),
        "exp": int(expire.timestamp()),
        "iat": int(datetime.now(UTC).timestamp()),
        "iss": "metro-motors-auth",
    }
    if extra_claims:
        claims.update(extra_claims)

    return jwt.encode(claims, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a signed JWT token."""
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            issuer="metro-motors-auth",
            options={"require": ["exp", "sub", "role"]},
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (jwt.InvalidTokenError, Exception) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {exc!s}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    auth: HTTPAuthorizationCredentials | None = Security(security_bearer),
) -> dict[str, Any]:
    """FastAPI dependency: Extracts and verifies JWT bearer token."""
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = decode_access_token(auth.credentials)
    if user.get("role", "").upper() == "AGENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AGENT access has been removed. Valid roles are OWNER and WORKER.",
        )
    return user


def get_optional_current_user(
    auth: HTTPAuthorizationCredentials | None = Security(security_bearer),
) -> dict[str, Any] | None:
    """FastAPI dependency: Optional user extraction for hybrid/public endpoints."""
    if not auth or not auth.credentials:
        return None
    try:
        return decode_access_token(auth.credentials)
    except HTTPException:
        return None


def require_role(*allowed_roles: str) -> Callable:
    """Dependency factory: Enforce that authenticated user has one of allowed roles."""
    normalized_allowed = [r.upper() for r in allowed_roles]

    def role_checker(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
        user_role = current_user.get("role", "").upper()
        if user_role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {normalized_allowed}, but user has role '{user_role}'.",
            )
        return current_user

    return role_checker


def require_permission(permission_key: str) -> Callable:
    """Dependency factory: Enforce that authenticated user holds a specific permission flag."""

    def permission_checker(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
        permissions = current_user.get("permissions", {})
        if not permissions.get(permission_key, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: User does not possess the '{permission_key}' permission.",
            )
        return current_user

    return permission_checker
