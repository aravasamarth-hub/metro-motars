"""Shared test-only credentials.

No literal passwords are committed: values come from the environment
(see backend/tests/.env.example) or are generated randomly per test run.
"""
import os
import secrets


def strong_test_password(env_var: str) -> str:
    """Returns $env_var if set, otherwise a random policy-compliant password."""
    return os.environ.get(env_var) or f"Tt{secrets.token_urlsafe(12)}9!"


TEST_HASH_PASSWORD = strong_test_password("TEST_HASH_PASSWORD")
TEST_RESET_NEW_PASSWORD = strong_test_password("TEST_RESET_NEW_PASSWORD")
