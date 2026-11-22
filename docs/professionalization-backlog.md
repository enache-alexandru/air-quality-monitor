# Air Quality Monitor — Professionalization Backlog

## Goal
Make the app feel more polished, reliable, and production-ready for real-world use.

## Priority Roadmap

### Phase 1 — UX and dashboard polish
- [x] Add a color-coded AQI severity card
- [ ] Improve the current status layout with clearer hierarchy
- [ ] Add a small trend/history panel for recent AQI values
- [ ] Upgrade empty, loading, and error messages
- [ ] Refine UI copy for a more professional feel

### Phase 2 — Alert quality
- [ ] Prevent repeat notifications for the same AQI spike
- [ ] Only notify when the AQI crosses the threshold from a normal level
- [ ] Add severity-based alert messaging
- [ ] Add an alert history panel
- [ ] Add a better sound toggle explanation and test workflow

### Phase 3 — Mobile-first PWA polish
- [ ] Add install support and “Add to Home Screen” guidance
- [ ] Use larger tap-friendly controls
- [ ] Add sticky actions for Save, Test Alert, and Use My Location
- [ ] Improve layout for narrow mobile screens
- [ ] Add an offline/online status indicator

### Phase 4 — Reliability and security
- [ ] Move the WAQI token to a backend endpoint instead of browser storage
- [ ] Store secrets in environment variables
- [ ] Add retry logic for failed WAQI requests
- [ ] Improve API error handling for invalid tokens, rate limits, and bad locations
- [ ] Add logging for monitoring failures and successful fetches

### Phase 5 — Professional developer workflow
- [ ] Add tests for notification and AQI fetch behavior
- [ ] Add a production README with deployment steps
- [ ] Add environment config support for ports and token usage
- [ ] Add linting / formatting setup
- [ ] Add CI validation for the app

## Recommended Implementation Order
1. Dashboard polish
2. Alert logic improvements
3. Mobile PWA refinement
4. Backend token protection
5. Testing and deployment hardening

## Definition of Done
The app is “professionalized” once it has:
- a polished dashboard experience,
- reliable alerting,
- a mobile-friendly installable PWA,
- secure token handling,
- and a maintainable development workflow.
