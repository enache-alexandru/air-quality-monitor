# Air Quality Monitor

A small web app that uses the World Air Quality Index (WAQI) API to monitor air quality in your region and send browser notifications when AQI values exceed a threshold.

## Setup

1. Get a free WAQI API token from https://aqicn.org/data-platform/token/
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in a modern browser.
5. Enter your WAQI API token.
6. Enter a location name or click `Use my location`.
7. Save settings and allow notifications when prompted.

## Files

- `index.html` — user interface for the monitor
- `styles.css` — UI styling
- `app.js` — main logic for fetching AQI and sending notifications
- `service-worker.js` — service worker to support notifications

## Notes

- The app polls the WAQI API every 10 minutes by default. You can change the interval from the settings.
- Browser notifications require permission and will only work when the page is open.
- If you use `Use my location`, the app will request the browser's geolocation permission.

## Warning

This is a demonstration app. For production usage, secure your API token and validate all input carefully.
