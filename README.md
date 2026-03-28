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
- 🔍 **Full-text search** in tweet content and author usernames
- 🎛️ **Advanced filtering** by read status and category
- 🔍 **Raw JSON storage** for future-proofing

## Project Structure

```
twitter_bookmark_manager/
├── app/                 # Backend application
│   ├── main.py         # FastAPI app and API endpoints
│   ├── models.py       # Database models (SQLAlchemy)
│   ├── config.py       # Configuration management
│   └── twitter_client.py # Twitter API client
├── docs/               # Complete documentation
├── requirements.txt    # Python dependencies
└── .env.example       # Environment template
```

**📚 See [Source Tree Analysis](docs/source-tree-analysis.md) for detailed file-by-file breakdown**

## Database Schema

The application uses SQLite with 4 main tables for storing bookmarks, categories, and sync state.

**📚 See [Database Schema Documentation](docs/data-models.md) for complete details:**
- Entity relationship diagram
- Table definitions with all columns and constraints
- Business rules and indexing strategy
- Sample data and queries
- Performance considerations

## Quick Start

### Prerequisites
- Python 3.8+
- Twitter/X account with bookmarks

### Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env with your Twitter credentials

# 3. Run the server
uvicorn app.main:app --reload
```

**Server URLs:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

**📚 For detailed setup instructions including:**
- How to extract Twitter credentials from your browser
- Virtual environment setup
- Database initialization
- Troubleshooting common issues

**See [Development Guide](docs/development-guide.md)**

## API Endpoints

The API provides **9 RESTful endpoints** for bookmark management:

**Core Endpoints:**
- `GET /` - API information and endpoint list
- `GET /health` - Health check and database connectivity
- `GET /stats` - Database statistics and sync status

**Bookmarks:**
- `GET /bookmarks` - List bookmarks with filtering, search, and pagination
  - Filters: `is_read` (true/false), `category_id`, `search` (text search)
  - Pagination: `skip`, `limit`
- `PATCH /bookmarks/{id}` - Update bookmark (mark read/unread, manage categories)

**Categories:**
- `GET /categories` - List all categories
- `POST /categories` - Create new category
- `DELETE /categories/{id}` - Soft delete category

**Sync:**
- `POST /sync` - Sync bookmarks from Twitter/X

**📚 Interactive API Documentation:**
- **Swagger UI:** http://localhost:8000/docs (try endpoints live)
- **ReDoc:** http://localhost:8000/redoc (clean reference)

**📚 For complete API documentation including:**
- Request/response schemas for all endpoints
- All query parameters and filters
- Status codes and error handling
- Curl examples for every operation

**See [API Contracts Documentation](docs/api-contracts.md)**

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

- [ ] **Export functionality** - Export to JSON/CSV formats
- [ ] **Web UI** - Browse and manage bookmarks via web interface
- [ ] **Automatic token refresh** - Auto-refresh expired tokens
- [ ] **Advanced filtering** - Filter by author, date range, media type
- [ ] **Bulk operations** - Batch mark as read, bulk categorization
- [ ] **Analytics** - Reading patterns and bookmark statistics
- [ ] **Backup/restore** - Database backup and restore functionality

## Contributing

This is a personal project, but suggestions and improvements are welcome!
