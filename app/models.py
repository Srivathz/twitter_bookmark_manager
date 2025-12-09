"""
Database models for Twitter bookmarks management system.
"""
from datetime import datetime

from sqlalchemy import CheckConstraint, Column, ForeignKey, Integer, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()


# ============================================================================
# Database Models
# ============================================================================

class Tweet(Base):
    """
    Table: tweets
    Stores individual tweet bookmarks with metadata.
    """

    __tablename__ = "tweets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tweet_id = Column(Text(32), unique=True, nullable=False, index=True)
    text = Column(Text, nullable=False)
    author_id = Column(Text(32))
    author_username = Column(Text(50))
    created_at = Column(Text, nullable=False)  # ISO 8601 timestamp
    bookmarked_at = Column(Text, nullable=False)  # ISO 8601 timestamp
    is_read = Column(Integer, nullable=False, default=0)
    has_media_image = Column(Integer, nullable=False, default=0)
    has_media_video = Column(Integer, nullable=False, default=0)
    url = Column(Text)
    source_json = Column(Text)  # Raw JSON from API stored as text
    is_deleted = Column(Integer, nullable=False, default=0)
    inserted_at = Column(Text, nullable=False)  # ISO 8601 timestamp
    updated_at = Column(Text, nullable=False)  # ISO 8601 timestamp
    sync_state_id = Column(Integer)  # Foreign key to sync_state.id


class SyncState(Base):
    """
    Table: sync_state
    Singleton table to track synchronization state.
    """

    __tablename__ = "sync_state"

    id = Column(Integer, primary_key=True)
    last_sync_started_at = Column(Text)
    last_sync_completed_at = Column(Text)
    last_seen_marker = Column(Text)
    last_error = Column(Text)
    page_cursor = Column(Text)
    bookmarks_added = Column(Integer)
    bookmarks_updated = Column(Integer)

    __table_args__ = (CheckConstraint("id = 1", name="singleton_check"),)


class Category(Base):
    """
    Table: categories
    Stores bookmark categories for organization.
    """

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text(120), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(Text, nullable=False)  # ISO 8601 timestamp
    updated_at = Column(Text, nullable=False)  # ISO 8601 timestamp
    is_deleted = Column(Integer, nullable=False, default=0)


class TweetCategory(Base):
    """
    Table: tweet_categories
    Many-to-many relationship between tweets and categories.
    """

    __tablename__ = "tweet_categories"

    tweet_id = Column(
        Integer, ForeignKey("tweets.id"), primary_key=True, nullable=False
    )
    category_id = Column(
        Integer, ForeignKey("categories.id"), primary_key=True, nullable=False
    )
    added_at = Column(Text, nullable=False)  # ISO 8601 timestamp


# ============================================================================
# Database Setup Functions
# ============================================================================

def get_engine(database_url: str):
    """Create and return a database engine."""
    return create_engine(database_url, echo=False)


def init_db(engine):
    """Initialize database tables."""
    Base.metadata.create_all(engine)

    # Ensure sync_state has a singleton row
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    try:
        sync_state = session.query(SyncState).filter_by(id=1).first()
        if not sync_state:
            sync_state = SyncState(id=1)
            session.add(sync_state)
            session.commit()
    finally:
        session.close()


def get_session(engine):
    """Create and return a database session."""
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()
