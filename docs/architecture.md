# Architecture Documentation: Twitter Bookmarks Manager

## Executive Summary

Twitter Bookmarks Manager is a **backend API service** built with **FastAPI** following a **layered architecture pattern**. The system integrates with Twitter's GraphQL API to fetch bookmarks and provides a RESTful API for local bookmark management with SQLite persistence.

**Key Characteristics:**
- **Architecture Style:** Layered/Service-Oriented
- **API Design:** RESTful HTTP endpoints
- **Data Persistence:** SQLite with SQLAlchemy ORM
- **External Integration:** Twitter GraphQL API via HTTPX
- **Configuration:** Environment-based with Pydantic Settings

---

## Technology Stack

### Core Framework & Runtime
| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **Web Framework** | FastAPI | 0.115.0 | Modern async Python framework with automatic API docs, type safety, and high performance |
| **ASGI Server** | Uvicorn | 0.32.0 | Lightning-fast ASGI server with websocket support and graceful shutdown |
| **Python** | Python | 3.8+ | Runtime environment |

### Data Layer
| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **ORM** | SQLAlchemy | 2.0.36 | Industry-standard Python ORM with excellent SQLite support and query building |
| **Database** | SQLite | Built-in | Serverless, file-based database perfect for local storage and single-user scenarios |

### External Services & HTTP
| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **HTTP Client** | HTTPX | 0.27.2 | Modern async HTTP client for Twitter API requests with excellent error handling |

### Configuration & Validation
| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **Settings** | Pydantic Settings | 2.6.0 | Type-safe configuration management from environment variables |
| **Validation** | Pydantic | 2.9.2 | Automatic request/response validation with clear error messages |
| **Environment** | Python-dotenv | 1.0.1 | Load environment variables from .env files for local development |

---

## Architecture Pattern: Layered Architecture

```
┌───────────────────────────────────────────────────────────┐
│                   REST API LAYER                          │
│  FastAPI Application (main.py)                            │
│  • Route handlers (@app.get, @app.post, etc.)            │
│  • Request/response models (Pydantic)                     │
│  • Dependency injection (get_db, get_settings)           │
│  • HTTP status codes & exception handling                │
└───────────────────────────────────────────────────────────┘
                           ↓
┌───────────────────────────────────────────────────────────┐
│               BUSINESS LOGIC LAYER                        │
│  Helper Functions (main.py)                               │
│  • _format_bookmark_response()                            │
│  • _process_tweet_data()                                  │
│  • _add_category_to_bookmark()                            │
│  • _validate_category_name()                              │
│  • Data transformation & business rules                   │
└───────────────────────────────────────────────────────────┘
                           ↓
┌───────────────────────────────────────────────────────────┐
│              DATA ACCESS LAYER (ORM)                      │
│  SQLAlchemy Models (models.py)                            │
│  • Tweet, Category, TweetCategory, SyncState              │
│  • Database session management                            │
│  • Query construction via ORM                             │
│  • Schema initialization (init_db)                        │
└───────────────────────────────────────────────────────────┘
                           ↓
┌───────────────────────────────────────────────────────────┐
│                   PERSISTENCE LAYER                       │
│  SQLite Database (File: twitter_bookmarks.db)             │
│  • Tables: tweets, categories, tweet_categories,          │
│             sync_state                                    │
│  • ACID transactions                                      │
│  • File-based storage                                     │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│           EXTERNAL SERVICE INTEGRATION LAYER              │
│  Twitter GraphQL Client (twitter_client.py)               │
│  • TwitterClient class                                    │
│  • API authentication & headers                           │
│  • GraphQL query construction                             │
│  • Response parsing & data extraction                     │
│  • Pagination handling                                    │
└───────────────────────────────────────────────────────────┘
                           ↑
                    Twitter/X API
              (https://x.com/i/api/graphql)

┌───────────────────────────────────────────────────────────┐
│           CONFIGURATION LAYER                             │
│  Settings & Config (config.py)                            │
│  • Pydantic Settings class                                │
│  • Environment variable loading                           │
│  • Validation at startup                                  │
│  • Twitter credentials, database URL                      │
└───────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. REST API Layer (`app/main.py`)

**Responsibility:** HTTP interface for clients

**Key Components:**
- **FastAPI Application Instance:** Configured with title, description, version
- **CORS Middleware:** Configured for frontend integration at `http://localhost:5173`
  - Allows all methods and headers
  - Supports credentials
  - Origin: Frontend development server (React/Vite default port)
