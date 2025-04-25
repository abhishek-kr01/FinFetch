"""
Chat schemas for request validation and responses
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ChatMessageBase(BaseModel):
    """Base schema for chat messages"""
    content: str
    is_user: bool
    context: Optional[Dict[str, Any]] = None

class ChatMessageCreate(ChatMessageBase):
    """Schema for creating a chat message"""
    pass

class ChatMessageResponse(ChatMessageBase):
    """Schema for chat message responses"""
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    timestamp: datetime
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class ChatSessionBase(BaseModel):
    """Base schema for chat sessions"""
    title: str
    context: Optional[Dict[str, Any]] = None

class ChatSessionCreate(ChatSessionBase):
    """Schema for creating a chat session"""
    pass

class ChatSessionUpdate(BaseModel):
    """Schema for updating a chat session"""
    title: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatSessionResponse(ChatSessionBase):
    """Schema for chat session responses"""
    id: str = Field(..., alias="_id")
    user_id: str
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class ChatRequest(BaseModel):
    """Schema for chat requests"""
    message: str
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    """Schema for chat responses"""
    message: str
    session_id: str
    context: Optional[Dict[str, Any]] = None
    created_at: datetime