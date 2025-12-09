# Twitter Bookmarks Manager

A FastAPI-based web server to sync and manage your Twitter/X bookmarks locally using SQLite.

## Features

- 📥 **Sync Twitter bookmarks** via the GraphQL API
- 💾 **Store bookmarks** in a local SQLite database
- 🔄 **Pagination support** to fetch all bookmarks
- 📊 **Track sync state** and statistics
- 🎯 **Metadata extraction** (media, authors, timestamps)
- 🏷️ **Categorize bookmarks** with custom categories
- ✅ **Mark as read/unread** functionality
- 🔍 **Raw JSON storage** for future-proofing

## Project Structure

```
twitter_bookmark_manager/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application and API endpoints
│   ├── models.py         # SQLAlchemy models (tweets, categories, sync_state)
│   ├── config.py         # Configuration management
│   └── twitter_client.py # Twitter GraphQL API client
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## Database Schema

### Table: `tweets`

| Column            | Type                | Description                           |
|-------------------|---------------------|---------------------------------------|
| `id`              | INTEGER PRIMARY KEY | Internal surrogate key                |
| `tweet_id`        | TEXT UNIQUE NOT NULL| Twitter's snowflake ID                |
| `text`            | TEXT NOT NULL       | Tweet body                            |
| `author_id`       | TEXT                | Author's user ID                      |
| `author_username` | TEXT                | Username for display                  |
| `created_at`      | TEXT NOT NULL       | Tweet creation timestamp (ISO 8601)   |
| `bookmarked_at`   | TEXT NOT NULL       | When you bookmarked it                |
| `is_read`         | INTEGER DEFAULT 0   | 0 = unread, 1 = read                  |
| `has_media_image` | INTEGER DEFAULT 0   | Flag if images present                |
| `has_media_video` | INTEGER DEFAULT 0   | Flag if videos/GIFs present           |
| `url`             | TEXT                | Canonical tweet URL                   |
| `source_json`     | TEXT                | Raw API payload                       |
| `is_deleted`      | INTEGER DEFAULT 0   | Soft delete flag                      |
| `inserted_at`     | TEXT NOT NULL       | Local insertion timestamp             |
| `updated_at`      | TEXT NOT NULL       | Last local update timestamp           |
| `sync_state_id`   | INTEGER FOREIGN KEY | References `sync_state.id`            |

### Table: `sync_state`

| Column                    | Type                | Description                          |
|---------------------------|---------------------|--------------------------------------|
| `id`                      | INTEGER PRIMARY KEY | Incremental PRIMARY KEY              |
| `last_sync_started_at`    | TEXT                | When last sync started               |
| `last_sync_completed_at`  | TEXT                | When last sync completed             |
| `last_seen_marker`        | TEXT                | For delta fetches                    |
| `last_error`              | TEXT                | Last error message                   |
| `page_cursor`             | TEXT                | Pagination cursor                    |
| `bookmarks_added`         | INTEGER             | Number of bookmarks added in sync    |
| `bookmarks_updated`       | INTEGER             | Number of bookmarks updated in sync  |

### Table: `categories`

| Column        | Type                  | Description                          |
|---------------|-----------------------|--------------------------------------|
| `id`          | INTEGER PRIMARY KEY   | Category key (auto increment)        |
| `name`        | TEXT UNIQUE NOT NULL  | Display name (max 120 chars)         |
| `description` | TEXT                  | Optional notes                       |
| `created_at`  | TEXT NOT NULL         | Creation timestamp (ISO 8601)        |
| `updated_at`  | TEXT NOT NULL         | Last update timestamp (ISO 8601)     |
| `is_deleted`  | INTEGER DEFAULT 0     | Soft delete flag                     |

### Table: `tweet_categories`

| Column          | Type              | Description                        |
|-----------------|-------------------|------------------------------------|
| `tweet_id`      | INTEGER NOT NULL  | FK to `tweets.id`                  |
| `category_id`   | INTEGER NOT NULL  | FK to `categories.id`              |
| `added_at`      | TEXT NOT NULL     | Assignment timestamp (ISO 8601)    |
| **PRIMARY KEY** |                   | `(tweet_id, category_id)`          |

## Setup Instructions

### 1. Prerequisites

- **Python 3.8+**
- **Twitter/X account** with bookmarks

### 2. Installation

```bash
# Clone or download the project
cd twitter_bookmark_manager

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Get Twitter API Credentials

You need to extract authentication credentials from your browser:

1. **Open Twitter/X** in your browser and log in
2. **Open Developer Tools** (F12 or right-click → Inspect)
3. Navigate to the **Network** tab
4. Go to your Bookmarks: `https://x.com/i/bookmarks`
5. Filter network requests by **"Bookmarks"**
6. Click on a Bookmarks API request
7. In the **Headers** tab, copy these three values:
   - `Authorization` header (Bearer token)
   - `x-csrf-token` header (CSRF token)
   - `Cookie` header (all cookies as one string)

