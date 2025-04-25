"""
Chat model for MongoDB
"""
from datetime import datetime
from typing import Dict, List, Optional
from bson import ObjectId
from app.core.database import get_database

async def save_chat_message(user_id: str, message: Dict) -> Optional[Dict]:
    """
    Save chat message to database
    
    Args:
        user_id: User ID
        message: Chat message data
        
    Returns:
        Saved message or None if error
    """
    db = await get_database()
    
    try:
        # Add metadata
        message["user_id"] = user_id
        message["timestamp"] = datetime.utcnow()
        
        # Insert message
        result = await db.chat_messages.insert_one(message)
        
        # Return inserted message
        message["_id"] = str(result.inserted_id)
        return message
    except Exception as e:
        print(f"Error saving chat message: {e}")
        return None

async def get_chat_history(user_id: str, limit: int = 50) -> List[Dict]:
    """
    Get chat history for a user
    
    Args:
        user_id: User ID
        limit: Maximum number of messages
        
    Returns:
        List of chat messages
    """
    db = await get_database()
    
    # Query messages
    cursor = db.chat_messages.find({"user_id": user_id}).sort("timestamp", -1).limit(limit)
    
    # Process results
    messages = []
    async for msg in cursor:
        msg["_id"] = str(msg["_id"])
        messages.append(msg)
    
    # Return in chronological order
    return list(reversed(messages))

async def save_chat_session(user_id: str, session_data: Dict) -> Optional[str]:
    """
    Save chat session data
    
    Args:
        user_id: User ID
        session_data: Session data
        
    Returns:
        Session ID or None if error
    """
    db = await get_database()
    
    try:
        # Add metadata
        session_data["user_id"] = user_id
        session_data["created_at"] = datetime.utcnow()
        session_data["updated_at"] = datetime.utcnow()
        
        # Insert session
        result = await db.chat_sessions.insert_one(session_data)
        
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error saving chat session: {e}")
        return None

async def get_chat_session(session_id: str) -> Optional[Dict]:
    """
    Get chat session by ID
    
    Args:
        session_id: Session ID
        
    Returns:
        Session data or None if not found
    """
    db = await get_database()
    
    try:
        session = await db.chat_sessions.find_one({"_id": ObjectId(session_id)})
        if session:
            session["_id"] = str(session["_id"])
        return session
    except:
        return None

async def update_chat_session(session_id: str, update_data: Dict) -> bool:
    """
    Update chat session
    
    Args:
        session_id: Session ID
        update_data: Data to update
        
    Returns:
        Success status
    """
    db = await get_database()
    
    try:
        # Add updated timestamp
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db.chat_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": update_data}
        )
        
        return result.modified_count > 0
    except:
        return False

async def get_user_chat_sessions(user_id: str, limit: int = 10) -> List[Dict]:
    """
    Get chat sessions for a user
    
    Args:
        user_id: User ID
        limit: Maximum number of sessions
        
    Returns:
        List of chat sessions
    """
    db = await get_database()
    
    cursor = db.chat_sessions.find({"user_id": user_id}).sort("updated_at", -1).limit(limit)
    
    sessions = []
    async for session in cursor:
        session["_id"] = str(session["_id"])
        sessions.append(session)
    
    return sessions