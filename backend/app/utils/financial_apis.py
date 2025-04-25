"""
Utilities for interacting with financial data APIs
"""
import os
import time
import logging
import requests
import pandas as pd
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import threading
from collections import deque

from app.core.config import settings

# Configure logging
logger = logging.getLogger("financial_apis")

class FinancialDataService:
    """Service for fetching financial data from various APIs"""
    
    def __init__(self):
        """Initialize with API keys"""
        self.fmp_api_key = settings.FMP_API_KEY
        self.finnhub_api_key = settings.FINNHUB_API_KEY
        
        # API base URLs
        self.fmp_base_url = "https://financialmodelingprep.com/api/v3"
        self.finnhub_base_url = "https://finnhub.io/api/v1"
        
        # For improved rate limiting
        self.rate_limits = {
            "fmp": {"requests_per_minute": 30, "bucket_size": 60},
            "finnhub": {"requests_per_minute": 30, "bucket_size": 60}
        }
        
        # Track request timestamps with thread safety
        self.request_history = {
            "fmp": deque(maxlen=self.rate_limits["fmp"]["requests_per_minute"]),
            "finnhub": deque(maxlen=self.rate_limits["finnhub"]["requests_per_minute"])
        }
        
        self.locks = {
            "fmp": threading.Lock(),
            "finnhub": threading.Lock()
        }
    
    def _handle_rate_limit(self, api_type: str):
        """
        Handle rate limiting for APIs using token bucket algorithm
        """
        with self.locks[api_type]:
            current_time = time.time()
            
            # Remove timestamps older than the bucket window
            bucket_size = self.rate_limits[api_type]["bucket_size"]
            while self.request_history[api_type] and current_time - self.request_history[api_type][0] > bucket_size:
                self.request_history[api_type].popleft()
            
            # Calculate wait time if we've reached the limit
            if len(self.request_history[api_type]) >= self.rate_limits[api_type]["requests_per_minute"]:
                # Wait until the oldest request expires from the bucket
                wait_time = self.request_history[api_type][0] + bucket_size - current_time
                if wait_time > 0:
                    logger.info(f"Rate limit reached for {api_type}, waiting {wait_time:.2f} seconds")
                    time.sleep(wait_time)
            
            # Record this request
            self.request_history[api_type].append(time.time())
    
    def _api_request_with_retry(self, url, params, api_type, max_retries=3, initial_backoff=1):
        """
        Make API request with exponential backoff retry mechanism
        """
        retries = 0
        backoff = initial_backoff
        
        while retries <= max_retries:
            try:
                # Apply rate limiting before making the request
                self._handle_rate_limit(api_type)
                
                response = requests.get(url, params=params, timeout=10)
                
                if response.status_code == 429:
                    # Rate limit hit, retry with exponential backoff
                    retries += 1
                    sleep_time = backoff * (2 ** retries)
                    logger.warning(f"Rate limit hit, retrying in {sleep_time} seconds")
                    time.sleep(sleep_time)
                    continue
                
                return response
                
            except Exception as e:
                logger.error(f"Error in API request: {e}")
                retries += 1
                
                if retries <= max_retries:
                    sleep_time = backoff * (2 ** retries)
                    time.sleep(sleep_time)
                else:
                    break
        
        return None  # All retries failed
    
    def get_stock_quote(self, symbol: str) -> Optional[Dict]:
        """
        Get real-time stock quote from FMP API
        
        Args:
            symbol: Stock symbol
            
        Returns:
            Stock quote data or None if error
        """
        endpoint = f"{self.fmp_base_url}/quote/{symbol}"
        params = {"apikey": self.fmp_api_key}
        
        response = self._api_request_with_retry(endpoint, params, "fmp")
        
        if response and response.status_code == 200:
            data = response.json()
            if data and isinstance(data, list) and len(data) > 0:
                # Transform to match our schema
                quote = data[0]
                return {
                    "symbol": quote.get("symbol"),
                    "price": quote.get("price"),
                    "change": quote.get("change"),
                    "change_percent": quote.get("changesPercentage"),
                    "volume": quote.get("volume"),
                    "market_cap": quote.get("marketCap"),
                    "pe_ratio": quote.get("pe")
                }
        
        if response:
            logger.error(f"Error fetching quote for {symbol}: {response.status_code}")
        else:
            logger.error(f"Failed to fetch quote for {symbol} after retries")
        
        return None
    
    def get_stock_quotes(self, symbols: List[str]) -> Dict[str, Dict]:
        """
        Get real-time stock quotes for multiple symbols
        
        Args:
            symbols: List of stock symbols
            
        Returns:
            Dictionary of quotes keyed by symbol
        """
        # Process all symbols in a single batch where possible
        # Only split if the number of symbols is very large
        results = {}
        
        # Process in batches of 10 (increased from 5)
        for i in range(0, len(symbols), 10):
            batch = symbols[i:i+10]
            symbols_str = ",".join(batch)
            
            endpoint = f"{self.fmp_base_url}/quote/{symbols_str}"
            params = {"apikey": self.fmp_api_key}
            
            response = self._api_request_with_retry(endpoint, params, "fmp")
            
            if response and response.status_code == 200:
                quotes = response.json()
                
                # Process each quote
                for quote in quotes:
                    if not quote or "symbol" not in quote:
                        continue
                    
                    symbol = quote.get("symbol")
                    results[symbol] = {
                        "symbol": symbol,
                        "price": quote.get("price"),
                        "change": quote.get("change"),
                        "change_percent": quote.get("changesPercentage"),
                        "volume": quote.get("volume"),
                        "market_cap": quote.get("marketCap"),
                        "pe_ratio": quote.get("pe")
                    }
            
            elif response:
                logger.error(f"Error fetching quotes batch: {response.status_code}")
            else:
                logger.error(f"Failed to fetch quotes batch after retries")
        
        return results
    
    def get_historical_prices(self, symbol: str, from_date=None, to_date=None) -> List[Dict]:
        """
        Get historical stock prices from FMP API
        
        Args:
            symbol: Stock symbol
            from_date: Start date (optional)
            to_date: End date (optional)
            
        Returns:
            List of historical price data
        """
        endpoint = f"{self.fmp_base_url}/historical-price-full/{symbol}"
        params = {"apikey": self.fmp_api_key}
        
        if from_date:
            params["from"] = from_date.strftime("%Y-%m-%d")
        if to_date:
            params["to"] = to_date.strftime("%Y-%m-%d")
        
        response = self._api_request_with_retry(endpoint, params, "fmp")
        
        if response and response.status_code == 200:
            data = response.json()
            
            if not data or "historical" not in data:
                logger.warning(f"No historical data returned for {symbol}")
                return []
            
            # Transform to match our schema
            historical_data = []
            for item in data["historical"]:
                historical_data.append({
                    "date": item.get("date"),
                    "open": item.get("open"),
                    "high": item.get("high"),
                    "low": item.get("low"),
                    "close": item.get("close"),
                    "volume": item.get("volume")
                })
            
            return historical_data
        
        if response:
            logger.error(f"Error fetching historical prices: {response.status_code}")
        else:
            logger.error(f"Failed to fetch historical prices after retries")
        
        return []
    
    def get_company_profile(self, symbol: str) -> Optional[Dict]:
        """
        Get company profile from FMP API
        
        Args:
            symbol: Stock symbol
            
        Returns:
            Company profile data or None if error
        """
        endpoint = f"{self.fmp_base_url}/profile/{symbol}"
        params = {"apikey": self.fmp_api_key}
        
        response = self._api_request_with_retry(endpoint, params, "fmp")
        
        if response and response.status_code == 200:
            data = response.json()
            
            if data and isinstance(data, list) and len(data) > 0:
                return data[0]
        
        if response:
            logger.error(f"Error fetching company profile: {response.status_code}")
        else:
            logger.error(f"Failed to fetch company profile after retries")
        
        return None
    
    def get_company_news(self, symbol: str, from_date=None, to_date=None) -> List[Dict]:
        """
        Get company news from Finnhub API
        
        Args:
            symbol: Stock symbol
            from_date: Start date (default: 7 days ago)
            to_date: End date (default: today)
            
        Returns:
            List of news articles
        """
        # Default dates
        if not from_date:
            from_date = datetime.now() - timedelta(days=7)
        if not to_date:
            to_date = datetime.now()
        
        # Format dates for API
        from_str = from_date.strftime("%Y-%m-%d")
        to_str = to_date.strftime("%Y-%m-%d")
        
        endpoint = f"{self.finnhub_base_url}/company-news"
        params = {
            "symbol": symbol,
            "from": from_str,
            "to": to_str,
            "token": self.finnhub_api_key
        }
        
        response = self._api_request_with_retry(endpoint, params, "finnhub")
        
        if response and response.status_code == 200:
            news = response.json()
            
            # Process and return first 20 news items
            processed_news = []
            for item in news[:20]:
                processed_news.append({
                    "datetime": datetime.fromtimestamp(item.get("datetime", 0)),
                    "headline": item.get("headline", ""),
                    "summary": item.get("summary", ""),
                    "source": item.get("source", ""),
                    "url": item.get("url", ""),
                    "image": item.get("image", ""),
                    "symbol": symbol
                })
            
            return processed_news
        
        if response:
            logger.error(f"Error fetching company news: {response.status_code}")
        else:
            logger.error(f"Failed to fetch company news after retries")
        
        return []
    
    def get_financials(self, symbol: str) -> Optional[Dict]:
        """
        Get company financials from Finnhub API
        
        Args:
            symbol: Stock symbol
            
        Returns:
            Financial metrics or None if error
        """
        endpoint = f"{self.finnhub_base_url}/stock/metric"
        params = {
            "symbol": symbol,
            "metric": "all",
            "token": self.finnhub_api_key
        }
        
        response = self._api_request_with_retry(endpoint, params, "finnhub")
        
        if response and response.status_code == 200:
            data = response.json()
            
            if data and "metric" in data:
                # Get company name
                company_profile = self.get_company_profile(symbol)
                company_name = company_profile.get("companyName", symbol) if company_profile else symbol
                
                metrics = data["metric"]
                
                # Transform to match our schema
                return {
                    "symbol": symbol,
                    "company_name": company_name,
                    "sector": company_profile.get("sector") if company_profile else None,
                    "industry": company_profile.get("industry") if company_profile else None,
                    "market_cap": metrics.get("marketCapitalization"),
                    "pe_ratio": metrics.get("pe"),
                    "eps": metrics.get("epsBasicExclExtraItemsTTM"),
                    "dividend_yield": metrics.get("dividendYieldIndicatedAnnual"),
                    "revenue": metrics.get("revenuePerShareTTM"),
                    "revenue_growth": metrics.get("revenueGrowthTTM"),
                    "profit_margin": metrics.get("netProfitMarginTTM"),
                    "debt_to_equity": metrics.get("totalDebt/totalEquityAnnual"),
                    "price_to_book": metrics.get("priceToBookMRQ"),
                    "rsi": metrics.get("rsi14"),
                    "beta": metrics.get("beta"),
                    "fifty_day_ma": metrics.get("day50MovingAvg"),
                    "two_hundred_day_ma": metrics.get("day200MovingAvg")
                }
        
        if response:
            logger.error(f"Error fetching financials: {response.status_code}")
        else:
            logger.error(f"Failed to fetch financials after retries")
        
        return None
    
    def search_stocks(self, query: str) -> List[Dict]:
        """
        Search for stocks by name or symbol
        
        Args:
            query: Search query
            
        Returns:
            List of matching stocks
        """
        endpoint = f"{self.fmp_base_url}/search"
        params = {
            "query": query,
            "limit": 10,
            "apikey": self.fmp_api_key
        }
        
        response = self._api_request_with_retry(endpoint, params, "fmp")
        
        if response and response.status_code == 200:
            results = response.json()
            
            # Transform results
            stocks = []
            for item in results:
                stocks.append({
                    "symbol": item.get("symbol"),
                    "company_name": item.get("name")
                })
            
            return stocks
        
        if response:
            logger.error(f"Error searching stocks: {response.status_code}")
        else:
            logger.error(f"Failed to search stocks after retries")
        
        return []
    
    def batch_get_quotes(self, symbols: List[str]) -> Dict[str, Dict]:
        """
        Get quotes for multiple symbols using batch API
        This method should be preferred over individual quote requests
        
        Args:
            symbols: List of stock symbols
            
        Returns:
            Dictionary of quotes keyed by symbol
        """
        # We're already using batch API in get_stock_quotes, but making an explicit
        # method to encourage its use
        return self.get_stock_quotes(symbols)

# Create an instance for use by the API
financial_data_service = FinancialDataService()