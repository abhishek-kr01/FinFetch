"""
Stock data API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Dict, Optional
from datetime import datetime, timedelta

from app.core.auth_utils import get_current_active_user
from app.models.stock import (
    get_stock_prices, save_stock_prices, 
    get_stock_quote, save_stock_quote,
    get_stock_financials, save_stock_financials,
    get_user_watchlist, save_user_watchlist,
    add_to_watchlist, remove_from_watchlist
)
from app.schemas.stock import (
    StockQuoteResponse, StockPriceResponse,
    StockFinancialResponse, StockSearchRequest, 
    StockHistoricalRequest, StockSymbol,
    WatchlistRequest, WatchlistResponse
)
from app.utils.financial_apis import financial_data_service

router = APIRouter(prefix="/stocks", tags=["Stocks"])

@router.get("/quotes/{symbol}", response_model=StockQuoteResponse)
async def get_quote(
    symbol: str,
    refresh: bool = False,
    current_user = Depends(get_current_active_user)
):
    """
    Get real-time stock quote for a symbol
    
    - **symbol**: Stock symbol (e.g., AAPL, MSFT)
    - **refresh**: Force refresh from external API
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No quote data found for symbol {symbol}"
        )
    
    # Save to database
    await save_stock_quote(quote_data)
    
    # Add timestamp if not present
    if "timestamp" not in quote_data:
        quote_data["timestamp"] = datetime.utcnow()
    
    return quote_data

@router.post("/quotes/batch", response_model=List[StockQuoteResponse])
async def get_batch_quotes(
    symbols: List[str],
    refresh: bool = False,
    current_user = Depends(get_current_active_user)
):
    """
    Get real-time stock quotes for multiple symbols
    
    - **symbols**: List of stock symbols
    - **refresh**: Force refresh from external API
    """
    quotes = []
    
    # Get quotes for each symbol
    for symbol in symbols:
        try:
            quote = await get_quote(symbol, refresh, current_user)
            quotes.append(quote)
        except HTTPException:
            # Skip symbols that return errors
            continue
    
    return quotes

@router.post("/historical", response_model=List[StockPriceResponse])
async def get_historical_data(
    request: StockHistoricalRequest,
    current_user = Depends(get_current_active_user)
):
    """
    Get historical price data for a stock
    
    - **symbol**: Stock symbol
    - **start_date**: Start date (optional)
    - **end_date**: End date (optional)
    - **interval**: Data interval (1d, 1wk, 1mo)
    """
    # Get from database
    db_prices = await get_stock_prices(
        request.symbol,
        request.start_date,
        request.end_date,
        limit=365  # Max 1 year of daily data
    )
    
    # If we have enough data, return it
    if db_prices and len(db_prices) > 0:
        return db_prices
    
    # If no data in DB, fetch from external API
    historical_data = financial_data_service.get_historical_prices(
        request.symbol,
        request.start_date,
        request.end_date
    )
    
    if not historical_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No historical data found for symbol {request.symbol}"
        )
    
    # Save to database
    await save_stock_prices(request.symbol, historical_data)
    
    return historical_data