- **API Endpoints:** 9 total routes across 4 functional areas
- **Pydantic Request/Response Models:** `CategoryCreate`, `CategoryResponse`, `BookmarkUpdate`
- **Dependency Injection:** `get_db()`, `get_settings()`
- **Startup/Shutdown Hooks:** `startup_event()` for database initialization

**Endpoint Groups (9 total):**
1. **Core Endpoints:** `/` (root), `/health`, `/stats`
2. **Sync Endpoints:** `/sync` (POST)
3. **Bookmark Endpoints:** `/bookmarks` (GET), `/bookmarks/{id}` (PATCH)
4. **Category Endpoints:** `/categories` (GET, POST), `/categories/{id}` (DELETE)

### 2. Business Logic Layer (`app/main.py` - Helper Functions)

**Responsibility:** Data processing, validation, business rules

**Helper Function Categories:**

**Bookmark Helpers:**
- `_format_bookmark_response()` - Format Tweet objects for API responses
- `_get_bookmark_categories()` - Retrieve assigned categories
- `_update_bookmark_read_status()` - Toggle read/unread
- `_add_category_to_bookmark()` - Add category assignment
- `_remove_category_from_bookmark()` - Remove category assignment

**Category Helpers:**
- `_validate_category_name()` - Name length and emptiness checks
- `_check_category_exists()` - Prevent duplicate categories
- `_format_category_response()` - Format Category objects for API

**Sync Helpers:**
- `_process_tweet_data()` - Insert or update tweet from API data
- `_handle_sync_error()` - Log sync errors to database

### 3. Data Access Layer (`app/models.py`)

**Responsibility:** Database schema definition and ORM mapping

**Models:**

```python
class Tweet(Base):
    """Bookmark storage with full metadata"""
    __tablename__ = "tweets"
    
    # Core fields
    id: INTEGER PRIMARY KEY (surrogate key)
    tweet_id: TEXT UNIQUE NOT NULL (Twitter snowflake ID)
    text: TEXT NOT NULL
    author_id, author_username: TEXT
    created_at, bookmarked_at: TEXT (ISO 8601)
    
    # Metadata
    is_read: INTEGER (0/1)
    has_media_image, has_media_video: INTEGER (0/1)
    url: TEXT
    source_json: TEXT (raw API response)
    is_deleted: INTEGER (soft delete)
    
    # Tracking
    inserted_at, updated_at: TEXT
    sync_state_id: INTEGER (FK to sync_state)

class SyncState(Base):
    """Sync history tracking (one record per sync)"""
    __tablename__ = "sync_state"
    
    id: INTEGER PRIMARY KEY AUTOINCREMENT
    last_sync_started_at, last_sync_completed_at: TEXT
    last_seen_marker, page_cursor: TEXT
    last_error: TEXT
    bookmarks_added, bookmarks_updated: INTEGER

class Category(Base):
    """Custom categories for organization"""
    __tablename__ = "categories"
    
    id: INTEGER PRIMARY KEY
    name: TEXT UNIQUE NOT NULL (max 120 chars)
    description: TEXT
    created_at, updated_at: TEXT
    is_deleted: INTEGER (soft delete)

class TweetCategory(Base):
    """Many-to-many: tweets ↔ categories"""
    __tablename__ = "tweet_categories"
    
    tweet_id: INTEGER FK (composite PK)
    category_id: INTEGER FK (composite PK)
    added_at: TEXT
```

**Database Functions:**
- `get_engine(database_url)` - Create SQLAlchemy engine
- `init_db(engine)` - Create all tables via SQLAlchemy metadata
- `get_session(engine)` - Create database session

### 4. External Service Layer (`app/twitter_client.py`)

**Responsibility:** Twitter API integration

**TwitterClient Class:**

```python
class TwitterClient:
    BASE_URL = "https://x.com/i/api/graphql"
    
    # Public methods
    async fetch_bookmarks(cursor) → Dict[str, Any]
    parse_bookmarks_response(response) → (List[Dict], Optional[str])
    
    # Private methods
    _build_headers() → Dict  # Auth headers
    _build_features() → Dict  # API feature flags
    _extract_cursor(entry) → str  # Pagination cursor
    _extract_tweet_from_entry(entry) → Dict
    _extract_tweet_data(tweet_result) → Dict  # Full tweet parsing
    _extract_media_flags(legacy) → (bool, bool)  # Image/video detection
    _build_tweet_url(username, tweet_id) → str
    _extract_tweet_text(tweet_result, legacy) → str  # Handle note tweets
```

