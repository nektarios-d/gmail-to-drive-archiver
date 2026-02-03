// Configuration values for Gmail to Drive Archiver
// This file defines the structure and behavior of the email archiving process

const CONFIG = {
  // Google Drive folder structure
  // These define the folder hierarchy where emails will be organized
  // Structure: Google Drive Root > NAS_INBOX > Εργα υπο εκτελεση > [PROJECT_NAME] > Επιστολες που μας στελνουν > [SENDER] > [EMAIL_FOLDER]
  ROOT_FOLDER_NAME: 'NAS_INBOX',
  BASE_FOLDER_NAME: 'Εργα υπο εκτελεση',
  INBOX_SUBFOLDER_NAME: 'Επιστολες που μας στελνουν',
  
  // Gmail labels
  // Emails with labels starting with this prefix will be processed
  // Example: PROJECT/001, PROJECT/Client-A will be archived
  LABEL_PREFIX: 'PROJECT/',
  
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
  // Runtime overrides file (placed in Google Drive root)
  // Change this if you want a different filename for runtime overrides
  ENV_FILENAME: '.gmail-to-drive-archiver.env',
};
