"""
Authentication API endpoints
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr

from app.core.config import settings
from app.core.security import (
    verify_password, 
    create_access_token
)
from app.core.auth_utils import get_current_active_user
from app.models.user import get_user_for_auth, create_user, get_user_by_email
from app.schemas.user import UserCreate, UserResponse, Token, TokenData
from app.schemas.auth import LoginRequest, PasswordResetRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """
    Register a new user
    """
    # Check if user already exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create new user
    user = await create_user(user_data.dict())
    
    return user

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    """
    Authenticate user and return JWT token
    """
    # Get user from database
    user = await get_user_for_auth(login_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "email": user["email"]},
        expires_delta=access_token_expires,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "email": user["email"],
        "username": user["username"]
    }

@router.post("/login/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Get user from database
    user = await get_user_for_auth(form_data.username)  # OAuth2 uses username field for email
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "email": user["email"]},
        expires_delta=access_token_expires,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "email": user["email"],
        "username": user["username"]
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_active_user)):
    """
    Get current user information
    """
    return current_user

@router.post("/password-reset", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(reset_data: PasswordResetRequest):
    """
    Request password reset (sends reset email)
    """
    # Check if user exists
    user = await get_user_by_email(reset_data.email)
    if not user:
        # Return success even if user doesn't exist for security
        return {"message": "If this email is registered, a password reset link will be sent"}
    
    # In a real implementation, this would send an email with a reset link
    # For now, we'll just return a success message
    
    return {"message": "If this email is registered, a password reset link will be sent"}