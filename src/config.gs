// Configuration values for Gmail to Drive Archiver
// This file defines the structure and behavior of the email archiving process

const CONFIG = {
  // Google Drive folder structure
  // These define the folder hierarchy where emails will be organized
  // Received: Google Drive Root > NAS_INBOX > ΕΡΓΑ ΥΠΟ ΕΚΤΕΛΕΣΗ > [PROJECT_NAME] > ΕΠΙΣΤΟΛΕΣ ΠΟΥ ΜΑΣ ΣΤΕΛΝΟΥΝ > [SENDER] > [INDEX_SUBJECT_DATE] (INBOX can be nested using /)
  // Sent: Google Drive Root > NAS_INBOX > ΕΡΓΑ ΥΠΟ ΕΚΤΕΛΕΣΗ > [PROJECT_NAME] > ΕΠΙΣΤΟΛΕΣ ΜΑΣ/EMAIL ΠΟΥ ΣΤΕΛΝΟΥΜΕ > [INDEX_SUBJECT_DATE] (can be nested using /)
  ROOT_FOLDER_NAME: 'NAS_INBOX',
  BASE_FOLDER_NAME: 'ΕΡΓΑ ΥΠΟ ΕΚΤΕΛΕΣΗ',
  INBOX_SUBFOLDER_NAME: 'ΕΠΙΣΤΟΛΕΣ ΠΟΥ ΜΑΣ ΣΤΕΛΝΟΥΝ', // Relative path for emails received from others (supports nested levels)
  SENT_SUBFOLDER_NAME: 'ΕΠΙΣΤΟΛΕΣ ΜΑΣ/EMAIL ΠΟΥ ΣΤΕΛΝΟΥΜΕ',  // Relative path for sent emails (supports nested levels)  

  // Gmail labels
  // Emails with labels starting with this prefix will be processed
  // Routing: if sent from USER_EMAIL or COMPANY_DOMAIN, goes to SENT_SUBFOLDER_NAME, else INBOX_SUBFOLDER_NAME
  // Example: PROJECT/001, PROJECT/Client-A will be archived
  LABEL_PREFIX: 'PROJECT/',
  
  // Company domains to identify sent emails
  // If email is sent FROM the running user's email or any of these domains, it goes to SENT folder instead of INBOX
  // Add your company domain(s)
  COMPANY_DOMAINS: ['apostolides.com.cy'],  // Company email domains
  
  // Path constraints
  // Windows has a 260 character limit for full file paths
  // This is set to 220 to provide safety margin for long filenames
  MAX_PATH_LEN: 220,
  
  // File handling
  // Used when truncating long filenames due to path length constraints
  MIN_FILENAME_LENGTH: 10,  // Minimum characters to keep from original filename
  HASH_LENGTH: 6,            // Hash characters appended to truncated filenames for uniqueness
  
  // Email processing
  // Controls PDF export and attachment handling
  PDF_FILENAME: 'email.pdf',
  INCLUDE_INLINE_IMAGES: false,  // Exclude inline images from attachments
  INCLUDE_ATTACHMENTS: true,     // Include regular attachments

  // Thread folder naming
  // Controls which subject is used when naming the thread folder.
  // Options: 'last' (default) or 'first'
  THREAD_FOLDER_SUBJECT_SOURCE: 'last',
  // Runtime overrides file (placed in Google Drive root)
  // Change this if you want a different filename for runtime overrides
  ENV_FILENAME: '.gmail-to-drive-archiver.env',
};
