"""
News model for MongoDB
"""
from datetime import datetime
from typing import Dict, List, Optional
from bson import ObjectId
from app.core.database import get_database
from app.api.news1 import (
    get_all_news
)
async def save_news_articles(articles: List[Dict]) -> bool:
    """
    Save news articles to database
    
    Args:
        articles: List of news articles
        
    Returns:
        Success status
    """
    if not articles:
        return True
        
    db = await get_database()
    
    try:
        # Add created_at timestamp
        for article in articles:
            article["created_at"] = datetime.utcnow()
            
            # Convert datetime objects to strings to avoid MongoDB serialization issues
            if "datetime" in article and isinstance(article["datetime"], datetime):
                article["date"] = article["datetime"]
                article["datetime"] = article["datetime"].isoformat()
        
        # Use bulk operation for better performance
        result = await db.news.insert_many(articles)
        return len(result.inserted_ids) == len(articles)
    except Exception as e:
        print(f"Error saving news articles: {e}")
        return False

async def get_latest_news(limit: int = 20, offset: int = 0, symbol: Optional[str] = None) -> List[Dict]:
    """
    Get latest news articles
    
    Args:
        limit: Maximum number of articles to return
        offset: Number of articles to skip
        symbol: Filter by stock symbol (optional)
        
    Returns:
        List of news articles
    """
    print("get_all_news")
    articles = get_all_news()
    return articles
    # db = await get_database()
    
    # # Build query
    # query = {}
    # if symbol:
    #     query["symbol"] = symbol
    
    # # Execute query
    # cursor = db.news.find(query).sort("date", -1).skip(offset).limit(limit)
    
    # # Process results
    # articles = []
    # async for article in cursor:
    #     article["_id"] = str(article["_id"])
    #     articles.append(article)
    
    return articles

async def get_news_by_id(news_id: str) -> Optional[Dict]:
    """
    Get news article by ID
    
    Args:
        news_id: News article ID
        
    Returns:
        News article or None if not found
    """
    db = await get_database()
    
    try:
        article = await db.news.find_one({"_id": ObjectId(news_id)})
        if article:
            article["_id"] = str(article["_id"])
        return article
    except:
        return None

async def get_news_by_symbols(symbols: List[str], limit: int = 20) -> List[Dict]:
    """
    Get news articles for multiple symbols
    
    Args:
        symbols: List of stock symbols
        limit: Maximum number of articles per symbol
        
    Returns:
        List of news articles
    """
    db = await get_database()
    
    pipeline = [
        {"$match": {"symbol": {"$in": symbols}}},
        {"$sort": {"date": -1}},
        {"$group": {
            "_id": "$symbol",
            "articles": {"$push": "$$ROOT"},
        }},
        {"$project": {
            "articles": {"$slice": ["$articles", limit]}
        }},
        {"$unwind": "$articles"},
        {"$replaceRoot": {"newRoot": "$articles"}},
        {"$sort": {"date": -1}},
        {"$limit": limit * len(symbols)}
    ]
    
    cursor = db.news.aggregate(pipeline)
    
    # Process results
    articles = []
    async for article in cursor:
        article["_id"] = str(article["_id"])
        articles.append(article)
    
    return articles

async def search_news(query: str, limit: int = 20) -> List[Dict]:
    """
    Search news articles by keyword
    
    Args:
        query: Search keyword
        limit: Maximum number of articles to return
        
    Returns:
        List of matching news articles
    """
    db = await get_database()
    
    # Text search
    text_query = {
        "$text": {"$search": query}
    }
    
    # Execute query
    cursor = db.news.find(text_query).sort([
        ("score", {"$meta": "textScore"}),
        ("date", -1)
    ]).limit(limit)
    
    # Process results
    articles = []
    async for article in cursor:
        article["_id"] = str(article["_id"])
        articles.append(article)
    
    # If no results from text search, try regex search
    if not articles:
        regex_query = {
            "$or": [
                {"headline": {"$regex": query, "$options": "i"}},
                {"summary": {"$regex": query, "$options": "i"}}
            ]
        }
        
        cursor = db.news.find(regex_query).sort("date", -1).limit(limit)
        
        async for article in cursor:
            article["_id"] = str(article["_id"])
            articles.append(article)
    
    return articles