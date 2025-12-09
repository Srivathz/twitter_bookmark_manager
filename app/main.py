"""
Main FastAPI application for Twitter bookmarks management.
"""
from datetime import datetime
from typing import List, Optional

import traceback
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.models import (
    Category,
    SyncState,
    Tweet,
    TweetCategory,
    get_engine,
    get_session,
    init_db,
)
from app.twitter_client import TwitterClient


# ============================================================================
# FastAPI Application Setup
# ============================================================================

app = FastAPI(
    title="Twitter Bookmarks Manager",
    description="FastAPI service to sync Twitter bookmarks to local SQLite database",
    version="1.0.0",
)

engine = None


# ============================================================================
# Pydantic Models
# ============================================================================

class CategoryCreate(BaseModel):
    """Request model for creating a category."""

    name: str = Field(..., min_length=1, max_length=120, description="Category name")
    description: Optional[str] = Field(None, description="Optional category description")


class CategoryResponse(BaseModel):
    """Response model for category data."""

    id: int
    name: str
    description: Optional[str]
    created_at: str
    updated_at: str
    is_deleted: bool

    class Config:
        from_attributes = True


class BookmarkUpdate(BaseModel):
    """Request model for updating a bookmark."""

    is_read: Optional[bool] = Field(None, description="Toggle read/unread status")
    add_categories: Optional[List[int]] = Field(
        None, description="List of category IDs to add"
    )
    remove_categories: Optional[List[int]] = Field(
        None, description="List of category IDs to remove"
    )


# ============================================================================
# Database Dependencies
# ============================================================================

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


# ============================================================================
# Helper Functions - Bookmarks
# ============================================================================

def _format_bookmark_response(bookmark: Tweet) -> dict:
    """Format a bookmark object for API response."""
    return {
        "id": bookmark.id,
        "tweet_id": bookmark.tweet_id,
        "text": bookmark.text,
        "author_id": bookmark.author_id,
        "author_username": bookmark.author_username,
        "created_at": bookmark.created_at,
        "bookmarked_at": bookmark.bookmarked_at,
        "is_read": bool(bookmark.is_read),
        "has_media_image": bool(bookmark.has_media_image),
        "has_media_video": bool(bookmark.has_media_video),
        "url": bookmark.url,
        "inserted_at": bookmark.inserted_at,
        "updated_at": bookmark.updated_at,
    }


def _get_bookmark_categories(db: Session, bookmark_id: int) -> List[dict]:
    """Get all categories assigned to a bookmark."""
    category_ids = (
        db.query(TweetCategory.category_id)
        .filter(TweetCategory.tweet_id == bookmark_id)
        .all()
    )

    if not category_ids:
        return []

    categories = (
        db.query(Category)
        .filter(
            Category.id.in_([c[0] for c in category_ids]),
            Category.is_deleted == 0,
        )
        .all()
    )

    return [
        {"id": cat.id, "name": cat.name, "description": cat.description}
        for cat in categories
    ]


def _update_bookmark_read_status(
    bookmark: Tweet, is_read: bool, current_time: str
) -> str:
    """Update bookmark read status."""
    bookmark.is_read = 1 if is_read else 0
    bookmark.updated_at = current_time
    return f"is_read={'true' if is_read else 'false'}"


def _add_category_to_bookmark(
    db: Session, bookmark_id: int, category_id: int, current_time: str
) -> tuple[str, str]:
    """Add a category to a bookmark. Returns (category_name, update_message)."""
    # Verify category exists and is not deleted
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.is_deleted == 0)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404, detail=f"Category with id {category_id} not found"
        )

    # Check if assignment already exists
    existing = (
        db.query(TweetCategory)
        .filter(
            TweetCategory.tweet_id == bookmark_id,
            TweetCategory.category_id == category_id,
        )
        .first()
    )

    if not existing:
        tweet_category = TweetCategory(
            tweet_id=bookmark_id,
            category_id=category_id,
            added_at=current_time,
        )
        db.add(tweet_category)
        return category.name, f"added category '{category.name}'"

    return "", ""


