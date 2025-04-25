"""
Stock schemas for request validation and responses
"""
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date
from pydantic import BaseModel, Field, validator

class StockPriceBase(BaseModel):
    """Base stock price model"""
    date: Union[date, str]
    open: float
    high: float
    low: float
    close: float
    volume: int

class StockPriceCreate(StockPriceBase):
    """Stock price creation model"""
    pass

class StockPriceResponse(StockPriceBase):
    """Stock price response model"""
    id: Optional[str] = Field(None, alias="_id")
    symbol: str
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class StockQuoteBase(BaseModel):
    """Base stock quote model"""
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: Optional[int] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None

class StockQuoteCreate(StockQuoteBase):
    """Stock quote creation model"""
    pass

class StockQuoteResponse(StockQuoteBase):
    """Stock quote response model"""
    id: Optional[str] = Field(None, alias="_id")
    timestamp: datetime
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class StockFinancialBase(BaseModel):
    """Base stock financial data model"""
    symbol: str
    company_name: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    eps: Optional[float] = None
    dividend_yield: Optional[float] = None
    revenue: Optional[float] = None
    revenue_growth: Optional[float] = None
    profit_margin: Optional[float] = None
    debt_to_equity: Optional[float] = None
    price_to_book: Optional[float] = None
    rsi: Optional[float] = None
    beta: Optional[float] = None
    fifty_day_ma: Optional[float] = None
    two_hundred_day_ma: Optional[float] = None

class StockFinancialCreate(StockFinancialBase):
    """Stock financial data creation model"""
    pass

class StockFinancialResponse(StockFinancialBase):
    """Stock financial data response model"""
    id: Optional[str] = Field(None, alias="_id")
    timestamp: datetime
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class StockSearchRequest(BaseModel):
    """Stock search request model"""
    query: str = Field(..., min_length=1)

class StockHistoricalRequest(BaseModel):
    """Historical stock data request model"""
    symbol: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    interval: Optional[str] = "1d"  # 1d, 1wk, 1mo

class StockSymbol(BaseModel):
    """Stock symbol model"""
    symbol: str
    company_name: Optional[str] = None
    
class WatchlistRequest(BaseModel):
    """Watchlist update request model"""
    symbols: List[str]

class WatchlistResponse(BaseModel):
    """Watchlist response model"""
    user_id: str
    symbols: List[str]
    updated_at: datetime
    
    class Config:
        orm_mode = True