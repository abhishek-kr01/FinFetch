"""
Authentication utilities that depend on user model.
"""
from fastapi import Depends, HTTPException, status
from jose import jwt
from app.core.config import settings
from app.core.security import oauth2_scheme
from app.models.user import get_user_by_email

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get the current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # Extract user ID from token
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get user from database
        user = await get_user_by_email(payload.get("email"))
        if user is None:
            raise credentials_exception
            
        return user
        
    except jwt.PyJWTError:
        raise credentials_exception
        
async def get_current_active_user(current_user = Depends(get_current_user)):
    """Verify the user is active"""
    if not current_user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Inactive user"
        )
    return current_user