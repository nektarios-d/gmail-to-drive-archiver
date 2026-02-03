# Changelog

All notable changes to this project are documented in this file.

This project follows **Semantic Versioning**.

---

## [1.2.0] - 2026-02-03

### Added
- Support for archiving emails sent from user email or company domain in different folder structure
- `COMPANY_DOMAINS` config parameters for automatic sent email detection.
- `SENT_SUBFOLDER_NAME` config parameter for organizing sent emails (from user email or company_domains) separately from received emails.
- `isSentByUserOrCompany_()` helper function for automatic routing based on sender email/domain.

### Changed
- `email_archiver.gs` refactored: `processProjectEmails()` now automatically routes emails to Inbox or Sent folders based on sender.
- Email routing is now automatic: emails FROM `USER_EMAIL` or `COMPANY_DOMAINS` go to `SENT_SUBFOLDER_NAME`, others go to `INBOX_SUBFOLDER_NAME`.
### Notes
- Sent and received emails are organized under the same `ROOT_FOLDER_NAME/BASE_FOLDER_NAME/<project-id>/` hierarchy, separated into `INBOX_SUBFOLDER_NAME` and `SENT_SUBFOLDER_NAME` based on sender.

---

## [1.1.0] - 2026-02-03

### Added
- Move configuration defaults to `src/config.gs` for clear, in-repo defaults.
- `src/configLoader.gs` for loading configuration and runtime overrides from Google Drive root.
- Support for runtime overrides via file (default filename: `.gmail-to-drive-archiver.env`, configurable via `CONFIG.ENV_FILENAME`).
- `setConfigValue(key, value)` helper to create/update override file entries programmatically.
- `getConfig()`, `showConfig()` and `resetConfigToDefaults()` helpers.
- `ENV_FILENAME` config parameter to customize the runtime override filename.


### Notes
- Configuration priority: hard-coded `CONFIG` defaults < file-based overrides.
- The override filename can be customized by editing `CONFIG.ENV_FILENAME` in `src/config.gs` before deployment.

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
