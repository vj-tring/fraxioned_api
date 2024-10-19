export function getMaxFileSize(): number {
  return parseInt(process.env.MAX_FILE_SIZE || '31457280', 10);
}

export function getAllowedExtensions(): string[] {
  return (process.env.ALLOWED_EXTENSIONS || '.jpg,.jpeg,.png,.gif')
    .split(',')
    .map((ext) => ext.trim().toLowerCase());
}
export function getAllowedDocumentExtensions(): string[] {
  return (
    process.env.ALLOWED_DOCUMENT_EXTENSIONS ||
    '.pdf,.docx,.jpeg,.jpg,.png,.xlsx'
  )
    .split(',')
    .map((ext) => ext.trim().toLowerCase());
}

export function getMaxFileCount(): number {
  return parseInt(process.env.MAX_FILE_COUNT || '50', 10);
}

export function isFileSizeValid(
  file: Express.Multer.File,
  maxFileSize: number,
): boolean {
  return file.size <= maxFileSize;
}

export function isFileExtensionValid(
  file: Express.Multer.File,
  allowedExtensions: string[],
): boolean {
  const fileExtension = file.originalname
    .slice(((file.originalname.lastIndexOf('.') - 1) >>> 0) + 2)
    .toLowerCase();

  return allowedExtensions.includes(`.${fileExtension}`);
}
