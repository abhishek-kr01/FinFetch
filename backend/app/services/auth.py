"""
Authentication service for handling user authentication logic
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from app.core.config import settings
from app.core.security import (
    verify_password, get_password_hash, create_access_token
)
from app.models.user import (
    get_user_by_email, get_user_for_auth, create_user, update_user
)

class AuthService:
    """Service for handling authentication logic"""
    
    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate a user with email and password
        
        Args:
            email: User's email
            password: User's password
            
        Returns:
            User document if authentication successful, None otherwise
        """
        # Get user with password
        user = await get_user_for_auth(email)
        
        if not user:
            return None
        
        # Verify password
        if not verify_password(password, user["password"]):
            return None
        
        # Remove password from response
        user.pop("password", None)
        
        return user
    
    @staticmethod
    async def create_user_account(user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new user account
        
        Args:
            user_data: User information including email, username, password
            
        Returns:
            Created user document
        """
        # Check if user already exists
        existing_user = await get_user_by_email(user_data["email"])
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create user
        return await create_user(user_data)
    
    @staticmethod
    async def generate_token(user: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate JWT access token for a user
        
        Args:
            user: User document
            
        Returns:
            Token data including access_token and user info
        """
        # Set token expiration
        access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user["_id"], "email": user["email"]},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user["_id"],
            "email": user["email"],
            "username": user["username"]
        }
    
    @staticmethod
    async def update_user_profile(user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update user profile information
        
        Args:
            user_id: User's ID
            update_data: Fields to update
            
        Returns:
            Updated user document or None if failed
        """
        # Update user
        return await update_user(user_id, update_data)
    
    @staticmethod
    async def change_password(user_id: str, new_password: str) -> bool:
        """
        Change user's password
        
        Args:
            user_id: User's ID
            new_password: New password
            
        Returns:
            Success status
        """
        # Hash new password
        hashed_password = get_password_hash(new_password)
        
        # Update user
        updated_user = await update_user(user_id, {"password": hashed_password})
        
        return updated_user is not None

# Create service instance
auth_service = AuthService()