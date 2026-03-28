# Database Schema: Twitter Bookmarks Manager

## Overview

The Twitter Bookmarks Manager uses **SQLite** as its database with **SQLAlchemy ORM** for data access. The schema is designed for efficient storage and retrieval of Twitter bookmarks with support for categorization, read tracking, and sync state management.

**Database Type:** SQLite (file-based, serverless)  
**ORM:** SQLAlchemy 2.0.36  
**Migration Strategy:** Schema-as-code (SQLAlchemy creates tables on startup)

---

## Entity Relationship Diagram

```
┌─────────────────┐
│   sync_state    │
│  (audit trail)  │
│─────────────────│
│ id (PK) AUTO    │
│ last_sync_...   │
│ page_cursor     │
│ bookmarks_...   │
└─────────────────┘
         │
         │ sync_state_id (FK)
         ↓
┌─────────────────────┐           ┌──────────────────┐
│       tweets        │←──────┐   │   categories     │
│─────────────────────│       │   │──────────────────│
│ id (PK)             │       │   │ id (PK)          │
│ tweet_id (UNIQUE)   │       │   │ name (UNIQUE)    │
│ text                │       │   │ description      │
│ author_id           │       │   │ created_at       │
│ author_username     │       │   │ updated_at       │
│ created_at          │       │   │ is_deleted       │
│ bookmarked_at       │       │   └──────────────────┘
│ is_read             │       │            ↑
│ has_media_image     │       │            │
│ has_media_video     │       │    category_id (FK)
│ url                 │       │            │
│ source_json         │       └────────────┤
│ is_deleted          │              ┌─────┴────────────┐
│ inserted_at         │              │ tweet_categories │
│ updated_at          │              │──────────────────│
│ sync_state_id (FK)  │              │ tweet_id (PK,FK) │
└─────────────────────┘              │ category_id (PK,FK)
                                     │ added_at         │
                                     └──────────────────┘
```

**Relationships:**
- `tweets` → `sync_state` (many-to-one): Tracks which sync created/updated the tweet
- `tweets` ↔ `categories` (many-to-many via `tweet_categories`): Bookmarks can have multiple categories

---

## Table: `tweets`