def _remove_category_from_bookmark(
    db: Session, bookmark_id: int, category_id: int
) -> tuple[str, str]:
    """Remove a category from a bookmark. Returns (category_name, update_message)."""
    assignment = (
        db.query(TweetCategory)
        .filter(
            TweetCategory.tweet_id == bookmark_id,
            TweetCategory.category_id == category_id,
        )
        .first()
    )

    if assignment:
        category = db.query(Category).filter(Category.id == category_id).first()
        db.delete(assignment)
        category_name = category.name if category else str(category_id)
        return category_name, f"removed category '{category_name}'"

    return "", ""


# ============================================================================
# Helper Functions - Categories
# ============================================================================

def _validate_category_name(name: str) -> None:
    """Validate category name length."""
    if len(name.strip()) == 0:
        raise HTTPException(status_code=400, detail="Category name cannot be empty")

    if len(name) > 120:
        raise HTTPException(
            status_code=400, detail="Category name cannot exceed 120 characters"
        )


def _check_category_exists(db: Session, name: str) -> None:
    """Check if a category with the given name already exists."""
    existing_category = (
        db.query(Category)
        .filter(Category.name == name.strip(), Category.is_deleted == 0)
        .first()
    )

    if existing_category:
        raise HTTPException(
            status_code=409, detail=f"Category with name '{name}' already exists"
        )


def _format_category_response(category: Category) -> dict:
    """Format a category object for API response."""
    return {
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "created_at": category.created_at,
        "updated_at": category.updated_at,
        "is_deleted": bool(category.is_deleted),
    }


# ============================================================================
# Helper Functions - Sync
# ============================================================================

def _process_tweet_data(
    db: Session,
    tweet_data: dict,
    sync_state_id: int,
    current_time: str,
) -> tuple[int, int]:
    """
    Process a single tweet (insert or update).
    Returns (new_count, updated_count).
    """
    if not tweet_data.get("tweet_id"):
        return 0, 0

    existing_tweet = (
        db.query(Tweet).filter_by(tweet_id=tweet_data["tweet_id"]).first()
    )

    if existing_tweet:
        # Update existing tweet
        existing_tweet.text = tweet_data.get("text", "")
        existing_tweet.source_json = tweet_data.get("source_json")
        existing_tweet.updated_at = current_time
        existing_tweet.is_deleted = 0
        existing_tweet.sync_state_id = sync_state_id
        return 0, 1
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
            sync_state_id=sync_state_id,
        )
        db.add(new_tweet)
        return 1, 0


def _handle_sync_error(db: Session, error: Exception) -> None:
    """Log sync error to database."""
    error_msg = f"{str(error)}\n{traceback.format_exc()}"
    sync_state = (
        db.query(SyncState)
        .order_by(desc(SyncState.last_sync_started_at))
        .first()
    )
    if sync_state:
        sync_state.last_error = error_msg[:1000]
        db.commit()


# ============================================================================
# API Endpoints - Core
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Twitter Bookmarks Manager API",
        "version": "1.0.0",
        "endpoints": {
            "/sync": "POST - Sync bookmarks from Twitter",
            "/health": "GET - Health check",
            "/stats": "GET - Get database statistics",
            "/bookmarks": "GET - List all bookmarks (sorted by created_at desc)",
            "/bookmarks/{id}": "PATCH - Update bookmark (toggle read/unread, manage categories)",
            "/categories": "GET - List all categories, POST - Create a new category",
            "/categories/{id}": "DELETE - Mark a category as deleted",
        },
    }


