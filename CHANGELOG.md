# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-25

### Added
- **Kazakh Translation (KTB):** Integrated `KTB_DATA` with 66 canonical books.
  - **Localized Book Names:** Book titles now display in Kazakh when KTB is selected.
  - **Localized Search:** Support for searching books using Kazakh names and abbreviations (e.g., "Жар", "Матай").
- **UI/UX:** Modern 2024-2025 aesthetics with Aurora gradients, Glassmorphism, and Bento grid layout.
- **Notes Feature**: Ability to broadcast custom text notes to the display screen.
- **Git Integration**: Initialized Git repository and restructured project layout.

### Changed
- **Project Structure**: Moved source files to `app/`, scripts to `scripts/`, and raw data to `sources/`.
- **Verse Search**: Optimized search logic and auto-update when switching translations.
- **Display Window**: Improved animations and responsiveness.

### Fixed
- **Lint Errors**: Fixed CSS appearance warnings in controller.html.
