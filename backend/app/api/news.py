"""
News API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timedelta
from .news1 import get_all_news
from app.core.auth_utils import get_current_active_user
from app.models.news import (
    get_latest_news, get_news_by_id, get_news_by_symbols,
    search_news, save_news_articles
)
from app.schemas.news import (
    NewsArticleResponse, NewsSearchRequest, 
    NewsFilterRequest, NewsSymbolsRequest
)
from app.utils.financial_apis import financial_data_service

router = APIRouter(prefix="/news", tags=["News"])

@router.get("/latest")
async def latest_news(
    limit: int = Query(20, gt=0, le=100),
    offset: int = Query(0, ge=0),
    symbol: Optional[str] = None
):
    """
    Get latest news articles
    
    - **limit**: Maximum number of articles (1-100)
    - **offset**: Number of articles to skip
    - **symbol**: Filter by stock symbol (optional)
    """
    articles = await get_latest_news(limit, offset, symbol)
    
    if not articles:
        # If no articles in database, fetch from external API
        if symbol:
            # Fetch news for specific symbol
            fetched_articles = financial_data_service.get_company_news(
                symbol,
                from_date=datetime.now() - timedelta(days=7),
                to_date=datetime.now()
            )
            
            if fetched_articles:
                await save_news_articles(fetched_articles)
                articles = await get_latest_news(limit, offset, symbol)
    return articles 

# @router.get("/{news_id}", response_model=NewsArticleResponse)
# async def get_article(news_id: str):
#     """
#     Get a specific news article by ID
    
#     - **news_id**: ID of the news article
#     """
#     article = await get_news_by_id(news_id)
    
#     if not article:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="News article not found"
#         )
    
#     return article

@router.post("/search", response_model=List[NewsArticleResponse])
async def search_articles(request: NewsSearchRequest):
    """
    Search news articles by keyword
    
    - **query**: Search keyword
    - **limit**: Maximum number of results
    """
    articles = await search_news(request.query, request.limit)
    return articles

@router.post("/filter", response_model=List[NewsArticleResponse])
async def filter_news(request: NewsFilterRequest):
    """
    Filter news articles
    
    - **symbol**: Filter by stock symbol (optional)
    - **limit**: Maximum number of results
    - **offset**: Number of articles to skip
    """
    # articles = await get_latest_news(request.limit, request.offset, request.symbol)
    return []

@router.post("/by-symbols", response_model=List[NewsArticleResponse])
async def news_by_symbols(
    request: NewsSymbolsRequest,
    current_user = Depends(get_current_active_user)
):
    """
    Get news for multiple stock symbols
    
    - **symbols**: List of stock symbols
    - **limit**: Maximum number of articles per symbol
    """
    # Get news from database
    articles = await get_news_by_symbols(request.symbols, request.limit)
    
    # If no articles, fetch from external API
    if not articles:
        all_fetched_articles = []
        
        for symbol in request.symbols:
            fetched_articles = financial_data_service.get_company_news(
                symbol,
                from_date=datetime.now() - timedelta(days=7),
                to_date=datetime.now()
            )
            
            if fetched_articles:
                all_fetched_articles.extend(fetched_articles)
        
        if all_fetched_articles:
            await save_news_articles(all_fetched_articles)
            articles = await get_news_by_symbols(request.symbols, request.limit)
    
    return articles

@router.get("/trending")
async def trending_news():
    """
    Get trending financial news articles
    """
    # In a real app, this would use metrics like view count, engagement, etc.
    # For now, we'll just return recent news
    articles = await get_latest_news(10)
    return articles