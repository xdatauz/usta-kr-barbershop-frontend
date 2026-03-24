# Instagram Integration Setup Guide

## Overview

The Gallery page now integrates live Instagram content from your @usta.barbershop account. The implementation combines hardcoded gallery images with real-time Instagram media (images and reels).

## Features

✅ **Real-time Instagram Content** - Automatically fetches latest images and reels from your Instagram business account
✅ **Smart Caching** - Reduces API calls by caching for 5 minutes
✅ **Reel Detection** - Shows "🎬 Reel" badge for video content
✅ **Error Handling** - Gracefully falls back to hardcoded gallery if Instagram unavailable
✅ **Multi-language Support** - Loading states and error messages in all 4 languages (EN, RU, UZ, KR)
✅ **Manual Refresh** - Button to manually refresh Instagram content on the gallery page

## Setup Instructions

### 1. Get Instagram Business Account Credentials

Follow the official Instagram Graph API documentation:
📖 https://developers.facebook.com/docs/instagram-graph-api/get-started

**Steps:**

1. Create a Facebook App at https://developers.facebook.com/apps/
2. Add "Instagram Basic Display" product to your app
3. Configure app settings with your website URL
4. Request an access token with these permissions:
   - `instagram_business_content_access`
   - `instagram_business_basic` (optional)

### 2. Get Your Instagram Business Account ID

```bash
# Use Instagram Graph API to get your account ID
curl -X GET "https://graph.instagram.com/me/instagram_business_account?access_token=YOUR_ACCESS_TOKEN"

# Response will include your business_account_id
# Example response:
# {
#   "instagram_business_account": {
#     "id": "17841406338772121",
#     "name": "usta.barbershop"
#   }
# }
```

### 3. Add Environment Variables

Create or update `.env.local` in the project root:

```env
# Instagram API Configuration
VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID=YOUR_BUSINESS_ACCOUNT_ID
VITE_INSTAGRAM_ACCESS_TOKEN=YOUR_LONG_LIVED_ACCESS_TOKEN
```

**Example:**

```env
VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID=17841406338772121
VITE_INSTAGRAM_ACCESS_TOKEN=IGQVJWeUZAfk...
```

### 4. Test the Integration

1. Start your dev server:

   ```bash
   pnpm dev
   ```

2. Navigate to the Gallery page (`/gallery`)
3. You should see Instagram content loading at the top
4. Test the refresh button in the top-right corner
5. Check browser console for any errors

## How It Works

### Architecture

```
useInstagramGallery Hook
    ↓
fetchInstagramMedia() - Instagram Graph API
    ↓
convertInstagramToGallery() - Format conversion
    ↓
Gallery Page Component - Renders combined gallery
```

### File Structure

```
src/
├── lib/api/
│   └── instagram.ts          # API integration & data conversion
├── hooks/
│   └── useInstagramGallery.ts   # React hook with caching
└── pages/
    └── Gallery/
        └── index.tsx          # Gallery page with Instagram integration
```

### Cache Strategy

- **TTL**: 5 minutes
- **Scope**: In-memory cache (cleared on page refresh)
- **Manual Refresh**: Button available on gallery page
- **Strategy**: Reduces API calls while keeping content relatively fresh

## Instagram Media Displayed

### Image Types

- **Photos** - Displayed as-is
- **Reels (Videos)** - Shows thumbnail + "🎬 Reel" badge
- **Carousel Albums** - Shows first image with reel badge if contains video

### Metadata Shown

- **Caption**: First 20 characters + "..." (shown on hover)
- **Link**: Direct link to Instagram post
- **Timestamp**: Available in data but not displayed

## Troubleshooting

### Issue: "Could not load Instagram content"

**Possible causes:**

1. **Missing credentials** - `VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID` or `VITE_INSTAGRAM_ACCESS_TOKEN` not set
2. **Invalid token** - Access token expired or incorrect
3. **Wrong account ID** - Using personal account instead of business account
4. **API changes** - Instagram may have updated their API format

**Solution:**

- Check browser console for detailed error messages
- Verify credentials in `.env.local`
- Regenerate access token from Facebook Developer Console
- Ensure account is Business/Creator account, not personal

### Issue: Loading state never completes

**Possible causes:**

1. **Network issues** - Bad internet connection
2. **API rate limit** - Too many requests to Instagram API
3. **CORS issues** - If loading from different domain

**Solution:**

