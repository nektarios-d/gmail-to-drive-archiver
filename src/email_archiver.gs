function processProjectEmails() {
  const config = getConfig();
  const root = getOrCreateFolder_(DriveApp.getRootFolder(), config.ROOT_FOLDER_NAME);
  const base = getOrCreateFolder_(root, config.BASE_FOLDER_NAME);

  const labels = GmailApp.getUserLabels()
    .filter(l => l.getName().startsWith(config.LABEL_PREFIX));

  labels.forEach(label => {

    const rawProjectName =
      label.getName().replace(config.LABEL_PREFIX, '').trim();
    const projectName = sanitize_(rawProjectName);

    const threads = label.getThreads();

    // Skip labels with no emails
    if (threads.length === 0) {
      return;
    }

    const projectFolder = getOrCreateFolder_(base, projectName);

    threads.forEach(thread => {
      const messages = thread.getMessages();

      if (!messages || messages.length === 0) {
        thread.removeLabel(label);
        return;
      }

      const firstMessage = messages[0];
      const lastMessage = messages[messages.length - 1];

      // Determine destination folder using the existing sent/received logic
      const fromEmail = lastMessage.getFrom();
      const isSentEmail = isSentByUserOrCompany_(fromEmail, config);

      let emailTypeFolder;
      let basePath;

      if (isSentEmail) {
        // Sent emails: ROOT/BASE/PROJECT/SENT_SUBFOLDER (which may be nested)
        emailTypeFolder = getOrCreateNestedPath_(projectFolder, config.SENT_SUBFOLDER_NAME);
        basePath =
          config.ROOT_FOLDER_NAME + '\\' +
          config.BASE_FOLDER_NAME + '\\' +
          projectName + '\\' +
          config.SENT_SUBFOLDER_NAME + '\\';
      } else {
        // Received emails: ROOT/BASE/PROJECT/INBOX_SUBFOLDER (which may be nested) > SENDER
        const inboxFolder = getOrCreateNestedPath_(projectFolder, config.INBOX_SUBFOLDER_NAME);
        const sender = sanitize_(extractSender_(fromEmail));
        emailTypeFolder = getOrCreateFolder_(inboxFolder, sender);
        basePath =
          config.ROOT_FOLDER_NAME + '\\' +
          config.BASE_FOLDER_NAME + '\\' +
          projectName + '\\' +
          config.INBOX_SUBFOLDER_NAME + '\\' +
          sender + '\\';
      }

      const threadDate = Utilities.formatDate(
        lastMessage.getDate(),
        Session.getScriptTimeZone(),
        'yyyy-MM-dd'
      );

      const index = getNextIndex_(emailTypeFolder);
      const subjectSource = (config.THREAD_FOLDER_SUBJECT_SOURCE || 'last').toLowerCase();
      const subjectMessage = subjectSource === 'first' ? firstMessage : lastMessage;
      const rawSubject = sanitize_(subjectMessage.getSubject() || 'Χωρις_Θεμα');

      const staticFolderPart = `${index}__${threadDate}`;
      const availableForSubject =
        config.MAX_PATH_LEN - basePath.length - staticFolderPart.length - 2;

      const safeSubject =
        availableForSubject > 10
          ? rawSubject.substring(0, Math.min(rawSubject.length, availableForSubject))
          : rawSubject.substring(0, 10);

      const threadFolderName = `${index}-${safeSubject}-${threadDate}`;
      const threadFolder = emailTypeFolder.createFolder(threadFolderName);

      // Save the whole thread as a single PDF (dated by last message)
      threadFolder.createFile(createThreadPdfBlob_(messages, config.PDF_FILENAME));

      // Save attachments only from the last message in the thread
      const attachments = lastMessage.getAttachments({
        includeInlineImages: config.INCLUDE_INLINE_IMAGES,
        includeAttachments: config.INCLUDE_ATTACHMENTS
      });

      attachments.forEach(att => {
        const originalName = sanitize_(att.getName());
        const dot = originalName.lastIndexOf('.');
        const baseName = dot > 0 ? originalName.substring(0, dot) : originalName;
        const extension = dot > 0 ? originalName.substring(dot) : '';

        const attachmentBasePath = basePath + threadFolderName + '\\';
        const availableForFilename = config.MAX_PATH_LEN - attachmentBasePath.length;

        let safeFilename;
        let wasTruncated = false;

        if (originalName.length <= availableForFilename) {
          safeFilename = originalName;
        } else {
          const hash = shortHash_(originalName);
          const maxBaseLen = Math.max(
            config.MIN_FILENAME_LENGTH,
            availableForFilename - extension.length - config.HASH_LENGTH - 2
          );

          safeFilename =
            baseName.substring(0, maxBaseLen) +
            '--' + hash +
            extension;

          wasTruncated = true;
        }

        threadFolder.createFile(att.copyBlob().setName(safeFilename));

        if (wasTruncated) {
          const infoText =
            'Original filename:\n' + originalName + '\n\n' +
            'Saved as:\n' + safeFilename + '\n\n' +
            'Reason:\nWindows full path length limit';

          const infoFileName = 'ORIGINAL_FILENAME-' + safeFilename + '.txt';
          threadFolder.createFile(infoFileName, infoText);
        }
      });

      // Remove the label from the thread after archiving
      thread.removeLabel(label);
    });
  });
}

