"""
Utility helper functions for the application
"""
import functools
import logging
import time
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional, Tuple, Union

# Configure logging
logger = logging.getLogger("helpers")

# In-memory cache for function results
_cache = {}

def cache_with_timeout(timeout_seconds: int = 3600):
    """
    Decorator for caching function results with a timeout
    
    Args:
        timeout_seconds: Cache timeout in seconds (default: 1 hour)
    
    Returns:
        Decorated function
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Create cache key based on function name and arguments
            key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Check if result is in cache and not expired
            if key in _cache:
                result, timestamp = _cache[key]
                if (datetime.utcnow() - timestamp).total_seconds() < timeout_seconds:
                    logger.info(f"Cache hit for {key}")
                    return result
            
            # Call function and cache result
            result = await func(*args, **kwargs)
            _cache[key] = (result, datetime.utcnow())
            
            return result
        
        return wrapper
    
    return decorator

def clear_cache():
    """Clear the entire cache"""
    global _cache
    _cache = {}
    logger.info("Cache cleared")

def format_currency(amount: float, currency: str = "USD") -> str:
    """
    Format amount as currency string
    
    Args:
        amount: Amount to format
        currency: Currency code (default: USD)
        
    Returns:
        Formatted currency string
    """
    if currency == "USD":
        return f"${amount:,.2f}"
    return f"{amount:,.2f} {currency}"

def format_large_number(num: float) -> str:
    """
    Format large numbers with K, M, B, T suffixes
    
    Args:
        num: Number to format
        
    Returns:
        Formatted number string
    """
    if num is None:
        return "N/A"
    
    if num >= 1e12:
        return f"{num / 1e12:.2f}T"
    if num >= 1e9:
        return f"{num / 1e9:.2f}B"
    if num >= 1e6:
        return f"{num / 1e6:.2f}M"
    if num >= 1e3:
        return f"{num / 1e3:.2f}K"
    
    return f"{num:.2f}"

def format_percent(value: float) -> str:
    """
    Format value as percentage
    
    Args:
        value: Value to format (decimal form)
        
    Returns:
        Formatted percentage string
    """
    if value is None:
        return "N/A"
    
    return f"{value * 100:.2f}%"

def parse_date_string(date_str: str) -> Optional[datetime]:
    """
    Parse date string into datetime object
    
    Args:
        date_str: Date string
        
    Returns:
        Datetime object or None if invalid format
    """
    formats = [
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%m/%d/%Y",
        "%d/%m/%Y",
        "%b %d, %Y",
        "%B %d, %Y",
        "%d %b %Y",
        "%d %B %Y"
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    
    return None

def timeit(func):
    """
    Decorator to measure function execution time
    
    Args:
        func: Function to time
        
    Returns:
        Decorated function
    """
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        end_time = time.time()
        
        execution_time = end_time - start_time
        logger.info(f"Function {func.__name__} executed in {execution_time:.4f} seconds")
        
        return result
    
    return wrapper

def sanitize_input(text: str) -> str:
    """
    Sanitize input text to prevent injection attacks
    
    Args:
        text: Input text
        
    Returns:
        Sanitized text
    """
    # Replace potentially dangerous characters
    replacements = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
    }
    
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    
    return text

def extract_stock_symbols(text: str) -> List[str]:
    """
    Extract stock symbols from text
    
    Args:
        text: Input text
        
    Returns:
        List of stock symbols
    """
    import re
    
    # Pattern to match stock symbols (uppercase letters, 1-5 characters)
    pattern = r'\b([A-Z]{1,5})\b'
    
    # Find all matches
    matches = re.findall(pattern, text)
    
    # Filter out common English words that might be mistaken as symbols
    common_words = {
        "A", "I", "AM", "PM", "AN", "BY", "GO", "IF", "IS", "IT", "ME", "NO", 
        "OF", "ON", "OR", "SO", "TO", "UP", "US", "WE", "AT"
    }
    
    return [symbol for symbol in matches if symbol not in common_words]