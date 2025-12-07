"""
Main FastAPI application for Twitter bookmarks management.
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import Optional
import traceback

from app.config import Settings, get_settings
from app.models import get_engine, init_db, get_session, Tweet, SyncState
from app.twitter_client import TwitterClient

app = FastAPI(
    title="Twitter Bookmarks Manager",
    description="FastAPI service to sync Twitter bookmarks to local SQLite database",
    version="1.0.0"
)

# Initialize database on startup
engine = None


@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    global engine
    settings = get_settings()
    engine = get_engine(settings.database_url)
    init_db(engine)


def get_db():
    """Dependency to get database session."""
    db = get_session(engine)
    try:
        yield db
    finally:
        db.close()


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Twitter Bookmarks Manager API",
        "version": "1.0.0",
        "endpoints": {
            "/sync": "POST - Sync bookmarks from Twitter",
            "/health": "GET - Health check",
            "/stats": "GET - Get database statistics"
        }
    }


@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint."""
    try:
        # Check database connection
        sync_state = db.query(SyncState).order_by(desc(SyncState.last_sync_started_at)).first()
        return {
            "status": "healthy",
            "database": "connected",
            "last_sync": sync_state.last_sync_completed_at if sync_state else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@app.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get statistics about stored bookmarks."""
    try:
        total_tweets = db.query(Tweet).filter(Tweet.is_deleted == 0).count()
        read_tweets = db.query(Tweet).filter(Tweet.is_deleted == 0, Tweet.is_read == 1).count()
        unread_tweets = total_tweets - read_tweets
        
        tweets_with_images = db.query(Tweet).filter(
            Tweet.is_deleted == 0, 
            Tweet.has_media_image == 1
        ).count()
        
        tweets_with_videos = db.query(Tweet).filter(
            Tweet.is_deleted == 0,
            Tweet.has_media_video == 1
        ).count()
        
        sync_state = db.query(SyncState).order_by(desc(SyncState.last_sync_started_at)).first()
        
        return {
            "total_bookmarks": total_tweets,
            "read": read_tweets,
            "unread": unread_tweets,
            "with_images": tweets_with_images,
            "with_videos": tweets_with_videos,
            "last_sync_started": sync_state.last_sync_started_at if sync_state else None,
            "last_sync_completed": sync_state.last_sync_completed_at if sync_state else None,
            "last_error": sync_state.last_error if sync_state else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")


@app.post("/sync")
async def sync_bookmarks(
    settings: Settings = Depends(get_settings),
    db: Session = Depends(get_db)
):
    """
    Sync bookmarks from Twitter API to local database.
    
    Returns:
        Sync result with statistics
    """
    sync_start = datetime.now().isoformat()
    
    try:
        latest_synced_bookmark = db.query(Tweet.tweet_id).order_by(desc(Tweet.sync_state_id), (Tweet.inserted_at)).first()

        # Update sync state - started
        sync_state = SyncState()
        db.add(sync_state)
        
        sync_state.last_sync_started_at = sync_start
        sync_state.last_error = None
        db.commit()
        
        # Initialize Twitter client
        client = TwitterClient(settings)
        
        # Sync statistics
        total_fetched = 0
        new_bookmarks = 0
        updated_bookmarks = 0
        pages_fetched = 0
        cursor = None
        
        while True:            
            # Fetch bookmarks page
            response = await client.fetch_bookmarks(cursor=cursor)
            tweets, next_cursor = client.parse_bookmarks_response(response)

            if cursor is not None and next_cursor is not None and str(cursor) == str(next_cursor):
                break

            pages_fetched += 1
            total_fetched += len(tweets)
            
            # Process each tweet
            for tweet_data in tweets:
                if not tweet_data.get("tweet_id"):
                    continue
                
                if latest_synced_bookmark and tweet_data["tweet_id"] == latest_synced_bookmark[0]:
                    next_cursor = None
                    break  # Stop if we reached already synced bookmark

                # Check if tweet already exists
                existing_tweet = db.query(Tweet).filter_by(
                    tweet_id=tweet_data["tweet_id"]
                ).first()
                
                current_time = datetime.now().isoformat()
                
                if existing_tweet:
                    # Update existing tweet
                    existing_tweet.text = tweet_data.get("text", "")
                    existing_tweet.source_json = tweet_data.get("source_json")
                    existing_tweet.updated_at = current_time
                    existing_tweet.is_deleted = 0  # Mark as not deleted if re-bookmarked
                    existing_tweet.sync_state_id = sync_state.id
                    updated_bookmarks += 1
                else:
                    # Insert new tweet
                    new_tweet = Tweet(
                        tweet_id=tweet_data["tweet_id"],
                        text=tweet_data.get("text", ""),
                        author_id=tweet_data.get("author_id"),
                        author_username=tweet_data.get("author_username"),
                        created_at=tweet_data.get("created_at", current_time),
                        bookmarked_at=current_time,
                        has_media_image=tweet_data.get("has_media_image", 0),
                        has_media_video=tweet_data.get("has_media_video", 0),
                        url=tweet_data.get("url"),
                        source_json=tweet_data.get("source_json"),
                        inserted_at=current_time,
                        updated_at=current_time,
                        sync_state_id=sync_state.id
                    )
                    db.add(new_tweet)
                    new_bookmarks += 1
            
            # Commit after each page
            db.commit()
            
            # Update cursor in sync state
            sync_state.page_cursor = next_cursor
            db.commit()
            
            # Check if there are more pages
            if not next_cursor:
                break
            
            cursor = next_cursor
        
        # Update sync state - completed
        sync_end = datetime.now().isoformat()
        sync_state.last_sync_completed_at = sync_end
        sync_state.page_cursor = cursor  # Set cursor after successful complete sync
        sync_state.bookmarks_added = new_bookmarks
        sync_state.bookmarks_updated = updated_bookmarks
        db.commit()
        
        return {
            "status": "success",
            "sync_started_at": sync_start,
            "sync_completed_at": sync_end,
            "pages_fetched": pages_fetched,
            "total_fetched": total_fetched,
            "new_bookmarks": new_bookmarks,
            "updated_bookmarks": updated_bookmarks
        }
    
    except Exception as e:
        # Log error to sync state
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        sync_state = db.query(SyncState).order_by(desc(SyncState.last_sync_started_at)).first()
        if sync_state:
            sync_state.last_error = error_msg[:1000]  # Limit error message length
            db.commit()
        
        raise HTTPException(
            status_code=500,
            detail=f"Sync failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