### 4. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your credentials
nano .env  # or use any text editor
```

Update `.env` with your extracted credentials:

```env
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA
TWITTER_CSRF_TOKEN=your_actual_csrf_token
TWITTER_COOKIES=guest_id_marketing=...; auth_token=...; ct0=...;
```

### 5. Run the Server

```bash
# Start the FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at: http://localhost:8000

## API Endpoints

### Core Endpoints

#### `GET /`

Root endpoint with API information.

```bash
curl http://localhost:8000/
```

#### `GET /health`

Health check and database status.

```bash
curl http://localhost:8000/health
```

#### `GET /stats`

Get statistics about stored bookmarks.

```bash
curl http://localhost:8000/stats
```

Response:
```json
{
  "total_bookmarks": 150,
  "read": 45,
  "unread": 105,
  "with_images": 80,
  "with_videos": 25,
  "last_sync_started": "2025-12-06T10:30:00",
  "last_sync_completed": "2025-12-06T10:35:00",
  "last_error": null
}
```

---

### Bookmark Endpoints

#### `GET /bookmarks`

List all bookmarks sorted by `created_at` descending.

**Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 100, max: 1000)

**Basic usage (first 100 bookmarks):**
```bash
curl http://localhost:8000/bookmarks
```

**With pagination:**
```bash
# Get first 50 bookmarks
curl "http://localhost:8000/bookmarks?limit=50"

# Get next 50 bookmarks (skip first 50)
curl "http://localhost:8000/bookmarks?skip=50&limit=50"
```

Response:
```json
{
  "total": 150,
  "skip": 0,
  "limit": 100,
  "count": 100,
  "bookmarks": [
    {
      "id": 1,
      "tweet_id": "1234567890123456789",
      "text": "This is a sample tweet...",
      "author_id": "987654321",
      "author_username": "example_user",
      "created_at": "2025-12-06T10:30:00",
      "bookmarked_at": "2025-12-06T11:00:00",
      "is_read": false,
      "has_media_image": true,
      "has_media_video": false,
      "url": "https://x.com/example_user/status/1234567890123456789",
      "inserted_at": "2025-12-06T11:00:00.123456",
      "updated_at": "2025-12-06T11:00:00.123456"
    }
  ]
}
```

#### `PATCH /bookmarks/{bookmark_id}`

Update a bookmark: toggle read/unread status and manage category assignments.

**Parameters:**
- `bookmark_id` (path parameter): ID of the bookmark to update

**Request body (all fields optional):**
```json
{
  "is_read": true,
  "add_categories": [1, 2],
  "remove_categories": [3]
}
```

**Fields:**
- `is_read` (optional): Set to `true` to mark as read, `false` to mark as unread
- `add_categories` (optional): Array of category IDs to assign to this bookmark
- `remove_categories` (optional): Array of category IDs to unassign from this bookmark

**Examples:**

**Mark as read:**
```bash
curl -X PATCH http://localhost:8000/bookmarks/1 \
  -H "Content-Type: application/json" \
  -d '{"is_read": true}'
```

**Add categories:**
```bash
curl -X PATCH http://localhost:8000/bookmarks/1 \
  -H "Content-Type: application/json" \
  -d '{"add_categories": [1, 2]}'
```

**Remove categories:**
```bash
curl -X PATCH http://localhost:8000/bookmarks/1 \
  -H "Content-Type: application/json" \
  -d '{"remove_categories": [3]}'
```

**Combined update:**
```bash
curl -X PATCH http://localhost:8000/bookmarks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "is_read": true,
    "add_categories": [1, 2],
    "remove_categories": [3]
  }'
```

Response (200 OK):
```json
{
  "status": "success",
  "message": "Bookmark updated: is_read=true, added category 'Tech Articles', removed category 'News'",
  "bookmark": {
    "id": 1,
    "tweet_id": "1234567890123456789",
    "text": "This is a sample tweet...",
    "author_username": "example_user",
    "is_read": true,
    "url": "https://x.com/example_user/status/1234567890123456789",
    "updated_at": "2025-12-08T11:30:00.123456",
    "categories": [
      {
        "id": 1,
        "name": "Tech Articles",
        "description": "Technical articles and tutorials"
      },
      {
        "id": 2,
        "name": "Favorites",
        "description": null
      }
    ]
  },
  "changes": {
    "read_status_changed": true,
    "categories_added": ["Tech Articles"],
    "categories_removed": ["News"]
  }
}
```

**Error responses:**
- `404 Not Found` - Bookmark or category with specified ID does not exist
- `400 Bad Request` - Invalid request data

---

### Category Endpoints

#### `POST /categories`

Create a new category for organizing bookmarks.

**Request body:**
```json
{
  "name": "Tech Articles",
  "description": "Technical articles and tutorials"
}
```

**Parameters:**
- `name` (required): Category name (1-120 characters, must be unique)
- `description` (optional): Optional description for the category

**Example:**
```bash
curl -X POST http://localhost:8000/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Articles",
    "description": "Technical articles and tutorials"
  }'
```

Response (201 Created):
```json
{
  "id": 1,
  "name": "Tech Articles",
  "description": "Technical articles and tutorials",
  "created_at": "2025-12-08T10:30:00.123456",
  "updated_at": "2025-12-08T10:30:00.123456",
  "is_deleted": false
}
```

