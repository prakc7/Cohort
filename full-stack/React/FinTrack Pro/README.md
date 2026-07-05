# FinTrack Pro

FinTrack Pro is a browser-only personal finance tracker built with vanilla HTML, CSS, and JavaScript. It stores data in Local Storage, supports multi-currency display using a public exchange-rate API, and includes dark mode, profile settings, filtering, and transaction management.

## Project Structure

- `index.html` - landing page
- `login.html` - sign-in form
- `register.html` - account creation form
- `dashboard.html` - finance overview, chart, and transaction table
- `settings.html` - profile and preference controls
- `css/` - shared theme styles plus auth, dashboard, and settings styling
- `js/` - storage, auth, currency, transaction, chart, settings, and app bootstrapping logic
- `assets/` - logo, images, and icons
- `docs/FinTrackPro_Documentation.pdf` - project documentation

## Setup

1. Open the folder in VS Code.
2. Use Live Server or open `index.html` in a browser.
3. Register a user, then log in and use the dashboard.

## Development Sequence

1. Define the app structure and storage keys.
2. Build the auth flow for registration and login.
3. Add the dashboard shell, summary cards, chart, and transaction table.
4. Add transaction creation, deletion, and filtering.
5. Add settings for name, currency, and dark mode.
6. Integrate exchange-rate fetching and currency conversion.
7. Finish styling and cross-page navigation.

## Exchange-Rate Handling

Transaction amounts are normalized to USD when they are saved. That keeps the stored data stable even if the preferred display currency changes later. The app fetches live exchange rates from a public API and caches them in Local Storage so it can still render recent values if a network request fails. When the rates refresh, only the display values change - the underlying transaction records remain unchanged.

## Live Demo

Add your deployed URL here after publishing to Vercel, Netlify, or GitHub Pages.
