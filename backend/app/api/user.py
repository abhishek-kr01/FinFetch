"""
User API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth_utils import get_current_active_user
from app.models.user import (
    update_user, get_user_by_id, delete_user,
    update_watchlist
)
from app.schemas.user import UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user = Depends(get_current_active_user)):
    """
    Get current user information
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user = Depends(get_current_active_user)
):
    """
    Update current user information
    
    - **email**: New email (optional)
    - **username**: New username (optional)
    - **first_name**: New first name (optional)
    - **last_name**: New last name (optional)
    - **password**: New password (optional)
    """
    updated_user = await update_user(current_user["_id"], user_data.dict(exclude_unset=True))
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )
    
    return updated_user

@router.put("/me/watchlist", response_model=UserResponse)
async def update_user_watchlist(
    symbols: list,
    current_user = Depends(get_current_active_user)
):
    """
    Update user watchlist
    
    - **symbols**: List of stock symbols
    """
    updated_user = await update_watchlist(current_user["_id"], symbols)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update watchlist"
        )
    
    return updated_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(current_user = Depends(get_current_active_user)):
    """
    Delete current user account
    """
    success = await delete_user(current_user["_id"])
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )
    
    return {}