**Purpose:** Store individual tweet bookmarks with full metadata

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Internal surrogate key |
| `tweet_id` | TEXT(32) | UNIQUE, NOT NULL, INDEX | Twitter's snowflake ID (unique identifier) |
| `text` | TEXT | NOT NULL | Tweet content (full_text or note_tweet text) |
| `author_id` | TEXT(32) | | Twitter user ID of tweet author |
| `author_username` | TEXT(50) | | Username/handle of tweet author |
| `created_at` | TEXT | NOT NULL | Tweet creation timestamp (ISO 8601) |
| `bookmarked_at` | TEXT | NOT NULL | When user bookmarked the tweet (ISO 8601) |
| `is_read` | INTEGER | NOT NULL, DEFAULT 0 | Read status: 0 = unread, 1 = read |
| `has_media_image` | INTEGER | NOT NULL, DEFAULT 0 | Contains images: 0 = no, 1 = yes |
| `has_media_video` | INTEGER | NOT NULL, DEFAULT 0 | Contains videos/GIFs: 0 = no, 1 = yes |
| `url` | TEXT | | Canonical tweet URL (https://x.com/{username}/status/{tweet_id}) |
| `source_json` | TEXT | | Raw JSON response from Twitter API (complete tweet object) |
| `is_deleted` | INTEGER | NOT NULL, DEFAULT 0 | Soft delete flag: 0 = active, 1 = deleted |
| `inserted_at` | TEXT | NOT NULL | When record was first inserted (ISO 8601) |
| `updated_at` | TEXT | NOT NULL | Last update timestamp (ISO 8601) |
| `sync_state_id` | INTEGER | | Foreign key to sync_state.id (which sync created/updated this) |

### Indexes
- **Unique Index on `tweet_id`:** Ensures no duplicate bookmarks, fast lookups
- **Index on `created_at`:** Optimizes sorting by tweet creation time (default sort order)

### Sample Data

```sql
INSERT INTO tweets (
    tweet_id, text, author_id, author_username, 
    created_at, bookmarked_at, is_read, 
    has_media_image, has_media_video, url, 
    source_json, is_deleted, inserted_at, updated_at, sync_state_id
) VALUES (
    '1234567890123456789',
    'Excited to announce our new product launch! 🚀',
    '9876543210987654321',
    'johndoe',
    '2026-01-15T10:30:00Z',
    '2026-01-16T14:22:10Z',
    0,
    1,
    0,
    'https://x.com/johndoe/status/1234567890123456789',
    '{"rest_id": "1234567890123456789", ...}',
    0,
    '2026-01-16T14:22:10Z',
    '2026-01-16T14:22:10Z',
    1
);
```

### Business Rules

1. **Uniqueness:** `tweet_id` is unique - if a tweet is re-synced, it updates existing record
2. **Soft Deletes:** Records are never physically deleted, only marked with `is_deleted=1`
3. **Timestamps:** All timestamps stored as ISO 8601 strings in UTC
4. **Media Flags:** Boolean stored as INTEGER (0/1) for SQLite compatibility
5. **Raw JSON:** Complete API response preserved in `source_json` for future-proofing

---

## Table: `sync_state`

**Purpose:** Track synchronization state and statistics (one record per sync)

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Auto-incrementing sync record ID |
| `last_sync_started_at` | TEXT | | ISO 8601 timestamp when last sync began |
| `last_sync_completed_at` | TEXT | | ISO 8601 timestamp when last sync completed |
| `last_seen_marker` | TEXT | | Last successfully processed bookmark ID (legacy field) |
| `last_error` | TEXT | | Error message from last failed sync (first 1000 chars) |
| `page_cursor` | TEXT | | Twitter API pagination cursor for resuming sync |
| `bookmarks_added` | INTEGER | | Count of new bookmarks in last sync |
| `bookmarks_updated` | INTEGER | | Count of updated bookmarks in last sync |

### Auto-Increment Primary Key

```sql
CREATE TABLE sync_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ...
);
```

**Creates a new record for each sync** - maintains complete sync history

### Sample Data

```sql
-- First sync
INSERT INTO sync_state (
    last_sync_started_at, last_sync_completed_at, 
    last_seen_marker, last_error, page_cursor, 
    bookmarks_added, bookmarks_updated
) VALUES (
    '2026-01-16T14:22:10Z',
    '2026-01-16T14:25:33Z',
    NULL,
    NULL,
    'DAABCgABGFvLjfcKAAIZW8qm5wgAAwAAAAIAAA',
    42,
    7
);
-- id will be auto-assigned as 1

-- Second sync
INSERT INTO sync_state (
    last_sync_started_at, last_sync_completed_at, 
    bookmarks_added, bookmarks_updated
) VALUES (
    '2026-01-17T10:15:00Z',
    '2026-01-17T10:16:30Z',
    5,
    2
);
-- id will be auto-assigned as 2
```

### Business Rules

1. **New Record Per Sync:** Each sync operation creates a new sync_state record
2. **Auto-Increment ID:** Primary key automatically increments for each sync
3. **Sync Tracking:** Record created at sync start, updated during pagination and at completion
4. **Error Logging:** Truncated to 1000 characters to prevent overflow
5. **Cursor Persistence:** Enables resuming large syncs across sessions
6. **History Maintained:** All sync records are preserved for audit trail

---

## Table: `categories`

**Purpose:** User-defined categories for organizing bookmarks

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Category identifier |
| `name` | TEXT(120) | UNIQUE, NOT NULL | Category name (user-facing) |
| `description` | TEXT | | Optional description of category purpose |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp when created |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp of last update |
| `is_deleted` | INTEGER | NOT NULL, DEFAULT 0 | Soft delete: 0 = active, 1 = deleted |

### Indexes
- **Unique Index on `name`:** Prevents duplicate category names
- **Index on `is_deleted`:** Optimizes queries filtering active categories

### Sample Data

```sql
INSERT INTO categories (name, description, created_at, updated_at, is_deleted)
VALUES 
    ('Tech News', 'Latest technology and software development news', '2026-01-10T09:00:00Z', '2026-01-10T09:00:00Z', 0),
    ('Tutorials', 'Educational content and how-to guides', '2026-01-10T09:05:00Z', '2026-01-10T09:05:00Z', 0),
    ('Inspiration', 'Motivational and inspiring content', '2026-01-12T11:30:00Z', '2026-01-12T11:30:00Z', 0);
```

### Business Rules

1. **Uniqueness:** Category names must be unique among active categories
2. **Length Limit:** Maximum 120 characters for name
3. **Soft Delete:** Deleted categories remain in database with `is_deleted=1`
4. **Name Trimming:** Leading/trailing whitespace removed before storage
5. **Case Sensitivity:** SQLite is case-insensitive by default for TEXT

---

## Table: `tweet_categories`

**Purpose:** Junction table implementing many-to-many relationship between tweets and categories

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `tweet_id` | INTEGER | PRIMARY KEY, FOREIGN KEY → tweets.id | Reference to tweet |
| `category_id` | INTEGER | PRIMARY KEY, FOREIGN KEY → categories.id | Reference to category |
| `added_at` | TEXT | NOT NULL | ISO 8601 timestamp when assignment was created |

### Composite Primary Key

```sql
PRIMARY KEY (tweet_id, category_id)
```

**Ensures unique pairing** - a tweet can be assigned to a category only once

### Foreign Keys

```sql
FOREIGN KEY (tweet_id) REFERENCES tweets(id)
FOREIGN KEY (category_id) REFERENCES categories(id)
```

### Sample Data

```sql
-- Assign tweet #1 to "Tech News" and "Tutorials"
INSERT INTO tweet_categories (tweet_id, category_id, added_at)
VALUES 
    (1, 1, '2026-01-16T15:00:00Z'),  -- Tweet 1 → Tech News
    (1, 2, '2026-01-16T15:01:00Z');  -- Tweet 1 → Tutorials

-- Assign tweet #2 to "Inspiration"
INSERT INTO tweet_categories (tweet_id, category_id, added_at)
VALUES 
    (2, 3, '2026-01-16T16:30:00Z');  -- Tweet 2 → Inspiration
```

### Business Rules

1. **Referential Integrity:** Cannot assign non-existent tweets or categories
2. **No Duplicates:** Composite PK prevents duplicate assignments
3. **Hard Delete:** Records are physically deleted (not soft delete)
4. **Timestamp Tracking:** Records when assignment was made (audit trail)
5. **No Cascade Delete:** If tweet/category is soft-deleted, assignments remain

---

## Data Types & Conventions

### Text Columns (ISO 8601 Timestamps)

All timestamp fields use **TEXT** type with ISO 8601 format:

```
Format: YYYY-MM-DDTHH:MM:SSZ
Example: 2026-01-19T14:30:00Z
```

**Rationale:**
- SQLite has limited native datetime support
- ISO 8601 is sortable as strings
- UTC timezone consistency
- Human-readable in raw queries

### Boolean as INTEGER

SQLite lacks native BOOLEAN type. Convention:
- `0` = False/No
- `1` = True/Yes

**Columns using this pattern:**
- `is_read`, `is_deleted`, `has_media_image`, `has_media_video`

### TEXT Length Limits

| Column | Max Length | Enforcement |
|--------|-----------|-------------|
| `tweet_id` | 32 chars | Twitter snowflake ID format |
| `author_id` | 32 chars | Twitter user ID format |
| `author_username` | 50 chars | Twitter username max length |
| `categories.name` | 120 chars | Application validation |
| `sync_state.last_error` | 1000 chars | Truncated on insert |

---

## Query Patterns

### Common Queries

**1. Get all unread bookmarks ordered by creation date:**
```sql
SELECT * FROM tweets
WHERE is_deleted = 0 AND is_read = 0
ORDER BY created_at DESC
LIMIT 100;
```

**2. Get bookmarks with their categories:**
```sql
SELECT 
    t.*,
    GROUP_CONCAT(c.name) as category_names
FROM tweets t
LEFT JOIN tweet_categories tc ON t.id = tc.tweet_id
LEFT JOIN categories c ON tc.category_id = c.id AND c.is_deleted = 0
WHERE t.is_deleted = 0
GROUP BY t.id
ORDER BY t.created_at DESC;
```

**3. Get statistics:**
```sql
SELECT 
    COUNT(*) as total,
    SUM(is_read) as read_count,
    SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count,
    SUM(has_media_image) as with_images,
    SUM(has_media_video) as with_videos
FROM tweets
WHERE is_deleted = 0;
```

**4. Get bookmarks by category:**
```sql
SELECT t.*
FROM tweets t
JOIN tweet_categories tc ON t.id = tc.tweet_id
JOIN categories c ON tc.category_id = c.id
WHERE c.name = 'Tech News'
  AND t.is_deleted = 0
  AND c.is_deleted = 0
ORDER BY t.created_at DESC;
```

**5. Find duplicate bookmarks (shouldn't exist):**
```sql
SELECT tweet_id, COUNT(*) as count
FROM tweets
WHERE is_deleted = 0
GROUP BY tweet_id
HAVING count > 1;
```

---

## Database Initialization

### Schema Creation

SQLAlchemy automatically creates tables on first run via:

```python
from app.models import Base, get_engine, init_db

engine = get_engine("sqlite:///./twitter_bookmarks.db")
init_db(engine)  # Creates all tables
```

### Initialization Process

1. **Create Engine:** Connect to SQLite file
2. **Create All Tables:** `Base.metadata.create_all(engine)` automatically creates the schema
3. **No Initial Data Required:** Tables are created empty - the first `/sync` operation will create the first `SyncState` record

### No Migration Files

**Current Strategy:** Schema as code
- No Alembic migrations
- Schema changes require manual database updates or recreation

**Future Enhancement:** Add Alembic for production deployments

---

## Performance Considerations

### Indexes

**Existing Indexes:**
- `tweets.tweet_id` (UNIQUE constraint creates index)
- `categories.name` (UNIQUE constraint creates index)
- `tweet_categories (tweet_id, category_id)` (composite PK creates index)

**Recommended Additional Indexes:**

```sql
-- Optimize filtering by read status
CREATE INDEX idx_tweets_is_read ON tweets(is_read, is_deleted);

-- Optimize sorting by created_at (DESC is most common)
CREATE INDEX idx_tweets_created_at_desc ON tweets(created_at DESC);

-- Optimize category filtering
CREATE INDEX idx_tweet_categories_category_id ON tweet_categories(category_id);
```

### Query Optimization Tips

1. **Always filter `is_deleted=0`** to exclude soft-deleted records
2. **Use pagination** for large result sets (`LIMIT` + `OFFSET`)
3. **Avoid `SELECT *`** in production - specify needed columns
4. **Use `COUNT(*)` without fetching rows** for statistics
5. **Consider EXPLAIN QUERY PLAN** for slow queries

---

## Data Integrity Rules

### Referential Integrity

**Foreign Keys Enabled:**
```python
# SQLAlchemy enforces FKs by default
PRAGMA foreign_keys = ON;
```

**Relationships:**
- `tweets.sync_state_id` → `sync_state.id` (optional)
- `tweet_categories.tweet_id` → `tweets.id` (required)
- `tweet_categories.category_id` → `categories.id` (required)

### Constraints Summary

| Constraint Type | Tables | Purpose |
|----------------|--------|---------|
| PRIMARY KEY | All tables | Unique row identifier |
| UNIQUE | tweets.tweet_id, categories.name | Prevent duplicates |
| NOT NULL | tweets.text, categories.name, etc. | Required fields |
| AUTOINCREMENT | sync_state.id, tweets.id, categories.id | Auto-incrementing IDs |
## Backup & Maintenance

### Backup Strategy

**SQLite File-Based Backup:**
```bash
# Simple file copy (stop application first)
cp twitter_bookmarks.db twitter_bookmarks.db.backup

# SQLite backup command (safe while running)
sqlite3 twitter_bookmarks.db ".backup twitter_bookmarks.db.backup"
```

**Scheduled Backups:**
```bash
# Cron job example (daily at 2 AM)
0 2 * * * sqlite3 /path/to/twitter_bookmarks.db ".backup /path/to/backups/twitter_bookmarks-$(date +\%Y\%m\%d).db"
```

### Maintenance Tasks

**1. Vacuum (Reclaim Space):**
```sql
VACUUM;
```

**2. Analyze (Update Statistics):**
```sql
ANALYZE;
```

**3. Integrity Check:**
```sql
PRAGMA integrity_check;
```

**4. Purge Old Soft-Deleted Records:**
```sql
-- After archiving, hard delete records older than 90 days
DELETE FROM tweets 
WHERE is_deleted = 1 
  AND updated_at < date('now', '-90 days');
```

---

## Migration Considerations

### Future Schema Changes

If migrating to production with Alembic:

```python
# Example migration for adding full-text search
def upgrade():
    op.execute("""
        CREATE VIRTUAL TABLE tweets_fts USING fts5(
            tweet_id, text, author_username,
            content=tweets
        );
    """)
    op.execute("""
        INSERT INTO tweets_fts(tweet_id, text, author_username)
        SELECT tweet_id, text, author_username FROM tweets;
    """)
```

### Migrating to PostgreSQL

For multi-user deployments:

**Schema Changes Needed:**
- `INTEGER` → `BIGINT` for IDs
- `TEXT` → `VARCHAR(n)` with explicit lengths
- `is_read INTEGER` → `is_read BOOLEAN`
- Add `created_at TIMESTAMPTZ` native timestamp columns
- Add `user_id` column for multi-tenancy

---

## Related Documentation

- [Architecture](./architecture.md) - System architecture and data flow
- [API Contracts](./api-contracts.md) - API endpoints that interact with these models
- [Development Guide](./development-guide.md) - Database setup instructions

---

**Generated:** 2026-01-19  
**Version:** 1.0.0