@router.get("/financials/{symbol}", response_model=StockFinancialResponse)
async def get_financials(
    symbol: str,
    refresh: bool = False,
    current_user = Depends(get_current_active_user)
):
    """
    Get financial data for a stock
    
    - **symbol**: Stock symbol
    - **refresh**: Force refresh from external API
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No financial data found for symbol {symbol}"
        )
    
    # Save to database
    await save_stock_financials(symbol, financials)
    
    # Add timestamp if not present
    if "timestamp" not in financials:
        financials["timestamp"] = datetime.utcnow()
    
    return financials

@router.post("/search", response_model=List[StockSymbol])
async def search_stocks(
    request: StockSearchRequest,
    current_user = Depends(get_current_active_user)
):
    """
    Search for stocks by name or symbol
    
    - **query**: Search term
    """
    results = financial_data_service.search_stocks(request.query)
    
    if not results:
        return []
    
    return results

@router.get("/watchlist", response_model=List[str])
async def get_watchlist(current_user = Depends(get_current_active_user)):
    """
    Get current user's watchlist
    """
    watchlist = await get_user_watchlist(current_user["_id"])
    return watchlist

@router.put("/watchlist", response_model=List[str])
async def update_watchlist(
    request: WatchlistRequest,
    current_user = Depends(get_current_active_user)
):
    """
    Update user's watchlist
    
    - **symbols**: List of stock symbols to include in watchlist
    """
    success = await save_user_watchlist(current_user["_id"], request.symbols)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update watchlist"
        )
    
    return request.symbols

@router.post("/watchlist/{symbol}", status_code=status.HTTP_200_OK)
async def add_symbol_to_watchlist(
    symbol: str,
    current_user = Depends(get_current_active_user)
):
    """
    Add a symbol to user's watchlist
    
    - **symbol**: Stock symbol to add
    """
    success = await add_to_watchlist(current_user["_id"], symbol)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add symbol to watchlist"
        )
    
    return {"message": f"Symbol {symbol} added to watchlist"}

@router.delete("/watchlist/{symbol}", status_code=status.HTTP_200_OK)
async def remove_symbol_from_watchlist(
    symbol: str,
    current_user = Depends(get_current_active_user)
):
    """
    Remove a symbol from user's watchlist
    
    - **symbol**: Stock symbol to remove
    """
    success = await remove_from_watchlist(current_user["_id"], symbol)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove symbol from watchlist"
        )
    
    return {"message": f"Symbol {symbol} removed from watchlist"}

@router.get("/popular", response_model=List[StockSymbol])
async def get_popular_stocks():
    """Get popular stocks (doesn't require authentication)"""
    popular_stocks = [
    {"symbol": "AAPL", "company_name": "Apple Inc."},
    {"symbol": "MSFT", "company_name": "Microsoft Corporation"},
    {"symbol": "GOOGL", "company_name": "Alphabet Inc."},
    {"symbol": "AMZN", "company_name": "Amazon.com Inc."},
    {"symbol": "TSLA", "company_name": "Tesla Inc."},
    {"symbol": "META", "company_name": "Meta Platforms Inc."},
    {"symbol": "NVDA", "company_name": "NVIDIA Corporation"},
    {"symbol": "NFLX", "company_name": "Netflix Inc."},
    {"symbol": "JPM", "company_name": "JPMorgan Chase & Co."},
    {"symbol": "V", "company_name": "Visa Inc."},
    
    {"symbol": "INFY", "company_name": "Infosys Limited"},
    {"symbol": "TCS", "company_name": "Tata Consultancy Services Limited"},
    {"symbol": "RELIANCE", "company_name": "Reliance Industries Limited"},
    {"symbol": "HDFC", "company_name": "HDFC Bank Limited"},
    {"symbol": "ICICI", "company_name": "ICICI Bank Limited"},
    {"symbol": "SBI", "company_name": "State Bank of India"},
    
    {"symbol": "UBER", "company_name": "Uber Technologies Inc."},
    {"symbol": "PYPL", "company_name": "PayPal Holdings Inc."},
    {"symbol": "INTC", "company_name": "Intel Corporation"},
    {"symbol": "CRM", "company_name": "Salesforce Inc."},
    {"symbol": "AMD", "company_name": "Advanced Micro Devices Inc."},
    {"symbol": "QCOM", "company_name": "Qualcomm Incorporated"},
    
    {"symbol": "BAJFINANCE", "company_name": "Bajaj Finance Limited"},
    {"symbol": "MARUTI", "company_name": "Maruti Suzuki India Limited"},
    {"symbol": "ASIANPAINTS", "company_name": "Asian Paints Limited"},
    {"symbol": "TITAN", "company_name": "Titan Company Limited"},
    
    {"symbol": "BABA", "company_name": "Alibaba Group Holding Limited"},
    {"symbol": "JNJ", "company_name": "Johnson & Johnson"},
    {"symbol": "WMT", "company_name": "Walmart Inc."},
    {"symbol": "MA", "company_name": "Mastercard Incorporated"},
    {"symbol": "BAC", "company_name": "Bank of America Corporation"},
    
    {"symbol": "HEROMOTOCO", "company_name": "Hero MotoCorp Limited"},
    {"symbol": "COALINDIA", "company_name": "Coal India Limited"},
    {"symbol": "UNH", "company_name": "UnitedHealth Group Incorporated"},
    {"symbol": "DIS", "company_name": "The Walt Disney Company"},
    {"symbol": "PG", "company_name": "Procter & Gamble Company"},
    
    {"symbol": "CIPLA", "company_name": "Cipla Limited"},
    {"symbol": "SUNPHARMA", "company_name": "Sun Pharmaceutical Industries Limited"},
    {"symbol": "ADANIPORTS", "company_name": "Adani Ports & Special Economic Zone Limited"},
    {"symbol": "AXISBANK", "company_name": "Axis Bank Limited"},
    {"symbol": "HINDUNILEVER", "company_name": "Hindustan Unilever Limited"},
    {"symbol": "ONGC", "company_name": "Oil and Natural Gas Corporation Limited"},
    {"symbol": "NTPC", "company_name": "NTPC Limited"},
    {"symbol": "WIPRO", "company_name": "Wipro Limited"}
    ]
    return popular_stocks