function createThreadPdfBlob_(messages, pdfName) {
  const timezone = Session.getScriptTimeZone();

  const items = messages.map((m, idx) => {
    const date = Utilities.formatDate(m.getDate(), timezone, 'yyyy-MM-dd HH:mm:ss');
    const subject = sanitize_(m.getSubject() || '');
    const from = m.getFrom();
    const to = (typeof m.getTo === 'function') ? (m.getTo() || '') : '';
    const cc = (typeof m.getCc === 'function') ? (m.getCc() || '') : '';

    return `
      <div style="page-break-inside:avoid; margin-bottom:20px;">
        <div style="font-size:12px; color:#333;">
          <p style="margin:0;"><b>#</b> ${idx + 1}</p>
          <p style="margin:0;"><b>From:</b> ${from}</p>
          ${to ? `<p style="margin:0;"><b>To:</b> ${to}</p>` : ''}
          ${cc ? `<p style="margin:0;"><b>Cc:</b> ${cc}</p>` : ''}
          <p style="margin:0;"><b>Date:</b> ${date}</p>
          ${subject ? `<p style="margin:0;"><b>Subject:</b> ${subject}</p>` : ''}
        </div>
        <hr>
        <div>${m.getBody()}</div>
      </div>
    `;
  }).join('\n');

  const html = `
    <html>
      <body style="font-family:Arial,Helvetica,sans-serif;">
        ${items}
      </body>
    </html>
  `;

  return Utilities
    .newBlob(html, MimeType.HTML, pdfName)
    .getAs(MimeType.PDF);
}

/**
 * Create nested folder structure from a relative path (e.g., 'folder1/folder2/folder3')
 * @param {GoogleAppsScript.Drive.Folder} parent - Parent folder to start from
 * @param {string} relativePath - Relative path with / as separator (e.g., 'sent/emails/archive')
 * @return {GoogleAppsScript.Drive.Folder} The final nested folder
 */
function getOrCreateNestedPath_(parent, relativePath) {
  const parts = relativePath.split('/').filter(p => p.length > 0);
  let current = parent;
  
  parts.forEach(folderName => {
    current = getOrCreateFolder_(current, folderName);
  });
  
  return current;
}

/**
 * Check if email was sent FROM user or company domain
 * @param {string} fromEmail - Email address from message.getFrom()
 * @param {Object} config - Configuration object
 * @return {boolean} true if sent by user or company, false if external
 */
function isSentByUserOrCompany_(fromEmail, config) {
  // Extract email from angle brackets if present
  let emailAddress;
  const angleMatch = fromEmail.match(/<(.+?)>/);
  if (angleMatch) {
    emailAddress = angleMatch[1];
  } else {
    // If no angle brackets, use the whole string
    emailAddress = fromEmail;
  }
  
  const domain = emailAddress.split('@')[1] || '';
  
  // Check if it's the running user's email
  const userEmail = Session.getActiveUser().getEmail();
  const isUserEmail = emailAddress.toLowerCase() === userEmail.toLowerCase();
  
  // Check if domain matches company domains
  let isDomainMatch = false;
  if (config.COMPANY_DOMAINS && config.COMPANY_DOMAINS.length > 0) {
    isDomainMatch = config.COMPANY_DOMAINS.some(d => domain.toLowerCase() === d.toLowerCase());
  }
  
  return isUserEmail || isDomainMatch;
}

function createEmailPdfBlob_(message, pdfName) {
  const html = `
    <html>
      <body style="font-family:Arial,Helvetica,sans-serif;">
        <p><b>From:</b> ${message.getFrom()}</p>
        <p><b>Date:</b> ${message.getDate()}</p>
        <p><b>Subject:</b> ${message.getSubject()}</p>
        <hr>
        ${message.getBody()}
      </body>
    </html>
  `;

  return Utilities
    .newBlob(html, MimeType.HTML, pdfName)
    .getAs(MimeType.PDF);
}

function shortHash_(text) {
  const raw = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_1,
    text
  );

  return raw
    .map(b => ('0' + (b & 0xff).toString(16)).slice(-2))
    .join('')
    .substring(0, 6);
}

function getOrCreateFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function getNextIndex_(folder) {
  let max = 0;
  const it = folder.getFolders();
  while (it.hasNext()) {
    const m = it.next().getName().match(/^(\d+)[-_]/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return String(max + 1).padStart(2, '0');
}

function sanitize_(text) {
  return text
    .replace(/[\\\/\:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSender_(from) {
  const m = from.match(/"?([^"<]+)"?\s*<.*>/);
  return m ? m[1] : from;
}
