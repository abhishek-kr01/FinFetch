"""
Chatbot service for financial AI assistant
"""
import logging
import json
import google.generativeai as genai
from typing import Dict, List, Optional, Any
from app.core.config import settings
from app.utils.financial_apis import financial_data_service

# Configure logging
logger = logging.getLogger("chatbot_service")

# Initialize Gemini AI
genai.configure(api_key=settings.GEMINI_API_KEY)

class FinancialChatbotService:
    """Financial chatbot service using Google's Gemini API"""
    
    def __init__(self):
        """Initialize the chatbot service"""
        # Configure the model
        self.generation_config = {
            "temperature": 0.2,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        # Initialize the model
        try:
            # Try the latest model first (gemini-1.5-pro)
            self.model = genai.GenerativeModel(
                model_name="gemini-1.5-pro",
                generation_config=self.generation_config
            )
        except Exception as e:
            logger.warning(f"Failed to initialize gemini-1.5-pro: {e}")
            try:
                # Fall back to gemini-1.0-pro if 1.5 is not available
                self.model = genai.GenerativeModel(
                    model_name="gemini-1.0-pro",
                    generation_config=self.generation_config
                )
            except Exception as e:
                logger.warning(f"Failed to initialize gemini-1.0-pro: {e}")
                # Fall back to the original model
                self.model = genai.GenerativeModel(
                    model_name="gemini-pro",
                    generation_config=self.generation_config
                )
    
    async def get_stock_data_context(self, symbol: str) -> str:
        """
        Get stock data to provide as context for the chatbot
        
        Args:
            symbol: Stock symbol
            
        Returns:
            Context string with stock data
        """
        try:
            # Get quote data
            quote = financial_data_service.get_stock_quote(symbol)
            
            # Get company profile
            profile = financial_data_service.get_company_profile(symbol)
            
            # Get financial metrics
            financials = financial_data_service.get_financials(symbol)
            
            # Combine data into context string
            context = f"Stock Information for {symbol}:\n"
            
            if quote:
                context += f"Current Price: ${quote.get('price', 'N/A')}\n"
                context += f"Change: {quote.get('change', 'N/A')} ({quote.get('change_percent', 'N/A')}%)\n"
                context += f"Volume: {quote.get('volume', 'N/A')}\n"
            
            if profile:
                context += f"Company: {profile.get('companyName', 'N/A')}\n"
                context += f"Sector: {profile.get('sector', 'N/A')}\n"
                context += f"Industry: {profile.get('industry', 'N/A')}\n"
                context += f"Description: {profile.get('description', 'N/A')}\n"
            
            if financials:
                context += f"Market Cap: ${financials.get('market_cap', 'N/A')} billion\n"
                context += f"P/E Ratio: {financials.get('pe_ratio', 'N/A')}\n"
                context += f"EPS: ${financials.get('eps', 'N/A')}\n"
                context += f"Dividend Yield: {financials.get('dividend_yield', 'N/A')}%\n"
                context += f"52-Week Range: ${financials.get('52_week_low', 'N/A')} - ${financials.get('52_week_high', 'N/A')}\n"
            
            return context
        
        except Exception as e:
            logger.error(f"Error getting stock data context: {e}")
            return f"Sorry, I couldn't retrieve the latest data for {symbol}."
    
    async def process_message(self, user_message: str, context: Optional[Dict[str, Any]] = None) -> Dict:
        """
        Process a user message and generate a response
        
        Args:
            user_message: User's message
            context: Additional context (optional)
            
        Returns:
            Response object with message and context
        """
        # Extract stock symbols from message or context
        symbols = []
        if context and "symbols" in context:
            symbols = context["symbols"]
        
        # Build context for AI
        prompt_context = ""
        
        # Add stock data to context if symbols are present
        if symbols and len(symbols) > 0:
            for symbol in symbols[:3]:  # Limit to 3 symbols to avoid too much context
                stock_context = await self.get_stock_data_context(symbol)
                prompt_context += f"\n{stock_context}\n"
        
        # Build system prompt
        system_prompt = """
        You are a professional financial assistant with expertise in stocks, investing, and financial markets.
        Provide accurate, concise, and helpful answers to financial questions. When discussing stocks or
        financial data, reference the provided context if available. If you're not sure about specific data
        points, acknowledge that and provide general information.
        
        Use these guidelines:
        - Give balanced, objective financial information without making specific investment recommendations
        - Explain concepts clearly for users of different financial literacy levels
        - When appropriate, mention key factors that might influence financial decisions
        - If asked about the future performance of specific stocks, explain that you cannot predict the market
        - Be concise but thorough in your explanations
        - If you don't know something, be honest about your limitations
        """
        
        # Combine user message, context, and system prompt
        full_prompt = f"{system_prompt}\n\n"
        
        if prompt_context:
            full_prompt += f"Context Information:\n{prompt_context}\n\n"
        
        full_prompt += f"User Question: {user_message}"
        
        try:
            # Generate response from Gemini
            response = self.model.generate_content(full_prompt)
            
            # Extract response text
            response_text = response.text
            
            # Update context
            new_context = context.copy() if context else {}
            new_context["last_question"] = user_message
            
            return {
                "message": response_text,
                "context": new_context
            }
        
        except Exception as e:
            logger.error(f"Error processing message with AI: {e}")
            return {
                "message": "I'm having trouble processing your request right now. Please try again later.",
                "context": context
            }

# Create an instance for use by the API
chatbot_service = FinancialChatbotService()