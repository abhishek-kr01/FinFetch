"""
Authentication schemas for request validation
"""
from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str = Field(..., min_length=8)

class PasswordResetRequest(BaseModel):
    """Password reset request schema"""
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    """Password reset confirmation schema"""
    token: str
    new_password: str = Field(..., min_length=8)