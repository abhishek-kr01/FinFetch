"""
Stock data model for MongoDB
"""
from datetime import datetime
from typing import Dict, List, Optional, Any
from bson import ObjectId
from app.core.database import get_database

# Collections
# - stock_prices: Historical stock prices
# - stock_quotes: Real-time stock quotes
# - stock_financials: Financial data for stocks
# - watchlists: User watchlists

async def save_stock_prices(symbol: str, prices: List[Dict]) -> bool:
    """
    Save historical stock prices to database
    
    Args:
        symbol: Stock symbol
        prices: List of price data points
        
    Returns:
        Success status
    """
    db = await get_database()
    
    try:
        # Add metadata to each price point
        for price in prices:
            price["symbol"] = symbol
            price["date"] = datetime.strptime(price.get("date", ""), "%Y-%m-%d") if "date" in price else datetime.utcnow()
            price["created_at"] = datetime.utcnow()
        
        # Use bulk operation for better performance
        if prices:
            result = await db.stock_prices.insert_many(prices)
            return len(result.inserted_ids) == len(prices)
        return True
    except Exception as e:
        print(f"Error saving stock prices: {e}")
        return False

async def get_stock_prices(symbol: str, 
                          start_date: Optional[datetime] = None, 
                          end_date: Optional[datetime] = None, 
                          limit: int = 100) -> List[Dict]:
    """
    Get historical stock prices from database
    
    Args:
        symbol: Stock symbol
        start_date: Start date for data range (optional)
        end_date: End date for data range (optional)
        limit: Maximum number of data points
        
    Returns:
        List of price data points
    """
    db = await get_database()
    
    # Build query
    query = {"symbol": symbol}
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = end_date
        else:
            query["date"] = {"$lte": end_date}
    
    # Execute query
    cursor = db.stock_prices.find(query).sort("date", -1).limit(limit)
    
    # Process results
    prices = []
    async for price in cursor:
        price["_id"] = str(price["_id"])
        prices.append(price)
    
    return prices

async def save_stock_quote(quote: Dict) -> bool:
    """
    Save real-time stock quote to database
    
    Args:
        quote: Stock quote data
        
    Returns:
        Success status
    """
    db = await get_database()
    
    try:
        # Add timestamp
        quote["timestamp"] = datetime.utcnow()
        
        # Insert or update quote
        result = await db.stock_quotes.update_one(
            {"symbol": quote["symbol"]},
            {"$set": quote},
            upsert=True
        )
        
        return result.modified_count > 0 or result.upserted_id is not None
    except Exception as e:
        print(f"Error saving stock quote: {e}")
        return False

async def get_stock_quote(symbol: str) -> Optional[Dict]:
    """
    Get latest stock quote from database
    
    Args:
        symbol: Stock symbol
        
    Returns:
        Stock quote data or None if not found
    """
    db = await get_database()
    
    quote = await db.stock_quotes.find_one({"symbol": symbol})
    if quote:
        quote["_id"] = str(quote["_id"])
    
    return quote

async def save_stock_financials(symbol: str, financials: Dict) -> bool:
    """
    Save stock financial data to database
    
    Args:
        symbol: Stock symbol
        financials: Financial data
        
    Returns:
        Success status
    """
    db = await get_database()
    
    try:
        # Add metadata
        financials["symbol"] = symbol
        financials["timestamp"] = datetime.utcnow()
        
        # Insert or update financials
        result = await db.stock_financials.update_one(
            {"symbol": symbol},
            {"$set": financials},
            upsert=True
        )
        
        return result.modified_count > 0 or result.upserted_id is not None
    except Exception as e:
        print(f"Error saving stock financials: {e}")
        return False

async def get_stock_financials(symbol: str) -> Optional[Dict]:
    """
    Get stock financial data from database
    
    Args:
        symbol: Stock symbol
        
    Returns:
        Financial data or None if not found
    """
    db = await get_database()
    
    financials = await db.stock_financials.find_one({"symbol": symbol})
    if financials:
        financials["_id"] = str(financials["_id"])
    
    return financials

async def save_user_watchlist(user_id: str, symbols: List[str]) -> bool:
    """
    Save user watchlist
    
    Args:
        user_id: User ID
        symbols: List of stock symbols
        
    Returns:
        Success status
    """
    db = await get_database()
    
    try:
        watchlist = {
            "user_id": user_id,
            "symbols": symbols,
            "updated_at": datetime.utcnow()
        }
        
        result = await db.watchlists.update_one(
            {"user_id": user_id},
            {"$set": watchlist},
            upsert=True
        )
        
        return result.modified_count > 0 or result.upserted_id is not None
    except Exception as e:
        print(f"Error saving watchlist: {e}")
        return False

async def get_user_watchlist(user_id: str) -> List[str]:
    """
    Get user watchlist
    
    Args:
        user_id: User ID
        
    Returns:
        List of stock symbols
    """
    db = await get_database()
    
    watchlist = await db.watchlists.find_one({"user_id": user_id})
    if watchlist:
        return watchlist.get("symbols", [])
    
    return []

async def add_to_watchlist(user_id: str, symbol: str) -> bool:
    """
    Add symbol to user watchlist
    
    Args:
        user_id: User ID
        symbol: Stock symbol
        
    Returns:
        Success status
    """
    db = await get_database()
    
    try:
        result = await db.watchlists.update_one(
            {"user_id": user_id},
            {
                "$addToSet": {"symbols": symbol},
                "$set": {"updated_at": datetime.utcnow()}
            },
            upsert=True
        )
        
        return result.modified_count > 0 or result.upserted_id is not None
    except Exception as e:
        print(f"Error adding to watchlist: {e}")
        return False

async def remove_from_watchlist(user_id: str, symbol: str) -> bool:
    """
    Remove symbol from user watchlist
    
    Args:
        user_id: User ID
        symbol: Stock symbol
        
    Returns:
        Success status
    """
    db = await get_database()
    
    try:
        result = await db.watchlists.update_one(
            {"user_id": user_id},
            {
                "$pull": {"symbols": symbol},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return result.modified_count > 0
    except Exception as e:
        print(f"Error removing from watchlist: {e}")
        return False