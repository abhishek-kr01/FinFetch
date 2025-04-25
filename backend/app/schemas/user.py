"""
User schemas for request validation and responses
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator

class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=8)
    
    @validator('password')
    def password_complexity(cls, v):
        """Validate password complexity"""
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v

class UserUpdate(BaseModel):
    """User update schema"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    
    @validator('password')
    def password_complexity(cls, v):
        """Validate password complexity if provided"""
        if v is None:
            return v
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v

class UserResponse(UserBase):
    """User response schema"""
    id: str = Field(..., alias="_id")
    is_active: bool
    created_at: datetime
    updated_at: datetime
    watchlist: List[str] = []
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class Token(BaseModel):
    """JWT token schema"""
    access_token: str
    token_type: str
    user_id: str
    email: str
    username: str

class TokenData(BaseModel):
    """JWT token data schema"""
    user_id: Optional[str] = None
    email: Optional[str] = None