"""
Twitter API client for fetching bookmarks.
"""
import httpx
import json
import urllib.parse
from typing import Optional, Dict, Any, List
from app.config import Settings


class TwitterClient:
    """Client for interacting with Twitter's GraphQL API."""
    
    BASE_URL = "https://x.com/i/api/graphql"
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.base_url = self.BASE_URL
    
    def _build_headers(self) -> Dict[str, str]:
        """Build request headers with authentication."""
        return {
            "authorization": f"Bearer {self.settings.twitter_bearer_token}",
            "x-csrf-token": self.settings.twitter_csrf_token,
            "Cookie": self.settings.twitter_cookies,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
        }
    
    def _build_features(self) -> Dict[str, Any]:
        """Build the features parameter for the API request."""
        return {
            "rweb_video_screen_enabled": False,
            "profile_label_improvements_pcf_label_in_post_enabled": True,
            "responsive_web_profile_redirect_enabled": False,
            "rweb_tipjar_consumption_enabled": True,
            "verified_phone_label_enabled": True,
            "creator_subscriptions_tweet_preview_api_enabled": True,
            "responsive_web_graphql_timeline_navigation_enabled": True,
            "responsive_web_graphql_skip_user_profile_image_extensions_enabled": False,
            "premium_content_api_read_enabled": False,
            "communities_web_enable_tweet_community_results_fetch": True,
            "c9s_tweet_anatomy_moderator_badge_enabled": True,
            "responsive_web_grok_analyze_button_fetch_trends_enabled": False,
            "responsive_web_grok_analyze_post_followups_enabled": True,
            "responsive_web_jetfuel_frame": True,
            "responsive_web_grok_share_attachment_enabled": True,
            "articles_preview_enabled": True,
            "responsive_web_edit_tweet_api_enabled": True,
            "graphql_is_translatable_rweb_tweet_is_translatable_enabled": True,
            "view_counts_everywhere_api_enabled": True,
            "longform_notetweets_consumption_enabled": True,
            "responsive_web_twitter_article_tweet_consumption_enabled": True,
            "tweet_awards_web_tipping_enabled": False,
            "responsive_web_grok_show_grok_translated_post": False,
            "responsive_web_grok_analysis_button_from_backend": True,
            "creator_subscriptions_quote_tweet_preview_enabled": False,
            "freedom_of_speech_not_reach_fetch_enabled": True,
            "standardized_nudges_misinfo": True,
            "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": True,
            "longform_notetweets_rich_text_read_enabled": True,
            "longform_notetweets_inline_media_enabled": True,
            "responsive_web_grok_image_annotation_enabled": True,
            "responsive_web_grok_imagine_annotation_enabled": True,
            "responsive_web_grok_community_note_auto_translation_is_enabled": False,
            "responsive_web_enhance_cards_enabled": False
        }
    
    async def fetch_bookmarks(
        self, 
        cursor: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Fetch bookmarks from Twitter API.
        
        Args:
            cursor: Pagination cursor (optional)
            count: Number of bookmarks to fetch (optional, defaults to config value)
            
        Returns:
            Raw API response as dictionary
        """
        
        # Build variables
        variables = {
            "count": "100",
            "includePromotedContent": False
        }
        if cursor:
            variables["cursor"] = cursor
        
        # Build URL with query parameters
        query_params = {
            "variables": json.dumps(variables),
            "features": json.dumps(self._build_features())
        }
        
        url = f"{self.base_url}/{self.settings.twitter_graphql_query_id}/Bookmarks"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                params=query_params,
                headers=self._build_headers(),
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    def parse_bookmarks_response(self, response: Dict[str, Any]) -> tuple[List[Dict[str, Any]], Optional[str]]:
        """
        Parse the Twitter API response to extract tweets and pagination cursor.
        
        Args:
            response: Raw API response
            
        Returns:
            Tuple of (list of tweet dictionaries, next cursor or None)
        """
        tweets = []
        next_cursor = None
        
        try:
            timeline = response.get("data", {}).get("bookmark_timeline_v2", {}).get("timeline", {})
            instructions = timeline.get("instructions", [])
            
            for instruction in instructions:
                if instruction.get("type") == "TimelineAddEntries":
                    entries = instruction.get("entries", [])
                    
                    for entry in entries:
                        entry_id = entry.get("entryId", "")
                        
                        # Extract cursor entries
                        if entry_id.startswith("cursor-bottom"):
                            content = entry.get("content", {})
                            if content.get("cursorType") == "Bottom":
                                next_cursor = content.get("value")
                        
                        # Extract tweet entries
                        elif entry_id.startswith("tweet-"):
                            content = entry.get("content", {})
                            item_content = content.get("itemContent", {})
                            tweet_results = item_content.get("tweet_results", {})
                            result = tweet_results.get("result", {})
                            
                            if result.get("__typename") == "Tweet":
                                tweets.append(self._extract_tweet_data(result, entry))
        
        except Exception as e:
            print(f"Error parsing bookmarks response: {e}")
        
        return tweets, next_cursor
    
    def _extract_tweet_data(self, tweet_result: Dict[str, Any], entry: Dict[str, Any]) -> Dict[str, Any]:
        """Extract relevant data from a tweet result object."""
        legacy = tweet_result.get("legacy", {})
        core = tweet_result.get("core", {})
        user_results = core.get("user_results", {}).get("result", {})
        user_legacy = user_results.get("legacy", {})
        
        tweet_id = tweet_result.get("rest_id", "")
        author_username = user_results.get("core", {}).get("screen_name", "")
        
        # Check for media
        entities = legacy.get("entities", {})
        extended_entities = legacy.get("extended_entities", {})
        media_list = extended_entities.get("media", entities.get("media", []))
        
        has_image = False
        has_video = False
        for media in media_list:
            media_type = media.get("type", "")
            if media_type == "photo":
                has_image = True
            elif media_type in ("video", "animated_gif"):
                has_video = True
        
        # Build tweet URL
        url = f"https://x.com/{author_username}/status/{tweet_id}" if author_username and tweet_id else None
        
        # Get full text (handle long tweets)
        text = legacy.get("full_text", "")
        note_tweet = tweet_result.get("note_tweet", {})
        if note_tweet:
            note_results = note_tweet.get("note_tweet_results", {}).get("result", {})
            note_text = note_results.get("text", "")
            if note_text:
                text = note_text
        
        return {
            "tweet_id": tweet_id,
            "text": text,
            "author_id": user_results.get("rest_id", ""),
            "author_username": author_username,
            "created_at": legacy.get("created_at", ""),
            "bookmarked": legacy.get("bookmarked", False),
            "has_media_image": 1 if has_image else 0,
            "has_media_video": 1 if has_video else 0,
            "url": url,
            "source_json": json.dumps(tweet_result)
        }
