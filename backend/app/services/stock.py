"""
Stock service for handling stock data logic
"""
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any

from app.models.stock import (
    get_stock_prices, save_stock_prices,
    get_stock_quote, save_stock_quote,
    get_stock_financials, save_stock_financials,
    get_user_watchlist, save_user_watchlist,
    add_to_watchlist, remove_from_watchlist
)
from app.utils.financial_apis import financial_data_service
from app.utils.helpers import cache_with_timeout

class StockService:
    """Service for handling stock data logic"""
    
    @staticmethod
    async def get_stock_quote(symbol: str, refresh: bool = False) -> Optional[Dict[str, Any]]:
        """
        Get real-time stock quote
        
        Args:
            symbol: Stock symbol
            refresh: Force refresh from external API
            
        Returns:
            Stock quote data or None if not found
        """
        # Try to get from database first
        if not refresh:
            db_quote = await get_stock_quote(symbol)
            if db_quote:
                # Check if quote is recent (within last 5 minutes)
                timestamp = db_quote.get("timestamp")
                if timestamp and (datetime.utcnow() - timestamp).total_seconds() < 300:
                    return db_quote
        
        # Fetch fresh data from external API
        quote_data = financial_data_service.get_stock_quote(symbol)
        if not quote_data:
            return None
        
        # Save to database
        await save_stock_quote(quote_data)
        
        # Add timestamp if not present
        if "timestamp" not in quote_data:
            quote_data["timestamp"] = datetime.utcnow()
        
        return quote_data
    
    @staticmethod
    async def get_batch_quotes(symbols: List[str], refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Get real-time stock quotes for multiple symbols
        
        Args:
            symbols: List of stock symbols
            refresh: Force refresh from external API
            
        Returns:
            List of stock quote data
        """
        quotes = []
        
        if refresh:
            # Fetch all quotes from external API
            quotes_data = financial_data_service.get_stock_quotes(symbols)
            
            # Save to database and format
            for symbol, quote in quotes_data.items():
                if quote:
                    # Add timestamp
                    quote["timestamp"] = datetime.utcnow()
                    
                    # Save to database
                    await save_stock_quote(quote)
                    
                    quotes.append(quote)
        else:
            # Try to get each quote individually
            for symbol in symbols:
                quote = await StockService.get_stock_quote(symbol)
                if quote:
                    quotes.append(quote)
        
        return quotes
    
    @staticmethod
    async def get_historical_data(
        symbol: str, 
        start_date: Optional[datetime] = None, 
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Get historical price data
        
        Args:
            symbol: Stock symbol
            start_date: Start date for data range
            end_date: End date for data range
            
        Returns:
            List of historical price data points
        """
        # Get from database
        db_prices = await get_stock_prices(symbol, start_date, end_date)
        
        # If we have enough data, return it
        if db_prices and len(db_prices) > 0:
            return db_prices
        
        # If no data in DB, fetch from external API
        historical_data = financial_data_service.get_historical_prices(
            symbol,
            start_date,
            end_date
        )
        
        if not historical_data:
            return []
        
        # Save to database
        await save_stock_prices(symbol, historical_data)
        
        return historical_data
    
    @staticmethod
    @cache_with_timeout(86400)  # Cache for 24 hours
    async def get_financials(symbol: str, refresh: bool = False) -> Optional[Dict[str, Any]]:
        """
        Get financial data for a stock
        
        Args:
            symbol: Stock symbol
            refresh: Force refresh from external API
            
        Returns:
            Financial data or None if not found
        """
        # Try to get from database first
        if not refresh:
            db_financials = await get_stock_financials(symbol)
            if db_financials:
                # Check if data is recent (within last 24 hours)
                timestamp = db_financials.get("timestamp")
                if timestamp and (datetime.utcnow() - timestamp).total_seconds() < 86400:
                    return db_financials
        
        # Fetch fresh data from external API
        financials = financial_data_service.get_financials(symbol)
        if not financials:
            return None
        
        # Save to database
        await save_stock_financials(symbol, financials)
        
        # Add timestamp if not present
        if "timestamp" not in financials:
            financials["timestamp"] = datetime.utcnow()
        
        return financials
    
    @staticmethod
    @cache_with_timeout(3600)  # Cache for 1 hour
    async def search_stocks(query: str) -> List[Dict[str, Any]]:
        """
        Search for stocks by name or symbol
        
        Args:
            query: Search term
            
        Returns:
            List of matching stocks
        """
        return financial_data_service.search_stocks(query)
    
    @staticmethod
    async def get_user_watchlist(user_id: str) -> List[str]:
        """
        Get user's watchlist
        
        Args:
            user_id: User ID
            
        Returns:
            List of stock symbols
        """
        return await get_user_watchlist(user_id)
    
    @staticmethod
    async def update_watchlist(user_id: str, symbols: List[str]) -> bool:
        """
        Update user's watchlist
        
        Args:
            user_id: User ID
            symbols: List of stock symbols
            
        Returns:
            Success status
        """
        return await save_user_watchlist(user_id, symbols)
    
    @staticmethod
    async def add_to_watchlist(user_id: str, symbol: str) -> bool:
        """
        Add a symbol to user's watchlist
        
        Args:
            user_id: User ID
            symbol: Stock symbol
            
        Returns:
            Success status
        """
        return await add_to_watchlist(user_id, symbol)
    
    @staticmethod
    async def remove_from_watchlist(user_id: str, symbol: str) -> bool:
        """
        Remove a symbol from user's watchlist
        
        Args:
            user_id: User ID
            symbol: Stock symbol
            
        Returns:
            Success status
        """
        return await remove_from_watchlist(user_id, symbol)
    
    @staticmethod
    async def get_popular_stocks() -> List[Dict[str, str]]:
        """
        Get a list of popular stocks
        
        Returns:
            List of popular stocks with symbol and company name
        """
        # Hard-coded list of popular stocks
        # In a real app, this could be based on trading volume or analytics
        return [
            {"symbol": "AAPL", "company_name": "Apple Inc."},
            {"symbol": "MSFT", "company_name": "Microsoft Corporation"},
            {"symbol": "GOOGL", "company_name": "Alphabet Inc."},
            {"symbol": "AMZN", "company_name": "Amazon.com Inc."},
            {"symbol": "TSLA", "company_name": "Tesla Inc."},
            {"symbol": "META", "company_name": "Meta Platforms Inc."},
            {"symbol": "NVDA", "company_name": "NVIDIA Corporation"},
            {"symbol": "NFLX", "company_name": "Netflix Inc."},
            {"symbol": "JPM", "company_name": "JPMorgan Chase & Co."},
            {"symbol": "V", "company_name": "Visa Inc."}
        ]

# Create service instance
stock_service = StockService()