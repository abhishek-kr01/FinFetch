"""
News service for handling financial news data
"""
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any

from app.models.news import (
    get_latest_news, get_news_by_id, get_news_by_symbols,
    search_news, save_news_articles
)
from app.utils.financial_apis import financial_data_service
from app.utils.helpers import cache_with_timeout

class NewsService:
    """Service for handling financial news data"""
    
    @staticmethod
    async def get_latest_news(
        limit: int = 20, 
        offset: int = 0, 
        symbol: Optional[str] = None,
        refresh: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get latest news articles
        
        Args:
            limit: Maximum number of articles
            offset: Number of articles to skip
            symbol: Filter by stock symbol
            refresh: Force refresh from external API
            
        Returns:
            List of news articles
        """
        # Try to get from database first
        if not refresh:
            articles = await get_latest_news(limit, offset, symbol)
            if articles and len(articles) > 0:
                return articles
        
        # If no articles in database or refresh is requested, fetch from API
        if symbol:
            # Fetch news for specific symbol
            from_date = datetime.now() - timedelta(days=7)
            to_date = datetime.now()
            
            fetched_articles = financial_data_service.get_company_news(
                symbol,
                from_date=from_date,
                to_date=to_date
            )
            
            if fetched_articles:
                await save_news_articles(fetched_articles)
                # Get fresh data from database with proper pagination
                return await get_latest_news(limit, offset, symbol)
        else:
            # Fetch general financial news
            # This would typically use a financial news API
            # For now, return empty list as this requires additional API integration
            return []
        
        return []
    
    @staticmethod
    async def get_news_article(news_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific news article
        
        Args:
            news_id: News article ID
            
        Returns:
            News article or None if not found
        """
        return await get_news_by_id(news_id)
    
    @staticmethod
    async def get_news_for_symbols(symbols: List[str], limit_per_symbol: int = 5) -> List[Dict[str, Any]]:
        """
        Get news for multiple stock symbols
        
        Args:
            symbols: List of stock symbols
            limit_per_symbol: Maximum number of articles per symbol
            
        Returns:
            List of news articles
        """
        # Get news from database
        articles = await get_news_by_symbols(symbols, limit_per_symbol)
        
        # If no articles, fetch from external API
        if not articles or len(articles) == 0:
            all_fetched_articles = []
            
            from_date = datetime.now() - timedelta(days=7)
            to_date = datetime.now()
            
            for symbol in symbols:
                fetched_articles = financial_data_service.get_company_news(
                    symbol,
                    from_date=from_date,
                    to_date=to_date
                )
                
                if fetched_articles:
                    all_fetched_articles.extend(fetched_articles)
            
            if all_fetched_articles:
                await save_news_articles(all_fetched_articles)
                # Get fresh data from database
                articles = await get_news_by_symbols(symbols, limit_per_symbol)
        
        return articles
    
    @staticmethod
    @cache_with_timeout(3600)  # Cache for 1 hour
    async def search_news_articles(query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Search news articles by keyword
        
        Args:
            query: Search keyword
            limit: Maximum number of results
            
        Returns:
            List of matching news articles
        """
        return await search_news(query, limit)
    
    @staticmethod
    async def get_trending_news(limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get trending financial news
        
        Args:
            limit: Maximum number of articles
            
        Returns:
            List of trending news articles
        """
        # In a real implementation, this would use metrics like view count or engagement
        # For now, we'll just return the latest news
        return await get_latest_news(limit)

# Create service instance
news_service = NewsService()