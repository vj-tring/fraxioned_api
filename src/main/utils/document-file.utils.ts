export function getMaxFileSizeForDocument(): number {
  return parseInt(process.env.MAX_DOCUMENT_FILE_SIZE || '31457280', 10);
}

export function getAllowedExtensionsForDocument(): string[] {
  return (process.env.ALLOWED_DOCUMENT_EXTENSIONS || '.pdf,.doc,.docx')
    .split(',')
    .map((ext) => ext.trim().toLowerCase());
}

export function getMaxFileCountForDocument(): number {
  return parseInt(process.env.MAX_DOCUMENT_FILE_COUNT || '10', 10);
}

export function isFileSizeValidForDocument(
  file: Express.Multer.File,
  maxFileSize: number,
): boolean {
  return file.size <= maxFileSize;
}

export function isFileExtensionValidForDocument(
  file: Express.Multer.File,
  allowedExtensions: string[],
): boolean {
  const fileExtension = file.originalname
    .slice(((file.originalname.lastIndexOf('.') - 1) >>> 0) + 2)
    .toLowerCase();

  return allowedExtensions.includes(`.${fileExtension}`);
}
