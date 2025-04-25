"""
News schemas for request validation and responses
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, validator, HttpUrl

class NewsArticleBase(BaseModel):
    """Base schema for news articles"""
    headline: str
    summary: Optional[str] = None
    source: str
    url: Optional[str] = None
    image: Optional[str] = None
    symbol: Optional[str] = None

class NewsArticleCreate(NewsArticleBase):
    """Schema for creating a news article"""
    datetime: datetime

class NewsArticleResponse(NewsArticleBase):
    """Schema for news article responses"""
    id: str = Field(..., alias="_id")
    date: datetime
    datetime: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class NewsSearchRequest(BaseModel):
    """Schema for news search requests"""
    query: str = Field(..., min_length=1)
    limit: Optional[int] = 20

class NewsFilterRequest(BaseModel):
    """Schema for news filter requests"""
    symbol: Optional[str] = None
    limit: Optional[int] = 20
    offset: Optional[int] = 0

class NewsSymbolsRequest(BaseModel):
    """Schema for getting news for multiple symbols"""
    symbols: List[str]
    limit: Optional[int] = 5  # Per symbol