**Error responses:**
- `400 Bad Request` - Empty name or name exceeds 120 characters
- `409 Conflict` - Category with the same name already exists

#### `GET /categories`

List all categories.

**Parameters:**
- `include_deleted` (optional): Include deleted categories (default: false)

**Basic usage (active categories only):**
```bash
curl http://localhost:8000/categories
```

**Include deleted categories:**
```bash
curl "http://localhost:8000/categories?include_deleted=true"
```

Response:
```json
{
  "total": 3,
  "categories": [
    {
      "id": 1,
      "name": "Tech Articles",
      "description": "Technical articles and tutorials",
      "created_at": "2025-12-08T10:30:00.123456",
      "updated_at": "2025-12-08T10:30:00.123456",
      "is_deleted": false
    },
    {
      "id": 2,
      "name": "News",
      "description": "Current events and news",
      "created_at": "2025-12-08T10:31:00.123456",
      "updated_at": "2025-12-08T10:31:00.123456",
      "is_deleted": false
    }
  ]
}
```

#### `DELETE /categories/{category_id}`

Mark a category as deleted (soft delete).

**Parameters:**
- `category_id` (path parameter): ID of the category to delete

**Example:**
```bash
curl -X DELETE http://localhost:8000/categories/1
```

Response (200 OK):
```json
{
  "status": "success",
  "message": "Category 'Tech Articles' marked as deleted",
  "category": {
    "id": 1,
    "name": "Tech Articles",
    "description": "Technical articles and tutorials",
    "is_deleted": true,
    "deleted_at": "2025-12-08T11:00:00.123456"
  }
}
```

**Error responses:**
- `404 Not Found` - Category with specified ID does not exist
- `410 Gone` - Category is already deleted

---

### Sync Endpoint

#### `POST /sync`

Sync bookmarks from Twitter API.

**Basic sync (fetch all):**
```bash
curl -X POST http://localhost:8000/sync
```

**Limit to specific number of pages:**
```bash
curl -X POST "http://localhost:8000/sync?max_pages=5"
```

Response:
```json
{
  "status": "success",
  "sync_started_at": "2025-12-06T10:30:00.123456",
  "sync_completed_at": "2025-12-06T10:35:00.654321",
  "pages_fetched": 3,
  "total_fetched": 294,
  "new_bookmarks": 250,
  "updated_bookmarks": 44
}
```

## Usage Examples

### First-time sync
```bash
# Fetch all your bookmarks
curl -X POST http://localhost:8000/sync
```

### Check statistics
```bash
curl http://localhost:8000/stats
```

### Query the database directly
```bash
sqlite3 bookmarks.db

# Example queries:
SELECT COUNT(*) FROM tweets WHERE is_deleted = 0;
SELECT author_username, COUNT(*) as count FROM tweets GROUP BY author_username ORDER BY count DESC LIMIT 10;
SELECT text FROM tweets WHERE has_media_video = 1 LIMIT 5;
```

## Database Location

The SQLite database is created as `bookmarks.db` in the project root directory by default. You can change this in `.env`:

```env
DATABASE_URL=sqlite:///path/to/your/bookmarks.db
```

## Development

### Interactive API Documentation

FastAPI provides automatic interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Running Tests

```bash
# Install test dependencies (add to requirements.txt if needed)
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## Troubleshooting

### Authentication Failed Errors

- **Tokens expired** - Extract fresh credentials from your browser
- **Missing credentials** - Ensure all three values (Bearer token, CSRF token, Cookies) are correctly copied

### No Bookmarks Found

- **Empty bookmarks** - Verify you have bookmarks in your Twitter account
- **Invalid query ID** - The GraphQL query ID may have changed (Twitter updates these periodically)

### Database Locked Errors

- **Multiple processes** - Only one process should write to the database at a time
- **Solution** - Stop any other running instances of the application

## Security Notes

⚠️ **Important Security Considerations:**

- **Never commit** your `.env` file with real credentials to version control
- The `.gitignore` file excludes `.env` by default
- **Keep authentication tokens secure** - treat them like passwords
- **Tokens expire periodically** - you'll need to refresh them from your browser
- **For personal use only** - respect Twitter's Terms of Service

## License

This project is for personal use. Respect Twitter's Terms of Service.

## Future Enhancements

Potential improvements and features under consideration:

- [ ] **Full-text search** - Search tweets by content
- [ ] **Export functionality** - Export to JSON/CSV formats
- [ ] **Web UI** - Browse and manage bookmarks via web interface
- [ ] **Automatic token refresh** - Auto-refresh expired tokens
- [ ] **Advanced filtering** - Filter by author, date range, media type
- [ ] **Bulk operations** - Batch mark as read, bulk categorization
- [ ] **Search endpoints** - Advanced search and filter API endpoints
- [ ] **Analytics** - Reading patterns and bookmark statistics
- [ ] **Backup/restore** - Database backup and restore functionality

## Contributing

This is a personal project, but suggestions and improvements are welcome!
