# Twitter Bookmarks Manager

A FastAPI-based web server to sync and manage your Twitter/X bookmarks locally using SQLite.

## Features

- 📥 Sync Twitter bookmarks via the GraphQL API
- 💾 Store bookmarks in a local SQLite database
- 🔄 Pagination support to fetch all bookmarks
- 📊 Track sync state and statistics
- 🎯 Metadata extraction (media, authors, timestamps)
- 🔍 Raw JSON storage for future-proofing

## Project Structure

```
twitter-bookmarks/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application and /sync endpoint
│   ├── models.py         # SQLAlchemy models (tweets, sync_state)
│   ├── config.py         # Configuration management
│   └── twitter_client.py # Twitter API client
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## Database Schema

### Table: `tweets`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Internal surrogate key |
| `tweet_id` | TEXT UNIQUE NOT NULL | Twitter's snowflake ID |
| `text` | TEXT NOT NULL | Tweet body |
| `author_id` | TEXT | Author's user ID |
| `author_username` | TEXT | Username for display |
| `created_at` | TEXT NOT NULL | Tweet creation timestamp (ISO 8601) |
| `bookmarked_at` | TEXT NOT NULL | When you bookmarked it |
| `is_read` | INTEGER DEFAULT 0 | 0 = unread, 1 = read |
| `has_media_image` | INTEGER DEFAULT 0 | Flag if images present |
| `has_media_video` | INTEGER DEFAULT 0 | Flag if videos/GIFs present |
| `url` | TEXT | Canonical tweet URL |
| `source_json` | TEXT | Raw API payload |
| `is_deleted` | INTEGER DEFAULT 0 | Soft delete flag |
| `inserted_at` | TEXT NOT NULL | Local insertion timestamp |
| `updated_at` | TEXT NOT NULL | Last local update timestamp |

### Table: `sync_state`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY CHECK(id=1) | Singleton row |
| `last_sync_started_at` | TEXT | When last sync started |
| `last_sync_completed_at` | TEXT | When last sync completed |
| `last_seen_marker` | TEXT | For delta fetches |
| `last_error` | TEXT | Last error message |
| `page_cursor` | TEXT | Pagination cursor |

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- Twitter/X account with bookmarks

### 2. Installation

```bash
# Clone or download the project
cd twitter-bookmarks

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

1. Open Twitter/X in your browser and log in
2. Open Browser Developer Tools (F12 or right-click → Inspect)
3. Go to the **Network** tab
4. Navigate to your Bookmarks: https://x.com/i/bookmarks
5. Filter network requests by "Bookmarks"
6. Click on a Bookmarks API request
7. In the **Headers** tab, copy:
   - **Authorization** header (Bearer token)
   - **x-csrf-token** header (CSRF token)
   - **Cookie** header (all cookies as one string)

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

### `GET /`
Root endpoint with API information.

```bash
curl http://localhost:8000/
```

### `GET /health`
Health check and database status.

```bash
curl http://localhost:8000/health
```

### `GET /stats`
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

### `POST /sync`
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

### "Authentication failed" errors
- Your tokens may have expired - extract fresh credentials from your browser
- Ensure all three credentials (bearer token, CSRF token, cookies) are correctly copied

### "No bookmarks found"
- Check that you have bookmarks in your Twitter account
- Verify the GraphQL query ID is still valid (Twitter may change it)

### Database locked errors
- Only one process should write to the database at a time
- Stop any other running instances

## Security Notes

⚠️ **Important**: 
- **Never commit** your `.env` file with real credentials
- The `.gitignore` file excludes `.env` by default
- Keep your authentication tokens secure
- Tokens expire periodically - you'll need to refresh them

## License

This project is for personal use. Respect Twitter's Terms of Service.

## Future Enhancements

Potential improvements:
- [ ] Full-text search on tweets
- [ ] Export to JSON/CSV
- [ ] Web UI for browsing bookmarks
- [ ] Automatic token refresh
- [ ] Mark tweets as read via API
- [ ] Tag/categorize bookmarks
- [ ] Search and filter endpoints

## Contributing

This is a personal project, but suggestions and improvements are welcome!
