# Pollution Tracker API Debug Guide

## How to Check if Real Data is Being Used

1. **Open Browser Console** (F12)
2. **Navigate to** http://localhost:3000/pollution-tracker
3. **Check the server terminal** for log messages:

### Expected Logs for Real Data:
```
📍 Fetching Sundarbans AQI via geo coordinates (22.0, 89.0)
🌐 API URL: https://api.waqi.info/feed/geo:22.0;89.0/?token=***
📦 WAQI API Response status: ok
✅ Real AQI for Sundarbans: [actual value]
💾 Cached result for Sundarbans
```

### Logs for Mock Data:
```
⚠️  WQI_API_KEY not set in environment variables
Using mock data for Sundarbans
```

## Testing the API Directly

### Test Kolkata:
```bash
curl "https://api.waqi.info/feed/kolkata/?token=0a50601262476b8362ab17999835e5667f05eede"
```

### Test Sundarbans (via coordinates):
```bash
curl "https://api.waqi.info/feed/geo:22.0;89.0/?token=0a50601262476b8362ab17999835e5667f05eede"
```

## Common Issues

1. **Environment variable not loaded**: Restart Next.js dev server after creating `.env.local`
2. **API rate limit**: Wait 1-2 minutes between requests
3. **Wrong location name**: Check WEST_BENGAL_LOCATIONS mapping in route.ts
4. **Cache showing old data**: Wait 5 minutes or clear cache (delete `.next` folder)

## Verifying Against Google

Google shows AQI from different sources. WAQI aggregates data from multiple stations. The values should be similar but may not be exactly the same.

To check which station WAQI is using:
- Look for `station_name` in the API response
- Compare with the specific station Google is showing
