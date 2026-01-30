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

## 🏷 Gmail Label Convention

Emails are selected for processing using Gmail labels:

```
PROJECT/<project-id>
```

Example:

```
PROJECT/Project-123
```

Only emails with a `PROJECT/*` label are processed.

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

### 2. Grant permissions
On first run, Google will ask for access to:
- Gmail
- Google Drive

### 3. Label emails in Gmail
Apply a label such as:

```
PROJECT/Project-123
```

### 4. Run the script
Execute:

```
processProjectEmails
```

Emails will be archived to Google Drive.

---

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