- Check network tab in DevTools for failed requests
- Wait a few minutes before refreshing (rate limit)
- Verify API endpoint is correct: `https://graph.instagram.com/v18.0`

### Issue: Only seeing hardcoded gallery, no Instagram content

**Possible causes:**

1. **Invalid credentials** - Instagram API returns no data
2. **No posts on account** - Account has less than 1 post
3. **Silent error** - Check browser console for errors

**Solution:**

- Verify account has published content
- Check console for specific error messages
- Use Instagram API explorer: https://developers.facebook.com/tools/explorer/

## API Reference

### `fetchInstagramMedia(limit?: number): Promise<InstagramImage[]>`

Fetches Instagram media from your business account.

**Parameters:**

- `limit` (optional, default: 12) - Number of items to fetch (max: 50)

**Returns:**

- Array of `InstagramImage` objects with `id`, `caption`, `media_type`, `media_url`, `permalink`, `timestamp`, `thumbnail_url`

**Example:**

```typescript
const media = await fetchInstagramMedia(8);
```

### `useInstagramGallery(limit?: number): UseInstagramGalleryReturn`

React hook to manage Instagram gallery with caching and error handling.

**Parameters:**

- `limit` (optional, default: 12) - Number of items to fetch

**Returns:**

```typescript
{
  instagramMedia: ConvertedMediaArray,
  loading: boolean,
  error: Error | null,
  refresh: () => Promise<void>
}
```

**Example:**

```typescript
const { instagramMedia, loading, error, refresh } = useInstagramGallery(8);

return (
  <>
    {loading && <LoadingSpinner />}
    {error && <ErrorMessage />}
    <Gallery items={instagramMedia} />
    <button onClick={refresh}>Refresh</button>
  </>
);
```

## Data Flow Example

1. **User visits Gallery page**
   - `useInstagramGallery(8)` hook executes
   - Checks cache (empty on first load)
   - Calls API: `GET https://graph.instagram.com/v18.0/17841406338772121/media`

2. **API Response**

   ```json
   {
   	"data": [
   		{
   			"id": "18123456789",
   			"caption": "Fresh fade for our client #barbershop",
   			"media_type": "IMAGE",
   			"media_url": "https://instagram.com/... .jpg",
   			"permalink": "https://instagram.com/p/ABC123/",
   			"timestamp": "2026-03-24T10:30:00+0000"
   		}
   	]
   }
   ```

3. **Data Conversion**
   - Instagram data → Gallery format conversion
   - Cache updated
   - Component re-renders with new data

4. **Display**
   - Instagram items shown first
   - Hardcoded images as fallback
   - Each item includes Instagram link in hover overlay

## Security Notes

- ⚠️ **Access Token**: Treat as sensitive. Never commit to git
- ⚠️ **Environment Variables**: Use `.env.local` (gitignored)
- ✅ **Rate Limiting**: Instagram limits ~200 requests per hour per token
- ✅ **Long-lived tokens**: Valid for ~60 days, need refresh flow for production

## Performance Considerations

- **Cache TTL**: 5 minutes (adjust in `useInstagramGallery.ts`)
- **Limit**: Fetch 8-12 items (adjust as needed)
- **API Version**: Using v18.0 (update if needed)
- **Lazy Loading**: Images load on viewport intersection

## Future Enhancements

- [ ] Add light-box modal for full-screen image view
- [ ] Implement pagination for older posts
- [ ] Add hashtag filtering (#barbershop, #fade, etc.)
- [ ] Show engagement metrics (likes count)
- [ ] Filter by media type (images only, reels only)
- [ ] Schedule automatic background refresh using Service Worker
- [ ] Implement automatic token refresh mechanism
- [ ] Add statistics dashboard

## Multilingual Support

Supported languages with Instagram strings:

| Language | File                  | Status      |
| -------- | --------------------- | ----------- |
| English  | `en/translation.json` | ✅ Complete |
| Русский  | `ru/translation.json` | ✅ Complete |
| Ўзбек    | `uz/translation.json` | ✅ Complete |
| 한국어   | `kr/translation.json` | ✅ Complete |

## Support

For issues or questions:

1. Check browser console for detailed error logs
2. Verify Instagram API credentials
3. Review Facebook Developer documentation
4. Check network requests in DevTools

---

**Last Updated**: March 24, 2026
**Instagram Account**: @usta.barbershop
**API Version**: v18.0