@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint."""
    try:
        sync_state = (
            db.query(SyncState)
            .order_by(desc(SyncState.last_sync_started_at))
            .first()
        )
        return {
            "status": "healthy",
            "database": "connected",
            "last_sync": sync_state.last_sync_completed_at if sync_state else None,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@app.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get statistics about stored bookmarks."""
    try:
        total_tweets = db.query(Tweet).filter(Tweet.is_deleted == 0).count()
        read_tweets = (
            db.query(Tweet).filter(Tweet.is_deleted == 0, Tweet.is_read == 1).count()
        )
        unread_tweets = total_tweets - read_tweets

        tweets_with_images = (
            db.query(Tweet)
            .filter(Tweet.is_deleted == 0, Tweet.has_media_image == 1)
            .count()
        )

        tweets_with_videos = (
            db.query(Tweet)
            .filter(Tweet.is_deleted == 0, Tweet.has_media_video == 1)
            .count()
        )

        sync_state = (
            db.query(SyncState)
            .order_by(desc(SyncState.last_sync_started_at))
            .first()
        )

        return {
            "total_bookmarks": total_tweets,
            "read": read_tweets,
            "unread": unread_tweets,
            "with_images": tweets_with_images,
            "with_videos": tweets_with_videos,
            "last_sync_started": sync_state.last_sync_started_at if sync_state else None,
            "last_sync_completed": sync_state.last_sync_completed_at if sync_state else None,
            "last_error": sync_state.last_error if sync_state else None,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")


# ============================================================================
# API Endpoints - Bookmarks
# ============================================================================

@app.get("/bookmarks")
async def list_bookmarks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    List all bookmarks sorted by created_at descending.

    Args:
        skip: Number of records to skip (default: 0)
        limit: Maximum number of records to return (default: 100, max: 1000)

    Returns:
        List of bookmarks with metadata
    """
    try:
        # Validate and cap limit
        limit = min(limit, 1000)

        # Query bookmarks sorted by created_at descending
        bookmarks = (
            db.query(Tweet)
            .filter(Tweet.is_deleted == 0)
            .order_by(desc(Tweet.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

        # Get total count for pagination info
        total_count = db.query(Tweet).filter(Tweet.is_deleted == 0).count()

        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "count": len(bookmarks),
            "bookmarks": [_format_bookmark_response(b) for b in bookmarks],
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to list bookmarks: {str(e)}"
        )


@app.patch("/bookmarks/{bookmark_id}")
async def update_bookmark(
    bookmark_id: int,
    update_data: BookmarkUpdate,
    db: Session = Depends(get_db),
):
    """
    Update a bookmark: toggle read/unread status and manage category assignments.

    Args:
        bookmark_id: ID of the bookmark to update
        update_data: Update data (is_read, add_categories, remove_categories)

    Returns:
        Updated bookmark with current categories
    """
    try:
        # Find bookmark
        bookmark = (
            db.query(Tweet)
            .filter(Tweet.id == bookmark_id, Tweet.is_deleted == 0)
            .first()
        )

        if not bookmark:
            raise HTTPException(
                status_code=404, detail=f"Bookmark with id {bookmark_id} not found"
            )

        current_time = datetime.now().isoformat()
        updated_fields = []
        added_categories = []
        removed_categories = []

        # Update read status if provided
        if update_data.is_read is not None:
            field_msg = _update_bookmark_read_status(
                bookmark, update_data.is_read, current_time
            )
            updated_fields.append(field_msg)

        # Add categories
        if update_data.add_categories:
            for category_id in update_data.add_categories:
                cat_name, field_msg = _add_category_to_bookmark(
                    db, bookmark_id, category_id, current_time
                )
                if cat_name:
                    added_categories.append(cat_name)
                    updated_fields.append(field_msg)

        # Remove categories
        if update_data.remove_categories:
            for category_id in update_data.remove_categories:
                cat_name, field_msg = _remove_category_from_bookmark(
                    db, bookmark_id, category_id
                )
                if cat_name:
                    removed_categories.append(cat_name)
                    updated_fields.append(field_msg)

        # Commit all changes
        db.commit()
        db.refresh(bookmark)

        # Get current categories
        current_categories = _get_bookmark_categories(db, bookmark_id)

        return {
            "status": "success",
            "message": (
                f"Bookmark updated: {', '.join(updated_fields)}"
                if updated_fields
                else "No changes made"
            ),
            "bookmark": {
                "id": bookmark.id,
                "tweet_id": bookmark.tweet_id,
                "text": bookmark.text,
                "author_username": bookmark.author_username,
                "is_read": bool(bookmark.is_read),
                "url": bookmark.url,
                "updated_at": bookmark.updated_at,
                "categories": current_categories,
            },
            "changes": {
                "read_status_changed": update_data.is_read is not None,
                "categories_added": added_categories,
                "categories_removed": removed_categories,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to update bookmark: {str(e)}"
        )


# ============================================================================
# API Endpoints - Categories
# ============================================================================

@app.post("/categories", response_model=CategoryResponse, status_code=201)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new category.

    Args:
        category: Category data with name and optional description

    Returns:
        Created category with metadata
    """
    try:
        # Validate name
        _validate_category_name(category.name)
        _check_category_exists(db, category.name)

        # Create new category
        current_time = datetime.now().isoformat()
        new_category = Category(
            name=category.name.strip(),
            description=category.description.strip() if category.description else None,
            created_at=current_time,
            updated_at=current_time,
            is_deleted=0,
        )

        db.add(new_category)
        db.commit()
        db.refresh(new_category)

        return CategoryResponse(
            id=new_category.id,
            name=new_category.name,
            description=new_category.description,
            created_at=new_category.created_at,
            updated_at=new_category.updated_at,
            is_deleted=bool(new_category.is_deleted),
        )

    except HTTPException:
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"Category with name '{category.name}' already exists",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to create category: {str(e)}"
        )


