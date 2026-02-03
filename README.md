# gmail-to-drive-archiver

Automates archiving Gmail emails and attachments to Google Drive using a structured, project-based folder system.  
Emails are converted to PDFs, attachments are preserved, Windows path-length limits are enforced, and filename collisions are handled deterministically.

Built with **Google Apps Script** and designed for **long-term document retention** and **auditability**.

---

## TL;DR

Apply a `PROJECT/*` label to a Gmail email and run the script.

- The email is saved as a **PDF**
- Attachments are preserved
- Files are organized in a **project-based folder structure**
- Long paths and filenames are handled safely
- No duplicates or overwrites occur

---

## ✨ Features

- Archives Gmail emails based on project labels  
- Converts emails to PDF using Google’s native rendering  
- Saves all real attachments (PDF, DOCX, images, etc.)  
- Organizes content in a project-based folder structure  
- Enforces Windows-safe path length limits  
- Safely truncates long folder and file names  
- Prevents filename collisions using deterministic short hashes  
- Creates `.txt` audit files when filenames are truncated  
- Prevents duplicate processing using labels  

---

## 🧠 Design Principles

- Reliability over cleverness  
- Deterministic behavior  
- No data loss  
- Filesystem-safe output  
- Explicit audit trail  

---

## 🗂 Folder Structure (Example)

```
Projects/
  Project-123/
    Incoming/
      External Sender/
        01_Project Update_2026-01-30/
          email.pdf
          attachment__a3f9c2.pdf
          ORIGINAL_FILENAME_attachment__a3f9c2.pdf.txt
```

- One folder per email  
- One PDF per message  
- Attachments preserved  
- Filename changes documented  

---

## 🏷 Gmail Label Conventions

All emails (received and sent) use the same label convention:

```
PROJECT/<project-id>
```

Example:

```
PROJECT/Project-123
```

Only emails with a `PROJECT/*` label are processed.

### Automatic Routing by Sender

Emails are automatically routed to either **Incoming** or **Sent** folders based on the sender's email address:

- **Sent Folder**: If the email was sent FROM `USER_EMAIL` or FROM any domain in `COMPANY_DOMAINS`
- **Inbox Folder**: If the email was sent FROM any other email address

This means you only need one label convention. The script automatically detects whether an email is inbound or outbound and saves it to the correct folder.

---

## 🪟 Windows Compatibility

This project explicitly handles Windows filesystem limitations:

- Prevents paths that trigger the `\\?\` prefix  
- Avoids file preview and PDF viewer errors  
- Ensures files open correctly from Windows Explorer  

Path length limits are enforced programmatically.

---

## 🚀 Getting Started

### 1. Create a Google Apps Script project
- Go to https://script.google.com
- Create a new project
- Paste the script from this repository
- Modify paths as needed (Config file coming soon)

### 2. Grant permissions
On first run, Google will ask for access to:
- Gmail
- Google Drive

### 3. Configure user email and company domains
Edit `src/config.gs` and update these values:
```javascript
USER_EMAIL: 'your.email@company.com',        // Your Gmail address
COMPANY_DOMAINS: ['company.com', 'other.com'], // Company email domains
```

These settings are used to automatically detect and route emails sent by you or your company to the **Sent** folder, while external emails go to the **Inbox** folder.

### 4. Label emails in Gmail
Apply a label such as:

```
PROJECT/Project-123
```

### 5. Run the script
Execute:

```
processProjectEmails
```

Archives emails labeled with `PROJECT/*`. Emails are automatically routed to **Inbox** or **Sent** folders based on the sender's email address and the configured `USER_EMAIL` and `COMPANY_DOMAINS`.

---

## ⚙️ Configuration

Configuration defaults live in `src/config.gs`. You can override selected values at runtime by placing an env file in your Google Drive root (the account running the script). The runtime filename is configurable via `CONFIG.ENV_FILENAME` (default: `.gmail-to-drive-archiver.env`).

Env file rules:
- File name: configurable via `CONFIG.ENV_FILENAME` (default `.gmail-to-drive-archiver.env`) and should be placed in Google Drive root
- Format: `KEY=VALUE` (one per line)
- Lines beginning with `#` are comments
- Only keys that exist in `CONFIG` are accepted
- Values are parsed as JSON where possible (so `true`, `false`, and numbers work)

Example env file (use `CONFIG.ENV_FILENAME` name):
```
ROOT_FOLDER_NAME=MY_ARCHIVE
MAX_PATH_LEN=250
INCLUDE_INLINE_IMAGES=true
LABEL_PREFIX="ARCHIVE/"
# comment here
```

Available helper functions (run from the Apps Script editor):
- `getConfig()` — returns the merged configuration (defaults + `.env` overrides)
- `setConfigValue(key, value)` — updates or creates the `.env` file with the given key/value
- `resetConfigToDefaults()` — deletes the `.env` file (reverts to defaults)
- `showConfig()` — logs the current merged config

Notes:
- There is no PropertiesService usage; `.env` is the only runtime override mechanism.
- Defaults remain visible and authoritative in `src/config.gs`.

Quick note about initialization:
- `processProjectEmails()` calls `getConfig()` at runtime to merge the hard-coded `CONFIG` defaults with any `.env` overrides.


## ⚠️ Known Limitations

- Designed specifically for Gmail  
- Assumes Google Drive Desktop on Windows uses **Mirror** mode  
- Large mailboxes should be processed incrementally  

---

## 📄 License

This project is licensed under the terms of the MIT license.

---

## 🤝 Contributing

This project is intentionally focused and opinionated.  
Contributions should preserve determinism, auditability, and backward compatibility.
