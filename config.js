// Runtime config — override this file per environment.
// In development:  points to local FastAPI server
// In production:   set AXIS_API_BASE to your Railway/Render backend URL,
//                  or leave empty to use direct browser-side API calls only.

window.AXIS_CONFIG = {
  // Backend URL — update this to your Railway deploy URL once live.
  // e.g. "https://axis-backend-production.up.railway.app/api"
  // Leave as "" to run frontend-only (Guardian + NYT called directly from browser).
  API_BASE: "",

  // Browser-side API keys (safe to expose — these are public-read keys)
  GUARDIAN_KEY: "test",       // replace with your key from open-platform.theguardian.com
  NYTIMES_KEY: "",            // replace with your key from developer.nytimes.com (free)
};