**API Request Flow:**
1. Build variables with count (100) and cursor (if paginating)
2. Build feature flags (30+ feature toggles for API compatibility)
3. Construct headers with bearer token, CSRF token, cookies
4. Make GET request to `/Bookmarks` GraphQL endpoint
5. Parse nested JSON response to extract tweets and next cursor

**Response Structure:**
```
data.bookmark_timeline_v2.timeline.instructions[]
  → TimelineAddEntries
    → entries[]
      → tweet-{id} (tweet data)
      → cursor-bottom (pagination)
```

### 5. Configuration Layer (`app/config.py`)

**Responsibility:** Environment-based configuration

```python
class Settings(BaseSettings):
    # Twitter API credentials
    twitter_bearer_token: str
    twitter_csrf_token: str
    twitter_cookies: str
    twitter_graphql_query_id: str
    
    # Database
    database_url: str
    
    # Pydantic config
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False
    )

def get_settings() → Settings:
    """Singleton settings instance"""
```

**Environment Variables:**
- `TWITTER_BEARER_TOKEN` - OAuth bearer token from browser
- `TWITTER_CSRF_TOKEN` - CSRF token for request validation
- `TWITTER_COOKIES` - Full cookie string for authentication
- `TWITTER_GRAPHQL_QUERY_ID` - GraphQL operation ID for Bookmarks query
- `DATABASE_URL` - SQLite file path (e.g., `sqlite:///./twitter_bookmarks.db`)

---

## Data Flow

### 1. Sync Flow (Twitter → Local Database)

```
1. User triggers: POST /sync
2. FastAPI handler validates request
3. Initialize TwitterClient with settings
4. Get latest synced bookmark from database (for deduplication)
5. Create new SyncState record (auto-incrementing ID) with start time
6. Loop: Fetch bookmarks page
   a. TwitterClient.fetch_bookmarks(cursor)
   b. Parse response to extract tweets + next_cursor
   c. For each tweet:
      - Check if tweet_id exists (update) or new (insert)
      - _process_tweet_data() → Create/update Tweet record
      - Extract: text, author, timestamps, media flags, raw JSON
   d. Commit batch to database
   e. Update sync_state with cursor
   f. If no next_cursor or reached latest_synced_bookmark: break
7. Update SyncState with completion time, stats
8. Return sync summary
```

### 2. Bookmark Update Flow

```
1. User sends: PATCH /bookmarks/{id} with update_data
2. Validate bookmark exists and not deleted
3. Process updates:
   a. If is_read provided: Update bookmark.is_read
   b. If add_categories: Validate each category, create TweetCategory records
   c. If remove_categories: Delete TweetCategory records
4. Commit transaction
5. Fetch current categories
6. Return updated bookmark + categories + change summary
```

### 3. Category Management Flow

```
Create:
1. POST /categories with name + description
2. Validate name (not empty, max 120 chars)
3. Check no existing category with same name
4. Create Category record with timestamps
5. Return created category

Delete:
1. DELETE /categories/{id}
2. Find category, verify exists and not already deleted
3. Set is_deleted=1, update updated_at
4. Return success message (soft delete preserves data)
```

---

## Key Design Decisions

### 1. **SQLite for Persistence**
**Rationale:** 
- Single-user application with local data ownership
- No server setup required
- File-based portability
- Built-in Python support
- ACID transactions

**Trade-offs:**
- Not suitable for concurrent multi-user access
- No network access (must run locally)

### 2. **Soft Deletes (is_deleted Flag)**
**Rationale:**
- Preserve data integrity
- Allow undo operations
- Maintain foreign key relationships
- Audit trail of deleted items

**Implementation:** All models with `is_deleted INTEGER DEFAULT 0`

### 3. **Raw JSON Storage (source_json Column)**
**Rationale:**
- Future-proofing against Twitter API changes
- Complete data preservation
- Enable retroactive data extraction
- Debugging and analysis

**Trade-off:** Increased storage size

### 4. **Sync History Table**
**Rationale:**
- Maintain complete audit trail of all sync operations
- Track sync statistics over time
- Enable analysis of sync patterns and failures
- Each sync creates a new record with auto-incrementing ID

**Implementation:** Auto-increment primary key in SyncState model, queries order by `last_sync_started_at DESC` to get latest

### 5. **Pagination Cursor Tracking**
**Rationale:**
- Resume interrupted syncs
- Handle large bookmark collections (1000s of bookmarks)
- Respect API rate limits

**Implementation:** Store `page_cursor` in sync_state, loop until no next_cursor

