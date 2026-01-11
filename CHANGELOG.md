# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-01-11

### Added
- **Full-text Search**: Search across all verses by text content with modal UI.
- **Export/Import Edits**: Backup and restore your verse edits as JSON files.
- **Offline Fallback Page**: User-friendly offline.html when resources unavailable.
- **Unit Tests**: 34 tests with Vitest covering search and history modules.
- **ESLint + Prettier**: Code quality tooling configured.

### Changed
- **Modular Architecture**: Refactored to ES6 modules:
  - `search.js` - parsing and verse lookup
  - `broadcast.js` - cross-window communication
  - `history.js` - XSS-safe history management
  - `settings.js` - settings and edits persistence
  - `dom-utils.js` - safe DOM manipulation
  - `loader.js` - lazy loading support
- **External CSS/JS**: Moved inline styles/scripts to separate files.
- **Service Worker v3**: Updated caching for modular architecture.
- **Loading UI**: Added progress bar with status text.
- **PWA Icons**: New professionally designed icons (192px, 512px).

### Security
- **XSS Fix**: Replaced innerHTML with textContent in history rendering.
- **Safe DOM Utils**: All user content rendered via textContent.

### Developer Experience
- **Testing**: `npm test` runs Vitest with jsdom.
- **Linting**: `npm run lint` for ESLint checks.
- **Version**: Updated to 2.0.0.

## [1.2.0] - 2025-12-25

### Added
- **PWA Support**: Progressive Web App with offline capability.
  - Added `manifest.json` for installability.
  - Added `sw.js` Service Worker for offline caching.
  - App can be installed on desktop/mobile and works without internet.

## [1.1.0] - 2025-12-25

### Added
- **Kazakh Translation (KTB):** Integrated `KTB_DATA` with 66 canonical books.
  - **Localized Book Names:** Book titles now display in Kazakh when KTB is selected.
  - **Localized Search:** Support for searching books using Kazakh names and abbreviations (e.g., "Жар", "Матай").
- **UI/UX:** Modern 2024-2025 aesthetics with Aurora gradients, Glassmorphism, and Bento grid layout.
  - Removed redundant "Translation" info card.
  - Redesigned bottom layout into a compact 3-column bento grid.
  - Moved broadcast controls to a dedicated "Эфир" (Live) panel.
- **Notes Feature**: Ability to broadcast custom text notes to the display screen.
- **Git Integration**: Initialized Git repository and restructured project layout.

### Changed
- **Project Structure**: Moved source files to `app/`, scripts to `scripts/`, and raw data to `sources/`.
- **Verse Search**: Optimized search logic and auto-update when switching translations.
- **Display Window**: Improved animations and responsiveness.

### Fixed
- **Lint Errors**: Fixed CSS appearance warnings in controller.html.
- **Translation Switching**: Fixed issue where switching from Kazakh to Russian references didn't work.
