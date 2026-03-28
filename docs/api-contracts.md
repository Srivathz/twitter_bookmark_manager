# API Contracts: Twitter Bookmarks Manager

## Overview

The Twitter Bookmarks Manager provides a **RESTful HTTP API** built with **FastAPI**. All endpoints accept and return JSON payloads with automatic validation via Pydantic schemas.

**Base URL:** `http://localhost:8000` (default local development)  
**API Documentation:** `http://localhost:8000/docs` (Swagger UI)  
**Alternative Docs:** `http://localhost:8000/redoc` (ReDoc)

**Content Type:** `application/json` for all requests and responses

---

## Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | API information and endpoint list |
| `/health` | GET | Health check and database status |
| `/stats` | GET | Database statistics |
| `/sync` | POST | Sync bookmarks from Twitter |
| `/bookmarks` | GET | List bookmarks with filtering, search, and pagination |
| `/bookmarks/{id}` | PATCH | Update bookmark (read status, categories) |
| `/categories` | GET | List all categories |
| `/categories` | POST | Create new category |
| `/categories/{id}` | DELETE | Soft delete category |

---

## Core Endpoints

### GET `/`

**Purpose:** Root endpoint providing API information

**Authentication:** None  
**Rate Limiting:** None

**Request:**
```http
GET / HTTP/1.1
Host: localhost:8000
```

**Response:**
```json
{
  "name": "Twitter Bookmarks Manager API",
  "version": "1.0.0",
  "endpoints": {
    "/sync": "POST - Sync bookmarks from Twitter",
    "/health": "GET - Health check",
    "/stats": "GET - Get database statistics",
    "/bookmarks": "GET - List bookmarks with filtering (is_read, category_id, search) and pagination",
    "/bookmarks/{id}": "PATCH - Update bookmark (toggle read/unread, manage categories)",
    "/categories": "GET - List all categories, POST - Create a new category",
    "/categories/{id}": "DELETE - Mark a category as deleted"
  }
}
```

**Status Codes:**
- `200 OK` - Always returns successfully

---

### GET `/health`

**Purpose:** Health check endpoint for monitoring

**Authentication:** None

**Request:**
```http
GET /health HTTP/1.1
Host: localhost:8000
```

**Response (Healthy):**
```json
{
  "status": "healthy",
  "database": "connected",
  "last_sync": "2026-01-16T14:25:33Z"
}
```

**Response (Unhealthy):**
```json
{
  "detail": "Health check failed: unable to connect to database"
}
```

**Status Codes:**
- `200 OK` - Service is healthy
- `500 Internal Server Error` - Service is unhealthy

**Use Cases:**
- Docker container health checks
- Load balancer health probes
- Monitoring systems (Prometheus, Datadog, etc.)

---

### GET `/stats`

**Purpose:** Get statistics about stored bookmarks and sync history

**Authentication:** None

**Request:**
```http
GET /stats HTTP/1.1
Host: localhost:8000
```

