"""
Database connection utilities for MongoDB
"""
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format=settings.LOG_FORMAT
)
logger = logging.getLogger("database")

# Global database client
db_client = None
db = None

async def connect_and_init_db():
    """Connect to MongoDB and initialize database"""
    global db_client, db
    
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGO_URI}")
        db_client = AsyncIOMotorClient(settings.MONGO_URI)
        
        # Check connection
        await db_client.admin.command('ping')
        logger.info("Connected to MongoDB successfully")
        
        # Set database
        db = db_client[settings.MONGO_DB_NAME]
        
        # Initialize collections and indexes
        await init_indexes()
        
        return db
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def init_indexes():
    """Initialize database indexes"""
    # User collection indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    
    # Stock data indexes
    await db.stock_prices.create_index([("symbol", 1), ("date", -1)])
    
    # News indexes
    await db.news.create_index([("date", -1)])
    await db.news.create_index("symbol")
    
    # Chat history indexes
    await db.chat_history.create_index([("user_id", 1), ("timestamp", -1)])
    
    # Watchlist indexes
    await db.watchlists.create_index("user_id")
    
    logger.info("Database indexes initialized")

async def get_database():
    """Get database instance"""
    if db is None:
        await connect_and_init_db()
    return db

async def close_db_connection():
    """Close database connection"""
    if db_client:
        db_client.close()
        logger.info("MongoDB connection closed")