@app.get("/categories")
async def list_categories(
    include_deleted: bool = False,
    db: Session = Depends(get_db),
):
    """
    List all categories.

    Args:
        include_deleted: Include deleted categories (default: False)

    Returns:
        List of categories with metadata
    """
    try:
        query = db.query(Category)

        if not include_deleted:
            query = query.filter(Category.is_deleted == 0)

        categories = query.order_by(Category.name).all()

        return {
            "total": len(categories),
            "categories": [_format_category_response(cat) for cat in categories],
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to list categories: {str(e)}"
        )


@app.delete("/categories/{category_id}", status_code=200)
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    """
    Mark a category as deleted (soft delete).

    Args:
        category_id: ID of the category to delete

    Returns:
        Success message with deleted category info
    """
    try:
        category = db.query(Category).filter(Category.id == category_id).first()

        if not category:
            raise HTTPException(
                status_code=404, detail=f"Category with id {category_id} not found"
            )

        if category.is_deleted == 1:
            raise HTTPException(
                status_code=410,
                detail=f"Category '{category.name}' is already deleted",
            )

        # Soft delete
        category.is_deleted = 1
        category.updated_at = datetime.now().isoformat()
        db.commit()

        return {
            "status": "success",
            "message": f"Category '{category.name}' marked as deleted",
            "category": {
                "id": category.id,
                "name": category.name,
                "description": category.description,
                "is_deleted": True,
                "deleted_at": category.updated_at,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to delete category: {str(e)}"
        )


# ============================================================================
# API Endpoints - Sync
# ============================================================================

@app.post("/sync")
async def sync_bookmarks(
    settings: Settings = Depends(get_settings),
    db: Session = Depends(get_db),
):
    """
    Sync bookmarks from Twitter API to local database.

    Returns:
        Sync result with statistics
    """
    sync_start = datetime.now().isoformat()

    try:
        # Get latest synced bookmark
        latest_synced_bookmark = (
            db.query(Tweet.tweet_id)
            .order_by(desc(Tweet.sync_state_id), Tweet.inserted_at)
            .first()
        )

        # Initialize sync state
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

            # Check for cursor loop
            if (
                cursor is not None
                and next_cursor is not None
                and str(cursor) == str(next_cursor)
            ):
                break

            pages_fetched += 1
            total_fetched += len(tweets)

            # Process each tweet
            for tweet_data in tweets:
                if latest_synced_bookmark and tweet_data.get("tweet_id") == latest_synced_bookmark[0]:
                    next_cursor = None
                    break

                current_time = datetime.now().isoformat()
                new_count, updated_count = _process_tweet_data(
                    db, tweet_data, sync_state.id, current_time
                )
                new_bookmarks += new_count
                updated_bookmarks += updated_count

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
        sync_state.page_cursor = cursor
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
            "updated_bookmarks": updated_bookmarks,
        }

    except Exception as e:
        _handle_sync_error(db, e)
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
