"""
Configuration management for the Twitter bookmarks application.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Twitter API credentials
    twitter_bearer_token: str
    twitter_csrf_token: str
    twitter_cookies: str
    twitter_graphql_query_id: str = "43OUXyQe2KB6BLfli5CFPA"
    
    # Database
    database_url: str
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


def get_settings() -> Settings:
    """Get application settings."""
    return Settings()
