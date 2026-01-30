# Changelog

All notable changes to this project are documented in this file.

This project follows **Semantic Versioning**.

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