### 6. **Many-to-Many Category Relationships**
**Rationale:**
- Bookmarks can belong to multiple categories
- Flexible organization system
- Query bookmarks by category

**Implementation:** TweetCategory join table with composite primary key

### 7. **Incremental Sync with Deduplication**
**Rationale:**
- Avoid fetching all bookmarks every time
- Stop when reaching last synced bookmark
- Update existing tweets if re-bookmarked

**Implementation:** Query latest `sync_state_id` + `inserted_at` from most recent sync record, break loop when tweet_id matches

---

## API Design

### REST Principles
- **Resource-based URLs:** `/bookmarks`, `/categories`
- **HTTP Methods:** GET (read), POST (create), PATCH (update), DELETE (delete)
- **Status Codes:** 200 (success), 201 (created), 404 (not found), 409 (conflict), 500 (error)
- **JSON Payloads:** All requests and responses use JSON

### Pagination
```json
GET /bookmarks?skip=0&limit=100
{
  "total": 1523,
  "skip": 0,
  "limit": 100,
  "count": 100,
  "bookmarks": [...]
}
```

### Error Handling
- **HTTPException:** Raise with status_code and detail message
- **Database Rollback:** Catch exceptions, rollback transaction, return 500
- **Validation Errors:** Pydantic automatically validates and returns 422

---

## Security Considerations

### Authentication
- **Current:** No authentication on API endpoints (local use only)
- **Twitter API:** Uses bearer token + CSRF + cookies from user's browser session

### Data Privacy
- **Local Storage:** All data stored locally on user's machine
- **No Cloud Sync:** No external services involved
- **User Control:** Complete data ownership

### Recommendations for Production
If deploying as a service:
1. Add API key authentication
2. Implement rate limiting
3. Add CORS configuration
4. Use environment variable secrets management
5. Consider PostgreSQL for multi-user support

---

## Performance Characteristics

### Bottlenecks
1. **Twitter API Rate Limits:** 100 bookmarks per request
2. **Network Latency:** Each page fetch ~500-1000ms
3. **Single-threaded Sync:** Sequential page fetching

### Optimization Strategies
- **Batch Commits:** Commit after each page (100 tweets)
- **Incremental Sync:** Stop at last synced bookmark
- **Index on tweet_id:** UNIQUE constraint provides index
- **Async HTTP:** HTTPX async client for non-blocking requests

### Scalability Notes
- SQLite handles 1M+ tweets efficiently
- Current design optimized for single-user
- Pagination on `/bookmarks` supports large datasets

---

## Testing Strategy

### Test Coverage Opportunities
1. **Unit Tests:**
   - Helper functions (validation, formatting)
   - TwitterClient parsing logic
   - Model constraints

2. **Integration Tests:**
   - API endpoint testing with TestClient
   - Database operations with in-memory SQLite
   - Sync flow with mocked Twitter API

3. **E2E Tests:**
   - Full sync workflow
   - Category assignment flow
   - Error handling scenarios

**Current Status:** No test files present _(To be implemented)_

---

## Deployment Architecture

### Local Development
```
Developer Machine
├── Python Virtual Environment
├── SQLite Database File
├── .env (credentials)
└── FastAPI Server (port 8000)
```

### Production Deployment Options

**Option 1: Docker Container**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ ./app/
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Option 2: systemd Service**
```ini
[Unit]
Description=Twitter Bookmarks Manager
After=network.target

[Service]
User=bookmarks
WorkingDirectory=/opt/twitter-bookmarks
Environment="DATABASE_URL=sqlite:////var/lib/bookmarks/db.sqlite"
ExecStart=/opt/twitter-bookmarks/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

---

## Future Architecture Enhancements

### Potential Improvements
1. **Search Functionality:** Full-text search on tweet text
2. **Background Sync:** Celery/APScheduler for scheduled syncs
3. **WebSocket Support:** Real-time sync status updates
4. **Multi-User Support:** PostgreSQL + authentication
5. **Caching Layer:** Redis for frequently accessed bookmarks
6. **Export Features:** Export to JSON, CSV, Markdown
7. **Import from Archive:** Parse Twitter data exports

---

## Related Documentation

- [Data Models](./data-models.md) - Detailed database schema
- [API Contracts](./api-contracts.md) - Complete API endpoint documentation
- [Development Guide](./development-guide.md) - Setup and development workflow
- [Source Tree Analysis](./source-tree-analysis.md) - Detailed code structure

---

**Generated:** 2026-01-19  
**Version:** 1.0.0
