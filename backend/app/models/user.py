"""
User model for MongoDB
"""
from datetime import datetime
from typing import Dict, List, Optional
from bson import ObjectId
from app.core.database import get_database
from app.core.security import get_password_hash

async def create_user(user_data: Dict) -> Dict:
    """
    Create a new user in the database
    
    Args:
        user_data: User information including email, username, password
        
    Returns:
        Created user document
    """
    db = await get_database()
    
    # Hash the password before storing
    user_data["password"] = get_password_hash(user_data["password"])
    
    # Add additional fields
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = datetime.utcnow()
    user_data["is_active"] = True
    user_data["watchlist"] = []
    
    # Insert the user into the database
    result = await db.users.insert_one(user_data)
    
    # Retrieve and return the created user (without password)
    user = await db.users.find_one({"_id": result.inserted_id})
    user["_id"] = str(user["_id"])  # Convert ObjectId to string
    user.pop("password", None)  # Remove password from response
    
    return user

async def get_user_by_id(user_id: str) -> Optional[Dict]:
    """
    Get user by ID
    
    Args:
        user_id: User's ObjectId as string
        
    Returns:
        User document or None if not found
    """
    db = await get_database()
    
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
            user.pop("password", None)
        return user
    except:
        return None

async def get_user_by_email(email: str) -> Optional[Dict]:
    """
    Get user by email
    
    Args:
        email: User's email address
        
    Returns:
        User document or None if not found
    """
    db = await get_database()
    
    user = await db.users.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
    return user

async def get_user_for_auth(email: str) -> Optional[Dict]:
    """
    Get user for authentication (including password)
    
    Args:
        email: User's email address
        
    Returns:
        User document with password or None if not found
    """
    db = await get_database()
    
    user = await db.users.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
    return user

async def update_user(user_id: str, update_data: Dict) -> Optional[Dict]:
    """
    Update user information
    
    Args:
        user_id: User's ObjectId as string
        update_data: Fields to update
        
    Returns:
        Updated user document or None if not found
    """
    db = await get_database()
    
    # Don't allow updating certain fields directly
    update_data.pop("_id", None)
    update_data.pop("created_at", None)
    
    # Hash password if it's being updated
    if "password" in update_data:
        update_data["password"] = get_password_hash(update_data["password"])
    
    update_data["updated_at"] = datetime.utcnow()
    
    try:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Return updated user
        return await get_user_by_id(user_id)
    except:
        return None

async def update_watchlist(user_id: str, watchlist: List[str]) -> Optional[Dict]:
    """
    Update user's watchlist
    
    Args:
        user_id: User's ObjectId as string
        watchlist: List of stock symbols
        
    Returns:
        Updated user document or None if not found
    """
    db = await get_database()
    
    try:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "watchlist": watchlist,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Return updated user
        return await get_user_by_id(user_id)
    except:
        return None

async def delete_user(user_id: str) -> bool:
    """
    Delete user account
    
    Args:
        user_id: User's ObjectId as string
        
    Returns:
        True if deleted, False otherwise
    """
    db = await get_database()
    
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    except:
        return False
