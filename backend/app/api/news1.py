from uuid import uuid4
from fastapi import FastAPI, APIRouter, Query
from typing import Optional
import feedparser
from newspaper import Article
#from newspaper4k import Article

app = FastAPI()

# Create router

# Utility function to fetch news
def fetch_news(feed_url: str, limit: int = 10):
    feed = feedparser.parse(feed_url)
    news_items = []

    for entry in feed.entries[:limit]:
        thumbnail = None
        try:
            article = Article(entry.link)
            article.download()
            article.parse()
            thumbnail = article.top_image
        except Exception:
            thumbnail = None
        news_items.append({
            "title": entry.title,
            "link": entry.link,
            "published": entry.get("published", "N/A"),
            "thumbnail":thumbnail

        })

    return {
        "feed_title": feed.feed.get("title", "No Title"),
        "news": news_items
    }

# Optional: Predefined RSS sources
PREDEFINED_FEEDS = {
    "Verge":"https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664"
    # "TOI":"https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    # "cnbc":"https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=21324812"
}

# Endpoint to fetch news from any RSS feed URL
def get_all_news(limit: Optional[int] = 10):
    all_news = {}
    print("entered")
    for source, url in PREDEFINED_FEEDS.items():
        try:
            all_news[source] = fetch_news(url, limit)
        except Exception as e:
            all_news[source] = {"error": str(e)}

    flat_news = []
    for source_key, source_info in all_news.items():
        for item in source_info["news"]:
            flat_news.append({
                "_id": str(uuid4()),  # Unique ID for React key
                "image": item.get("thumbnail"),
                "headline": item.get("title"),
                "date": item.get("published"),
                "summary": None,  # if you don't have it, keep optional
                "url": item.get("link"),
                "source": source_info.get("feed_title", source_key),
            })

    return flat_news
    return all_news

# Endpoint to fetch news from predefined sources
def get_news_by_source(source_name: str, limit: Optional[int] = 5):
    url = PREDEFINED_FEEDS.get(source_name.lower())
    if not url:
        return {"error": "Invalid source name"}

    try:
        return fetch_news(url, limit)
    except Exception as e:
        return {"error": str(e)}

# Include the router in the app
