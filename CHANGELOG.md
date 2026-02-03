# Changelog

All notable changes to this project are documented in this file.

This project follows **Semantic Versioning**.

---

## [1.1.0] - 2026-02-03

### Added
- Move configuration defaults to `src/config.gs` for clear, in-repo defaults.
- `src/configLoader.gs` for loading configuration and `.env` support from Google Drive root.
- Support for `.env` file overrides (KEY=VALUE format) in Drive root.
- `setConfigValue(key, value)` helper to create/update `.env` entries programmatically.
- `getConfig()`, `showConfig()`, `initializeConfig()`, and `resetConfigToDefaults()` helpers.

### Changed
- Removed `PropertiesService` usage; runtime overrides now come from `.env` only.
- `email_archiver.gs` updated to use `getConfig()` and apply merged configuration.

### Notes
- Configuration priority: hard-coded `CONFIG` defaults < `.env` overrides.

---

## [1.0.0] - Initial Release

### Added
- Initial working implementation of Gmail to Google Drive archiver
- Project-based email selection using `PROJECT/*` Gmail labels
- Email-to-PDF conversion using native Google rendering
- Preservation of all real email attachments
- Structured folder hierarchy per project and sender
- Windows-safe path length enforcement
- Safe truncation of long folder and file names
- Deterministic short-hash suffixes to prevent filename collisions
- Automatic generation of `.txt` audit files when filenames are truncated

### Notes
- Designed for Gmail and Google Drive Desktop (Mirror mode on Windows)
- Intended as a stable baseline for incremental feature development
