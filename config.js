// Runtime config — override this file per environment.
// In development:  points to local FastAPI server
// In production:   set API_BASE to your Render backend URL,
//                  or leave empty to use direct browser-side API calls only.

window.AXIS_CONFIG = {
  // Backend URL — set to your Render deploy URL once live.
  // e.g. "https://genzthinks-backend.onrender.com/api"
  // Leave as "" to use direct browser-side API calls (Guardian + NYT).
  API_BASE: "",

  // Browser-side API keys (public-read, browser-safe)
  // Restrict to your domain at: open-platform.theguardian.com and developer.nytimes.com
  GUARDIAN_KEY: "test",
  NYTIMES_KEY: "LqRF51mZqCIaoA2tCtCoUsnLLxA3ptRWZs2GeYtvZNL6Qr3u",
};
