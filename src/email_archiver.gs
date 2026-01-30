function processProjectEmails() {

  const ROOT_FOLDER_NAME = 'NAS_INBOX';
  const BASE_FOLDER_NAME = 'Εργα υπο εκτελεση';
  const LABEL_PREFIX = 'PROJECT/';
  const MAX_PATH_LEN = 220; // safe Windows limit

  const root = getOrCreateFolder_(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);
  const base = getOrCreateFolder_(root, BASE_FOLDER_NAME);

  const labels = GmailApp.getUserLabels()
    .filter(l => l.getName().startsWith(LABEL_PREFIX));

  labels.forEach(label => {

    const rawProjectName =
      label.getName().replace(LABEL_PREFIX, '').trim();
    const projectName = sanitize_(rawProjectName);

    const projectFolder = getOrCreateFolder_(base, projectName);
    const inboxFolder =
      getOrCreateFolder_(projectFolder, 'Επιστολες που μας στελνουν');

    const threads = label.getThreads();

    threads.forEach(thread => {
      const messages = thread.getMessages();

      messages.forEach(message => {

        const sender = sanitize_(extractSender_(message.getFrom()));
        const date = Utilities.formatDate(
          message.getDate(),
          Session.getScriptTimeZone(),
          'yyyy-MM-dd'
        );

        const senderFolder = getOrCreateFolder_(inboxFolder, sender);
        const index = getNextIndex_(senderFolder);

        const rawSubject = sanitize_(message.getSubject() || 'Χωρις_Θεμα');

        const basePath =
          'D:\\Google Drive\\' +
          ROOT_FOLDER_NAME + '\\' +
          BASE_FOLDER_NAME + '\\' +
          projectName + '\\Επιστολες που μας στελνουν\\' +
          sender + '\\';

        const staticFolderPart = `${index}__${date}`;
        const availableForSubject =
          MAX_PATH_LEN - basePath.length - staticFolderPart.length - 2;

        const safeSubject =
          availableForSubject > 10
            ? rawSubject.substring(0, Math.min(rawSubject.length, availableForSubject))
            : rawSubject.substring(0, 10);

        const emailFolderName = `${index}_${safeSubject}_${date}`;
        const emailFolder = senderFolder.createFolder(emailFolderName);

        // Email PDF
        const pdfBlob = createEmailPdfBlob_(message, 'email.pdf');
        emailFolder.createFile(pdfBlob);

        // Attachments
        const attachments = message.getAttachments({
          includeInlineImages: false,
          includeAttachments: true
        });

        attachments.forEach(att => {

          const originalName = sanitize_(att.getName());
          const dot = originalName.lastIndexOf('.');
          const baseName = dot > 0 ? originalName.substring(0, dot) : originalName;
          const extension = dot > 0 ? originalName.substring(dot) : '';

          const attachmentBasePath =
            basePath + emailFolderName + '\\';

          const availableForFilename =
            MAX_PATH_LEN - attachmentBasePath.length;

          let safeFilename;
          let wasTruncated = false;

          if (originalName.length <= availableForFilename) {
            safeFilename = originalName;
          } else {
            const hash = shortHash_(originalName);
            const maxBaseLen =
              Math.max(
                10,
                availableForFilename - extension.length - hash.length - 2
              );

            safeFilename =
              baseName.substring(0, maxBaseLen) +
              '__' + hash +
              extension;

            wasTruncated = true;
          }

          emailFolder.createFile(
            att.copyBlob().setName(safeFilename)
          );

          if (wasTruncated) {
            const infoText =
              'Original filename:\n' + originalName + '\n\n' +
              'Saved as:\n' + safeFilename + '\n\n' +
              'Reason:\nWindows full path length limit';

            const infoFileName =
              'ORIGINAL_FILENAME_' + safeFilename + '.txt';

            emailFolder.createFile(infoFileName, infoText);
          }
        });

      });

      thread.removeLabel(label);
    });
  });
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
    const m = it.next().getName().match(/^(\d+)_/);
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
