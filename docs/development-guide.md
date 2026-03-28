# Development Guide: Twitter Bookmarks Manager

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **Python** | 3.8+ | Runtime environment |
| **pip** | Latest | Package manager |
| **Git** | Any | Version control |
| **SQLite** | 3.x | Database (usually bundled with Python) |

### Optional Tools

- **VS Code** - Recommended IDE with Python extension
- **Postman** - API testing
- **DB Browser for SQLite** - Database inspection
- **httpie** or **curl** - Command-line API testing

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd twitter_bookmark_manager
```

### 2. Create Virtual Environment

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Verify activation:**
```bash
which python  # Should point to venv/bin/python
python --version  # Should be 3.8+
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed:
  fastapi-0.115.0
  uvicorn-0.32.0
  sqlalchemy-2.0.36
  httpx-0.27.2
  python-dotenv-1.0.1
  pydantic-2.9.2
  pydantic-settings-2.6.0
  ...
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

**Edit `.env` with your credentials:**

```bash
# Get these from your browser while logged into Twitter/X
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejR...
TWITTER_CSRF_TOKEN=2698ed6633a6beaaf9aaff367a8c5dfd21bab98...
TWITTER_COOKIES=guest_id_marketing=v1%3A175664185249830471; ...
TWITTER_GRAPHQL_QUERY_ID=43OUXyQe2KB6BLfli5CFPA

# Database (default: SQLite in project root)
DATABASE_URL=sqlite:///./twitter_bookmarks.db
```

**How to extract Twitter credentials:**

1. **Open Twitter/X in browser** (while logged in)
2. **Open Developer Tools** (F12 or Right-click → Inspect)
3. **Go to Network tab**
4. **Navigate to Twitter bookmarks** (`https://x.com/i/bookmarks`)
5. **Find GraphQL request** to `Bookmarks` endpoint
6. **Copy headers:**
   - `Authorization` → Extract bearer token after "Bearer "
   - `x-csrf-token` → Copy value
   - `Cookie` → Copy entire cookie string
7. **Copy Query ID** from request URL

### 5. Initialize Database

**Automatic initialization on first run:**

```bash
python3 -m app.main
```

**Manual initialization (optional):**

```python
from app.models import get_engine, init_db
from app.config import get_settings

settings = get_settings()
engine = get_engine(settings.database_url)
init_db(engine)
print("Database initialized!")
```

**Verify tables created:**

```bash
sqlite3 twitter_bookmarks.db
.tables
# Should show: tweets categories tweet_categories sync_state
.quit
```

---

## Running the Application

### Development Server

**Option 1: Direct Python execution**

```bash
python -m app.main
```

**Option 2: Uvicorn (recommended for development)**

