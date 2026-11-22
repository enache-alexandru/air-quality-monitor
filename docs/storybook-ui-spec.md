# Air Quality Monitor — Storybook-Style UI Spec

## Overview
This document is a lightweight Storybook-style component plan for the app’s dashboard and alert experience.

## Component 1: AQI Overview Card
**Story name:** AQI Overview Card

**Purpose:** Present the latest AQI reading in a clear, high-visibility way.

**Props:**
- aqi: number
- status: string
- location: string
- updatedAt: string

**States:**
- Good
- Moderate
- Unhealthy
- Very Unhealthy
- Hazardous

**Interaction notes:**
- The card should use severity colors.
- It should highlight the current measurement clearly on mobile.

## Component 2: Status Badge
**Story name:** Status Badge

**Purpose:** Show the overall air health state.

**Variants:**
- Good
- Moderate
- Sensitive Groups
- Unhealthy
- Very Unhealthy
- Hazardous

**Interaction notes:**
- The badge should be reused inside the overview card and alert history.

## Component 3: Alert History Panel
**Story name:** Alert History Panel

**Purpose:** Show recent alert events and timestamps.

**Data fields:**
- timestamp
- aqi
- message
- severity

**States:**
- Empty state
- Single alert entry
- Multiple alert entries

## Component 4: Monitoring Settings Form
**Story name:** Monitoring Settings Form

**Purpose:** Let users connect the app to WAQI and define alert thresholds.

**Controls:**
- Token input
- Location input
- Threshold input
- Poll interval input
- Sound toggle

**Interaction notes:**
- Validation should occur before monitoring starts.
- Save and monitor state should be visually explicit.

## Component 5: Test Notification Panel
**Story name:** Test Notification Panel

**Purpose:** Provide a safe manual notification test path.

**Actions:**
- Send test alert
- Enable/disable sound
- Show current notification permission status

**States:**
- Permission granted
- Permission denied
- No AQI available yet

## Recommended Story Order
1. AQI Overview Card
2. Status Badge
3. Monitoring Settings Form
4. Test Notification Panel
5. Alert History Panel

## Implementation Notes
- Use a consistent spacing and typography scale.
- The layout should stay touch-friendly on mobile devices.
- The dashboard should remain readable when the page is in a hidden background state.
