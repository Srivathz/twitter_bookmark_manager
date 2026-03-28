# Project Overview: Twitter Bookmarks Manager

## Executive Summary

**Twitter Bookmarks Manager** is a FastAPI-based backend service that enables users to sync and manage their Twitter/X bookmarks locally. The application fetches bookmarks from Twitter's GraphQL API and stores them in a SQLite database, providing REST API endpoints for bookmark management, categorization, and search functionality.

## Project Information

- **Project Name:** Twitter Bookmarks Manager
- **Project Type:** Backend API Service
- **Repository Structure:** Monolith
- **Primary Language:** Python 3.x
- **Framework:** FastAPI 0.115.0
- **Database:** SQLite with SQLAlchemy ORM 2.0.36
- **API Style:** RESTful

## Purpose & Goals

The application addresses the need for local bookmark management from Twitter/X by:
- **Syncing bookmarks** from Twitter via GraphQL API with pagination support
- **Storing locally** in SQLite for offline access and data ownership
- **Categorizing** bookmarks with custom categories for organization
- **Tracking read status** to manage reading progress
- **Preserving raw data** by storing complete JSON responses for future-proofing
- **Providing REST API** for integration with other tools and interfaces

## Technology Stack

**Primary Technologies:** FastAPI (web framework) + SQLite (database) + SQLAlchemy (ORM) + HTTPX (HTTP client)

**📚 See [Architecture Documentation](./architecture.md#technology-stack) for:**
- Complete technology stack with versions
- Design justifications for each component
- Middleware and configuration details

## Key Features

### 1. Twitter API Integration
- GraphQL-based bookmark fetching
- Full pagination support for large bookmark collections
- Authentication via bearer token and cookies
- Comprehensive feature flag support for API compatibility

### 2. Data Management
- **Tweet Storage:** Full tweet metadata, author info, timestamps, media flags
- **Categorization:** Custom category system with many-to-many relationships
- **Read Tracking:** Mark bookmarks as read/unread
- **Soft Deletes:** Preserve data integrity with is_deleted flags
- **Raw JSON Storage:** Complete API responses stored for data completeness
- **Advanced Filtering:** Server-side filtering by read status, category, and full-text search
- **Efficient Pagination:** Database-level pagination with filter support for optimal performance

### 3. REST API Endpoints
- `/sync` - Sync bookmarks from Twitter
- `/bookmarks` - List, filter, search, and paginate bookmarks
  - Filter by read status (`is_read=true/false`)
  - Filter by category (`category_id=N`)
  - Full-text search in tweet content and author username (`search=query`)
  - Infinite scroll support with efficient pagination
- `/bookmarks/{id}` - Update individual bookmark (read status, categories)
- `/categories` - Manage categories (create, list, soft delete)
- `/stats` - Database statistics and sync status
- `/health` - Health check endpoint

### 4. Sync State Management
- Complete sync history audit trail (new record per sync)
- Pagination cursor persistence
- Error logging for sync failures
- Statistics on bookmarks added/updated per sync

## Architecture Pattern

**Layered Architecture** with clear separation of concerns:

```
┌─────────────────────────────────┐
│     REST API Layer (FastAPI)    │  ← API Endpoints & Request Handling
├─────────────────────────────────┤
│    Business Logic Layer         │  ← Helper functions & data processing
├─────────────────────────────────┤
│    Data Access Layer (ORM)      │  ← SQLAlchemy models & queries
├─────────────────────────────────┤
│    External Service Layer       │  ← Twitter API client
├─────────────────────────────────┤
│  Configuration & Settings       │  ← Environment-based config
└─────────────────────────────────┘
         ↓
    SQLite Database
```

---

## Project Organization

The codebase follows a simple monolithic structure with clear separation:
- **Backend:** `app/` folder (FastAPI application, models, API client)
- **Documentation:** `docs/` folder (comprehensive guides and references)
- **Configuration:** Root-level files (`.env`, `requirements.txt`)

**📚 See [Source Tree Analysis](./source-tree-analysis.md) for:**
- Detailed file-by-file breakdown
- Code organization patterns
- Entry points and dependencies
- Line counts and structure

---

## Quick Start

### Prerequisites
- Python 3.8+
- Twitter/X account with valid authentication tokens

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Twitter credentials and database URL

# Run the server
python -m app.main
# or
uvicorn app.main:app --reload
```

### API Access
- Server runs on: `http://localhost:8000`
- API docs: `http://localhost:8000/docs` (Swagger UI)
- Health check: `http://localhost:8000/health`

## Database Schema

The application uses 4 main tables:

1. **tweets** - Bookmark storage with full metadata
2. **sync_state** - Sync history tracking (one record per sync)
3. **categories** - Custom category definitions
4. **tweet_categories** - Many-to-many relationship table

See [data-models.md](./data-models.md) for detailed schema documentation.

## API Documentation

See [api-contracts.md](./api-contracts.md) for complete API endpoint documentation.

## Development

See [development-guide.md](./development-guide.md) for development workflow, testing, and contribution guidelines.

---

**Generated:** 2026-01-19  
**Documentation Version:** 1.0.0