**Response:**
```json
{
  "total_bookmarks": 1523,
  "read": 487,
  "unread": 1036,
  "with_images": 892,
  "with_videos": 234,
  "last_sync_started": "2026-01-16T14:22:10Z",
  "last_sync_completed": "2026-01-16T14:25:33Z",
  "last_error": null
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `total_bookmarks` | integer | Total active bookmarks (not deleted) |
| `read` | integer | Count of bookmarks marked as read |
| `unread` | integer | Count of unread bookmarks |
| `with_images` | integer | Bookmarks containing images |
| `with_videos` | integer | Bookmarks containing videos/GIFs |
| `last_sync_started` | string\|null | ISO 8601 timestamp of last sync start |
| `last_sync_completed` | string\|null | ISO 8601 timestamp of last sync completion |
| `last_error` | string\|null | Error message from last failed sync (first 1000 chars) |

**Status Codes:**
- `200 OK` - Statistics retrieved successfully
- `500 Internal Server Error` - Database query failed

---

## Sync Endpoints

### POST `/sync`

**Purpose:** Sync bookmarks from Twitter API to local database

**Authentication:** Requires Twitter credentials in environment variables  
**Async Operation:** Long-running (30s to several minutes depending on bookmark count)

**Request:**
```http
POST /sync HTTP/1.1
Host: localhost:8000
Content-Length: 0
```

**Response:**
```json
{
  "status": "success",
  "sync_started_at": "2026-01-16T14:22:10Z",
  "sync_completed_at": "2026-01-16T14:25:33Z",
  "pages_fetched": 15,
  "total_fetched": 1500,
  "new_bookmarks": 42,
  "updated_bookmarks": 7
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always "success" on successful completion |
| `sync_started_at` | string | ISO 8601 timestamp when sync began |
| `sync_completed_at` | string | ISO 8601 timestamp when sync finished |
| `pages_fetched` | integer | Number of API pages fetched (100 bookmarks per page) |
| `total_fetched` | integer | Total bookmarks fetched from API |
| `new_bookmarks` | integer | Count of new bookmarks inserted |
| `updated_bookmarks` | integer | Count of existing bookmarks updated |

**Status Codes:**
- `200 OK` - Sync completed successfully
- `500 Internal Server Error` - Sync failed (check `last_error` in `/stats`)

**Error Response:**
```json
{
  "detail": "Sync failed: Twitter API authentication error"
}
```

**Behavior:**
1. Fetches bookmarks from Twitter GraphQL API (100 per page)
2. Inserts new bookmarks or updates existing ones (by `tweet_id`)
3. Stores pagination cursor for resumability
4. Stops when:
   - No more pages (next_cursor is null)
   - Reached last synced bookmark (incremental sync)
   - Cursor loop detected (same cursor returned twice)
5. Updates sync_state table with statistics

**Incremental Sync:**
- Only fetches bookmarks added since last sync
- Stops when encountering previously synced bookmark
- Efficient for regular syncing (e.g., daily cron job)

**Notes:**
- Can take minutes for first sync with 1000s of bookmarks
- Consider running in background for large collections
- Respects Twitter API rate limits (no explicit rate limiting implemented)

---

## Bookmark Endpoints

### GET `/bookmarks`

**Purpose:** List bookmarks with filtering, search, and pagination

**Authentication:** None  
**Default Sort:** By tweet `created_at` descending (newest first)

**Request:**
```http
GET /bookmarks?skip=0&limit=20&is_read=true&category_id=5&search=ai HTTP/1.1
Host: localhost:8000
```

**Query Parameters:**

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `skip` | integer | 0 | - | Number of records to skip (pagination offset) |
| `limit` | integer | 100 | 1000 | Maximum records to return |
| `is_read` | boolean | None | - | Filter by read status (true/false, optional) |
| `category_id` | integer | None | - | Filter by category ID (optional) |
| `search` | string | None | - | Search in text and author username (case-insensitive, optional) |

**Response:**
```json
{
  "total": 1523,
  "skip": 0,
  "limit": 100,
  "count": 100,
  "bookmarks": [
    {
      "id": 1,
      "tweet_id": "1234567890123456789",
      "text": "Excited to announce our new product launch! 🚀",
      "author_id": "9876543210987654321",
      "author_username": "johndoe",
      "created_at": "2026-01-15T10:30:00Z",
      "bookmarked_at": "2026-01-16T14:22:10Z",
      "is_read": false,
      "has_media_image": true,
      "has_media_video": false,
      "url": "https://x.com/johndoe/status/1234567890123456789",
      "inserted_at": "2026-01-16T14:22:10Z",
      "updated_at": "2026-01-16T14:22:10Z"
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total count of bookmarks matching the filters |
| `skip` | integer | Offset used in query (echoes request param) |
| `limit` | integer | Limit used in query (capped at 1000) |
| `count` | integer | Actual number of bookmarks returned in this response |
| `bookmarks` | array | Array of bookmark objects |

**Bookmark Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Internal surrogate key |
| `tweet_id` | string | Twitter's snowflake ID |
| `text` | string | Tweet content |
| `author_id` | string | Tweet author's user ID |
| `author_username` | string | Tweet author's username/handle |
| `created_at` | string | When tweet was created (ISO 8601) |
| `bookmarked_at` | string | When user bookmarked it (ISO 8601) |
| `is_read` | boolean | Read status (true/false) |
| `has_media_image` | boolean | Contains images |
| `has_media_video` | boolean | Contains videos or GIFs |
| `url` | string | Canonical tweet URL |
| `inserted_at` | string | When record was inserted (ISO 8601) |
| `updated_at` | string | Last update timestamp (ISO 8601) |

**Status Codes:**
- `200 OK` - Bookmarks retrieved successfully
- `500 Internal Server Error` - Database query failed

**Pagination Example:**

```bash
# Get first 20 bookmarks
curl "http://localhost:8000/bookmarks?skip=0&limit=20"

# Get next 20 bookmarks
curl "http://localhost:8000/bookmarks?skip=20&limit=20"

# Get only unread bookmarks
curl "http://localhost:8000/bookmarks?is_read=false&limit=20"

# Get read bookmarks in a specific category
curl "http://localhost:8000/bookmarks?is_read=true&category_id=5&limit=20"

# Search for bookmarks containing "AI"
curl "http://localhost:8000/bookmarks?search=ai&limit=20"

# Combine filters: unread AI-related bookmarks
curl "http://localhost:8000/bookmarks?is_read=false&search=ai&limit=20"
```

**Filter Behavior:**
- **is_read**: When omitted, returns all bookmarks regardless of read status
  - `is_read=true`: Only read bookmarks
  - `is_read=false`: Only unread bookmarks
- **category_id**: When omitted, returns bookmarks from all categories
  - Filters bookmarks that have been assigned to the specified category
- **search**: When omitted, no text filtering is applied
  - Case-insensitive substring match in tweet text AND author username
  - Uses SQL `ILIKE` for pattern matching
- **Multiple filters**: All filters are combined with AND logic
- **Pagination**: Works correctly with all filter combinations
- **Total count**: Reflects the count of bookmarks matching the applied filters

**Notes:**
- Always excludes soft-deleted bookmarks (`is_deleted=0`)
- Categories are NOT included in list response (use PATCH endpoint to get categories)
- `limit` is automatically capped at 1000 for performance
- Filters are applied at the database level for optimal performance
- Search uses case-insensitive pattern matching
- Filtering by category uses a JOIN with the `tweet_categories` table

---

### PATCH `/bookmarks/{id}`

**Purpose:** Update a bookmark's read status and manage category assignments

**Authentication:** None

**Request:**
```http
PATCH /bookmarks/1 HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "is_read": true,
  "add_categories": [1, 3],
  "remove_categories": [2]
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Internal bookmark ID (from `/bookmarks` response) |

**Request Body (all fields optional):**

| Field | Type | Description |
|-------|------|-------------|
| `is_read` | boolean\|null | Set read status (true=read, false=unread, null=no change) |
| `add_categories` | integer[]\|null | Array of category IDs to assign to this bookmark |
| `remove_categories` | integer[]\|null | Array of category IDs to remove from this bookmark |

**Response:**
```json
{
  "status": "success",
  "message": "Bookmark updated: is_read=true, added category 'Tech News', added category 'Inspiration', removed category 'To Read'",
  "bookmark": {
    "id": 1,
    "tweet_id": "1234567890123456789",
    "text": "Excited to announce our new product launch! 🚀",
    "author_username": "johndoe",
    "is_read": true,
    "url": "https://x.com/johndoe/status/1234567890123456789",
    "updated_at": "2026-01-19T10:00:00Z",
    "categories": [
      {
        "id": 1,
        "name": "Tech News",
        "description": "Latest technology and software development news"
      },
      {
        "id": 3,
        "name": "Inspiration",
        "description": "Motivational and inspiring content"
      }
    ]
  },
  "changes": {
    "read_status_changed": true,
    "categories_added": ["Tech News", "Inspiration"],
    "categories_removed": ["To Read"]
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | "success" on successful update |
| `message` | string | Human-readable summary of changes made |
| `bookmark` | object | Updated bookmark with core fields and current categories |
| `changes` | object | Detailed breakdown of what changed |

**Status Codes:**
- `200 OK` - Bookmark updated successfully
- `404 Not Found` - Bookmark with given ID not found
- `409 Conflict` - Category already assigned or doesn't exist
- `500 Internal Server Error` - Database update failed

**Error Responses:**

**Bookmark not found:**
```json
{
  "detail": "Bookmark with id 999 not found"
}
```

**Category not found:**
```json
{
  "detail": "Category with id 99 not found"
}
```

**Use Cases:**

1. **Mark as read:**
```json
{"is_read": true}
```

2. **Mark as unread:**
```json
{"is_read": false}
```

3. **Add to category:**
```json
{"add_categories": [1]}
```

4. **Move between categories:**
```json
{
  "remove_categories": [2],
  "add_categories": [3, 4]
}
```

5. **Combined update:**
```json
{
  "is_read": true,
  "add_categories": [1]
}
```

**Notes:**
- All fields are optional - send only what you want to change
- Adding an already-assigned category is silently ignored
- Removing a non-assigned category is silently ignored
- Categories are returned in current response
- `updated_at` timestamp is automatically updated

---

## Category Endpoints

### GET `/categories`

**Purpose:** List all categories

**Authentication:** None

**Request:**
```http
GET /categories?include_deleted=false HTTP/1.1
Host: localhost:8000
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include_deleted` | boolean | false | Include soft-deleted categories |

**Response:**
```json
{
  "total": 3,
  "categories": [
    {
      "id": 1,
      "name": "Tech News",
      "description": "Latest technology and software development news",
      "created_at": "2026-01-10T09:00:00Z",
      "updated_at": "2026-01-10T09:00:00Z",
      "is_deleted": false
    },
    {
      "id": 2,
      "name": "Inspiration",
      "description": "Motivational and inspiring content",
      "created_at": "2026-01-12T11:30:00Z",
      "updated_at": "2026-01-12T11:30:00Z",
      "is_deleted": false
    },
    {
      "id": 3,
      "name": "Tutorials",
      "description": "Educational content and how-to guides",
      "created_at": "2026-01-10T09:05:00Z",
      "updated_at": "2026-01-10T09:05:00Z",
      "is_deleted": false
    }
  ]
}
```

**Category Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Category identifier |
| `name` | string | Category name (max 120 chars) |
| `description` | string\|null | Optional description |
| `created_at` | string | Creation timestamp (ISO 8601) |
| `updated_at` | string | Last update timestamp (ISO 8601) |
| `is_deleted` | boolean | Soft delete flag |

**Status Codes:**
- `200 OK` - Categories retrieved successfully
- `500 Internal Server Error` - Database query failed

**Notes:**
- Results sorted alphabetically by name
- Default behavior excludes deleted categories
- Use `include_deleted=true` to see full history

---

### POST `/categories`

**Purpose:** Create a new category

**Authentication:** None

**Request:**
```http
POST /categories HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "name": "Machine Learning",
  "description": "AI and ML research papers and articles"
}
```

**Request Body:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | string | Yes | 1-120 chars | Category name |
| `description` | string\|null | No | - | Optional description |

**Response (201 Created):**
```json
{
  "id": 4,
  "name": "Machine Learning",
  "description": "AI and ML research papers and articles",
  "created_at": "2026-01-19T10:00:00Z",
  "updated_at": "2026-01-19T10:00:00Z",
  "is_deleted": false
}
```

**Status Codes:**
- `201 Created` - Category created successfully
- `400 Bad Request` - Validation failed (empty name or too long)
- `409 Conflict` - Category with this name already exists
- `422 Unprocessable Entity` - Invalid JSON or missing required field
- `500 Internal Server Error` - Database insert failed

**Error Responses:**

**Empty name:**
```json
{
  "detail": "Category name cannot be empty"
}
```

**Name too long:**
```json
{
  "detail": "Category name cannot exceed 120 characters"
}
```

**Duplicate name:**
```json
{
  "detail": "Category with name 'Tech News' already exists"
}
```

**Validation error (Pydantic):**
```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Notes:**
- Name is trimmed (leading/trailing whitespace removed)
- Case-sensitive uniqueness check
- Description can be null or empty string