```bash
python3 -m venv venv
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Uvicorn flags:**
- `--reload` - Auto-reload on code changes
- `--host 0.0.0.0` - Accept connections from any IP
- `--port 8000` - Port number (default)
- `--log-level debug` - Verbose logging

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Verify Server Running

**Browser:**
- API Info: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Command line:**
```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "last_sync": null
}
```

---

## Development Workflow

### Making Code Changes

1. **Activate virtual environment:**
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

2. **Start dev server with auto-reload:**
```bash
uvicorn app.main:app --reload
```

3. **Edit code** in `app/` directory

4. **Server auto-reloads** on file save

5. **Test changes** via API docs or curl

### Adding New Endpoint

**Example: Add `/bookmarks/search` endpoint**

1. **Define in `app/main.py`:**

```python
@app.get("/bookmarks/search")
async def search_bookmarks(
    query: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Search bookmarks by text content."""
    bookmarks = (
        db.query(Tweet)
        .filter(
            Tweet.is_deleted == 0,
            Tweet.text.contains(query)
        )
        .order_by(desc(Tweet.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return {
        "query": query,
        "count": len(bookmarks),
        "bookmarks": [_format_bookmark_response(b) for b in bookmarks]
    }
```

2. **Test immediately** (server auto-reloads):

```bash
curl "http://localhost:8000/bookmarks/search?query=python&limit=10"
```

3. **Check Swagger UI** - endpoint automatically appears

### Adding Database Field

**Example: Add `favorite` field to `Tweet` model**

1. **Update model in `app/models.py`:**

```python
class Tweet(Base):
    # ... existing fields
    is_favorite = Column(Integer, nullable=False, default=0)
```

2. **Update helper in `app/main.py`:**

```python
def _format_bookmark_response(bookmark: Tweet) -> dict:
    return {
        # ... existing fields
        "is_favorite": bool(bookmark.is_favorite),
    }
```

3. **Handle migration:**

**Option A: Drop and recreate database (dev only)**
```bash
rm twitter_bookmarks.db
python -m app.main  # Recreates with new schema
```

**Option B: Manual ALTER TABLE (preserve data)**
```bash
sqlite3 twitter_bookmarks.db
ALTER TABLE tweets ADD COLUMN is_favorite INTEGER DEFAULT 0;
.quit
```

**Option C: Use Alembic (production)**
```bash
pip install alembic
alembic init alembic
# Configure alembic.ini and env.py
alembic revision --autogenerate -m "Add is_favorite field"
alembic upgrade head
```

---

## Testing

### Manual Testing

**1. Test health endpoint:**
```bash
curl http://localhost:8000/health
```

**2. Create category:**
```bash
curl -X POST http://localhost:8000/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Category", "description": "For testing"}'
```

**3. Sync bookmarks (requires valid Twitter credentials):**
```bash
curl -X POST http://localhost:8000/sync
```

**4. List bookmarks:**
```bash
curl http://localhost:8000/bookmarks?limit=5
```

**5. Update bookmark:**
```bash
curl -X PATCH http://localhost:8000/bookmarks/1 \
  -H "Content-Type: application/json" \
  -d '{"is_read": true}'
```

### Interactive Testing with Swagger UI

1. **Open browser:** http://localhost:8000/docs
2. **Click endpoint** to expand
3. **Click "Try it out"**
4. **Fill parameters** (JSON for POST/PATCH)
5. **Click "Execute"**
6. **View response** below

### Automated Testing (To Be Implemented)

**Recommended test structure:**

```
tests/
├── __init__.py
├── conftest.py              # Shared fixtures
├── test_api_endpoints.py    # API tests
├── test_models.py           # Model tests
├── test_twitter_client.py   # Client tests (mocked)
└── test_integration.py      # E2E tests
```

**Install test dependencies:**

```bash
pip install pytest pytest-asyncio httpx
```

**Example test (save as `tests/test_api_endpoints.py`):**

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models import Base, get_engine

@pytest.fixture
def client():
    # Use in-memory SQLite for tests
    engine = get_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    
    with TestClient(app) as test_client:
        yield test_client

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["name"] == "Twitter Bookmarks Manager API"

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_create_category(client):
    response = client.post(
        "/categories",
        json={"name": "Test", "description": "Test category"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test"
```

**Run tests:**

```bash
pytest tests/ -v
```

---

## Database Management

### Inspecting Database

**Using SQLite CLI:**

```bash
sqlite3 twitter_bookmarks.db

# List tables
.tables

# Describe schema
.schema tweets

# Query data
SELECT COUNT(*) FROM tweets;
SELECT * FROM tweets LIMIT 5;

# Export to CSV
.mode csv
.output bookmarks.csv
SELECT tweet_id, text, author_username, created_at FROM tweets;
.quit
```

**Using DB Browser for SQLite:**

1. Download: https://sqlitebrowser.org/
2. Open `twitter_bookmarks.db`
3. Browse tables, run queries, export data

### Backup & Restore

**Backup:**

```bash
# Method 1: File copy (stop app first)
cp twitter_bookmarks.db twitter_bookmarks.db.backup

# Method 2: SQLite backup command (safe while running)
sqlite3 twitter_bookmarks.db ".backup twitter_bookmarks.db.backup"

# Method 3: SQL dump
sqlite3 twitter_bookmarks.db .dump > backup.sql
```

**Restore:**

```bash
# From file backup
cp twitter_bookmarks.db.backup twitter_bookmarks.db

# From SQL dump
sqlite3 twitter_bookmarks_restored.db < backup.sql
```

### Reset Database

**Complete reset (deletes all data):**

```bash
rm twitter_bookmarks.db
python -m app.main  # Recreates empty database
```

**Soft reset (clear data, keep schema):**

```bash
sqlite3 twitter_bookmarks.db
DELETE FROM tweet_categories;
DELETE FROM tweets;
DELETE FROM categories;
UPDATE sync_state SET 
  last_sync_started_at = NULL,
  last_sync_completed_at = NULL,
  page_cursor = NULL,
  bookmarks_added = 0,
  bookmarks_updated = 0;
.quit
```

---

## Common Development Tasks

### Adding a New Dependency

1. **Install package:**
```bash
pip install package-name
```

2. **Update requirements.txt:**
```bash
pip freeze > requirements.txt
```

3. **Commit changes:**
```bash
git add requirements.txt
git commit -m "Add package-name dependency"
```

### Debugging

**Enable debug logging:**

```bash
uvicorn app.main:app --reload --log-level debug
```

**Add print debugging:**

```python
@app.post("/sync")
async def sync_bookmarks(...):
    print(f"Starting sync at {datetime.now()}")
    print(f"Cursor: {cursor}")
    # ... rest of code
```

**Use Python debugger (pdb):**

```python
import pdb

@app.post("/sync")
async def sync_bookmarks(...):
    pdb.set_trace()  # Breakpoint here
    # ... rest of code
```

**VS Code debugger configuration (.vscode/launch.json):**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "app.main:app",
        "--reload"
      ],
      "jinja": true,
      "justMyCode": true
    }
  ]
}
```

### Environment-Specific Configuration

**Development:**
```bash
DATABASE_URL=sqlite:///./twitter_bookmarks_dev.db
```

**Testing:**
```bash
DATABASE_URL=sqlite:///:memory:
```

**Production:**
```bash
DATABASE_URL=sqlite:////var/lib/twitter-bookmarks/production.db
# or
DATABASE_URL=postgresql://user:pass@localhost/bookmarks
```

---

## Code Style & Standards

### Python Style Guide

**Follow PEP 8:**
- 4 spaces for indentation
- Max line length: 88 characters (Black formatter default)
- Blank lines: 2 between top-level functions, 1 within functions

**Type hints:**
```python
from typing import List, Optional, Dict, Any

def process_tweets(tweets: List[Dict[str, Any]]) -> int:
    """Process tweets and return count."""
    ...
```

**Docstrings:**
```python
def sync_bookmarks(cursor: Optional[str] = None) -> Dict[str, Any]:
    """
    Sync bookmarks from Twitter API to local database.
    
    Args:
        cursor: Pagination cursor for resuming sync
        
    Returns:
        Dictionary with sync statistics
        
    Raises:
        HTTPException: If Twitter API authentication fails
    """
    ...
```

### Code Formatting

**Install Black formatter:**
```bash
pip install black
```

**Format code:**
```bash
black app/
```

**Install isort (import sorting):**
```bash
pip install isort
black app/ --check-only  # Check without modifying
```

**Format imports:**
```bash
isort app/
```

### Linting

**Install flake8:**
```bash
pip install flake8
```

**Lint code:**
```bash
flake8 app/ --max-line-length=88 --extend-ignore=E203
```

---

## Git Workflow

### Branching Strategy

```bash
# Feature branch
git checkout -b feature/search-bookmarks
# Make changes
git add .
git commit -m "Add bookmark search endpoint"
git push origin feature/search-bookmarks
# Create pull request

# Bugfix branch
git checkout -b fix/category-validation
# Make changes
git commit -m "Fix category name validation"
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

**Examples:**
```
feat(api): add bookmark search endpoint

Implements full-text search on tweet text field with pagination support.

Closes #42
```

```
fix(sync): handle cursor loop detection

Prevents infinite loop when Twitter API returns same cursor twice.
```

---

## Troubleshooting

### Common Issues

**1. ModuleNotFoundError: No module named 'app'**

**Solution:**
```bash
# Ensure you're in project root
cd twitter_bookmark_manager

# Run as module
python -m app.main

# Or with PYTHONPATH
PYTHONPATH=. python app/main.py
```

**2. pydantic_core._pydantic_core.ValidationError on startup**

**Solution:** Check `.env` file has all required variables
```bash
cat .env
# Verify all TWITTER_* and DATABASE_URL are set
```

**3. sqlalchemy.exc.OperationalError: database is locked**

**Solution:**
```bash
# Close other SQLite connections
# Or use WAL mode for concurrent access
sqlite3 twitter_bookmarks.db "PRAGMA journal_mode=WAL;"
```

**4. Twitter API returns 401 Unauthorized**

**Solution:**
- Extract fresh credentials from browser
- Ensure cookies haven't expired (re-login to Twitter)
- Verify bearer token is complete (no truncation)

**5. Port 8000 already in use**

**Solution:**
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uvicorn app.main:app --port 8001
```

---

## Performance Optimization

### Database Optimization

**Add indexes:**
```sql
CREATE INDEX idx_tweets_created_at ON tweets(created_at DESC);
CREATE INDEX idx_tweets_is_read ON tweets(is_read, is_deleted);
```

**Enable WAL mode:**
```sql
PRAGMA journal_mode=WAL;
```

**Analyze tables:**
```sql
ANALYZE;
```

### API Optimization

**Use pagination always:**
```python
# Bad
all_bookmarks = db.query(Tweet).all()  # Loads everything into memory

# Good
bookmarks = db.query(Tweet).offset(skip).limit(100).all()
```

**Avoid N+1 queries:**
```python
# Bad
for bookmark in bookmarks:
    categories = db.query(Category).join(...).filter_by(tweet_id=bookmark.id).all()

# Good
# Use eager loading or batch queries
```

---

## Deployment Considerations

### Production Checklist

- [ ] Set strong `DATABASE_URL` with production database path
- [ ] Add API authentication (API keys, OAuth)
- [ ] Implement rate limiting
- [ ] Enable CORS if building web UI
- [ ] Set up proper logging (not just print statements)
- [ ] Configure reverse proxy (Nginx, Caddy)
- [ ] Set up systemd service or Docker container
- [ ] Configure automated backups
- [ ] Monitor with health checks
- [ ] Set up error tracking (Sentry, etc.)

### Docker Deployment

**Create `Dockerfile`:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and run:**

```bash
docker build -t twitter-bookmarks .
docker run -d -p 8000:8000 --env-file .env twitter-bookmarks
```

---

## Related Documentation

- [Project Overview](./project-overview.md) - High-level summary
- [Architecture](./architecture.md) - System architecture
- [Data Models](./data-models.md) - Database schema
- [API Contracts](./api-contracts.md) - API documentation
- [Source Tree Analysis](./source-tree-analysis.md) - Code structure

---

**Generated:** 2026-01-19  
**Version:** 1.0.0
