"""
Chatbot API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.core.auth_utils import get_current_active_user
from app.models.chat import (
    save_chat_message, get_chat_history,
    save_chat_session, get_chat_session,
    update_chat_session, get_user_chat_sessions
)
from app.schemas.chat import (
    ChatMessageResponse, ChatSessionResponse,
    ChatRequest, ChatResponse,
    ChatSessionCreate, ChatSessionUpdate
)
from app.services.chatbot import chatbot_service

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user = Depends(get_current_active_user)
):
    """
    Send a message to the chatbot
    
    - **message**: User's message
    - **session_id**: Chat session ID (optional)
    - **context**: Additional context (optional)
    """
    user_id = current_user["_id"]
    
    # Get or create session
    session_id = request.session_id
    session_context = {}
    
    if session_id:
        # Get existing session
        session = await get_chat_session(session_id)
        if session:
            session_context = session.get("context", {})
        else:
            # Invalid session ID
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
    else:
        # Create new session
        session_data = {
            "title": request.message[:50] + "..." if len(request.message) > 50 else request.message,
            "context": request.context or {}
        }
        session_id = await save_chat_session(user_id, session_data)
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create chat session"
            )
        session_context = request.context or {}
    
    # Save user message
    user_message = {
        "content": request.message,
        "is_user": True,
        "context": request.context,
        "session_id": session_id
    }
    saved_user_message = await save_chat_message(user_id, user_message)
    
    # Process message with AI
    combined_context = {**session_context, **(request.context or {})}
    response_data = await chatbot_service.process_message(request.message, combined_context)
    
    # Save assistant message
    assistant_message = {
        "content": response_data["message"],
        "is_user": False,
        "context": response_data["context"],
        "session_id": session_id
    }
    saved_assistant_message = await save_chat_message(user_id, assistant_message)
    
    # Update session context
    await update_chat_session(session_id, {
        "context": response_data["context"],
        "last_message": response_data["message"][:100]
    })
    
    # Return response
    return {
        "message": response_data["message"],
        "session_id": session_id,
        "context": response_data["context"],
        "created_at": saved_assistant_message["timestamp"]
    }

@router.get("/history/{session_id}", response_model=List[ChatMessageResponse])
async def get_session_history(
    session_id: str,
    current_user = Depends(get_current_active_user)
):
    """
    Get chat history for a session
    
    - **session_id**: Chat session ID
    """
    user_id = current_user["_id"]
    
    # Verify session belongs to user
    session = await get_chat_session(session_id)
    if not session or session.get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    # Get chat history
    messages = await get_chat_history(user_id)
    
    # Filter messages by session
    session_messages = [
        msg for msg in messages
        if msg.get("session_id") == session_id
    ]
    
    return session_messages

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_sessions(current_user = Depends(get_current_active_user)):
    """
    Get user's chat sessions
    """
    user_id = current_user["_id"]
    sessions = await get_user_chat_sessions(user_id)
    return sessions

@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session: ChatSessionCreate,
    current_user = Depends(get_current_active_user)
):
    """
    Create a new chat session
    
    - **title**: Session title
    - **context**: Initial context (optional)
    """
    user_id = current_user["_id"]
    
    session_data = session.dict()
    session_id = await save_chat_session(user_id, session_data)
    
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create chat session"
        )
    
    created_session = await get_chat_session(session_id)
    return created_session

@router.put("/sessions/{session_id}", response_model=ChatSessionResponse)
async def update_session(
    session_id: str,
    update_data: ChatSessionUpdate,
    current_user = Depends(get_current_active_user)
):
    """
    Update a chat session
    
    - **session_id**: Chat session ID
    - **title**: New session title (optional)
    - **context**: Updated context (optional)
    """
    user_id = current_user["_id"]
    
    # Verify session belongs to user
    session = await get_chat_session(session_id)
    if not session or session.get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    # Update session
    success = await update_chat_session(session_id, update_data.dict(exclude_unset=True))
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update chat session"
        )
    
    # Return updated session
    updated_session = await get_chat_session(session_id)
    return updated_session

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str,
    current_user = Depends(get_current_active_user)
):
    """
    Delete a chat session
    
    - **session_id**: Chat session ID
    """
    # This endpoint should be implemented with actual deletion logic
    # For now, we'll just return a success response
    return {}