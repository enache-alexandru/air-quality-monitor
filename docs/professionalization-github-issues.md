# Air Quality Monitor — GitHub Issues

## Issue 1: Build a polished AQI dashboard
**Goal:** Replace the current simple form layout with a cleaner dashboard-first experience.

**Acceptance criteria:**
- A status card shows current AQI, health category, and dominant pollutant.
- Colors reflect severity level.
- A recent update timestamp is visible.
- The page feels mobile-first and modern.

## Issue 2: Add AQI history and alert timeline
**Goal:** Track recent measurements and alert events.

**Acceptance criteria:**
- The app stores at least the last 5 AQI readings.
- A history section displays recent values over time.
- A small alert log shows when notifications were sent.

## Issue 3: Improve alerting behavior
**Goal:** Reduce noisy or repetitive alerts.

**Acceptance criteria:**
- Alerts are only sent when AQI crosses a threshold from a safe state.
- The same high-reading alert is not duplicated in a short period.
- Severity-based messages are shown in the notification body.

## Issue 4: Add a proper sound and test workflow
**Goal:** Make alert testing easier and more reliable.

**Acceptance criteria:**
- A test alert button works without requiring a fresh AQI fetch.
- Sound toggle is clearly explained.
- The app confirms when a test notification was triggered.

## Issue 5: Make the app more PWA-native
**Goal:** Improve installability and mobile experience.

**Acceptance criteria:**
- Add install prompt support.
- Show clear install guidance on mobile.
- Use a richer icon and splash layout.
- Support offline status messaging.

## Issue 6: Secure WAQI token handling
**Goal:** Stop exposing the API token directly in the browser.

**Acceptance criteria:**
- A lightweight backend proxy is used for WAQI requests.
- Tokens are stored in server-side environment variables.
- Browser code no longer needs the token for live AQI fetching.

## Issue 7: Add error handling and retry logic
**Goal:** Improve resilience for real-world failures.

**Acceptance criteria:**
- Invalid token and bad location messages are clearer.
- Retries happen on transient fetch failures.
- The UI shows the last failure reason without breaking the app.

## Issue 8: Add automated validation
**Goal:** Keep the app stable as it grows.

**Acceptance criteria:**
- Basic tests cover fetch and notification behavior.
- CI runs on each change.
- Linting and formatting are configured.