---

### DELETE `/categories/{id}`

**Purpose:** Soft delete a category

**Authentication:** None

**Request:**
```http
DELETE /categories/1 HTTP/1.1
Host: localhost:8000
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Category ID to delete |

**Response:**
```json
{
  "status": "success",
  "message": "Category 'Tech News' marked as deleted",
  "category": {
    "id": 1,
    "name": "Tech News",
    "description": "Latest technology and software development news",
    "is_deleted": true,
    "deleted_at": "2026-01-19T10:30:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Category deleted successfully
- `404 Not Found` - Category with given ID not found
- `410 Gone` - Category already deleted
- `500 Internal Server Error` - Database update failed

**Error Responses:**

**Not found:**
```json
{
  "detail": "Category with id 999 not found"
}
```

**Already deleted:**
```json
{
  "detail": "Category 'Tech News' is already deleted"
}
```

**Notes:**
- **Soft delete:** Record remains in database with `is_deleted=1`
- **No cascade:** Existing tweet-category assignments are NOT removed
- **Prevents reassignment:** Deleted categories won't appear in category lists
- **Recoverable:** Can be manually undeleted by setting `is_deleted=0` in database

---

## Error Handling

### Standard Error Response Format

All error responses follow FastAPI's HTTPException format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Code Guide

| Code | Meaning | When Used |
|------|---------|-----------|
| `200 OK` | Success | Successful GET, PATCH, DELETE |
| `201 Created` | Resource created | Successful POST |
| `400 Bad Request` | Client error | Validation failed |
| `404 Not Found` | Resource not found | Invalid ID |
| `409 Conflict` | Duplicate resource | Category name already exists |
| `410 Gone` | Resource deleted | Accessing already-deleted category |
| `422 Unprocessable Entity` | Invalid JSON | Pydantic validation error |
| `500 Internal Server Error` | Server error | Database error, unexpected exception |

### Common Error Scenarios

**1. Invalid JSON:**
```http
POST /categories
Content-Type: application/json

{invalid json}
```
→ `422 Unprocessable Entity`

**2. Missing Required Field:**
```http
POST /categories
Content-Type: application/json

{"description": "Missing name field"}
```
→ `422 Unprocessable Entity` with Pydantic validation details

**3. Database Connection Lost:**
```http
GET /bookmarks
```
→ `500 Internal Server Error` with error message

**4. Twitter API Credentials Invalid:**
```http
POST /sync
```
→ `500 Internal Server Error: Sync failed: Twitter API authentication error`

---

## Request/Response Examples

### Example: Complete Workflow

**1. Create categories:**
```bash
curl -X POST http://localhost:8000/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "To Read", "description": "Bookmarks to read later"}'

curl -X POST http://localhost:8000/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Tech News"}'
```

**2. Sync bookmarks:**
```bash
curl -X POST http://localhost:8000/sync
```

**3. List bookmarks:**
```bash
curl http://localhost:8000/bookmarks?limit=10
```

**4. Mark bookmark as read and categorize:**
```bash
curl -X PATCH http://localhost:8000/bookmarks/1 \
  -H "Content-Type: application/json" \
  -d '{"is_read": true, "add_categories": [1, 2]}'
```

**5. Get statistics:**
```bash
curl http://localhost:8000/stats
```

---

## Interactive API Documentation

FastAPI provides **auto-generated interactive API documentation**:

### Swagger UI
- **URL:** `http://localhost:8000/docs`
- **Features:**
  - Try out endpoints directly from browser
  - See request/response schemas
  - View validation rules
  - Test authentication

### ReDoc
- **URL:** `http://localhost:8000/redoc`
- **Features:**
  - Clean, readable documentation
  - Search functionality
  - Export to OpenAPI spec

### OpenAPI Spec (JSON)
- **URL:** `http://localhost:8000/openapi.json`
- **Use Cases:**
  - Import into Postman
  - Generate client SDKs
  - API testing tools

---

## Rate Limiting & Performance

### Current Implementation
- **No rate limiting** on API endpoints (local use)
- **No authentication** (local use)
- **Max limit:** 1000 records per request (pagination)

### Production Recommendations
1. **Add API Key Authentication:**
```python
from fastapi import Header

async def verify_api_key(x_api_key: str = Header()):
    if x_api_key != settings.api_key:
        raise HTTPException(401, "Invalid API key")
```

2. **Implement Rate Limiting:**
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/sync")
@limiter.limit("5/hour")
async def sync_bookmarks(...):
    ...
```

3. **Add CORS if building web UI:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Versioning

**Current Version:** 1.0.0  
**API Version:** No explicit versioning (breaking changes will increment major version)

**Future Versioning Strategy:**
- URL-based: `/v1/bookmarks`, `/v2/bookmarks`
- Header-based: `Accept: application/vnd.twitter-bookmarks.v1+json`

---

## Related Documentation

- [Architecture](./architecture.md) - System architecture and data flow
- [Data Models](./data-models.md) - Database schema details
- [Development Guide](./development-guide.md) - Local setup and testing

---

**Generated:** 2026-01-19  
**Version:** 1.0.0
