import { MEDIA_IMAGE_RESPONSES } from '../commons/constants/response-constants/media-image.constant';
import { ApiResponse } from '../commons/response-body/common.responses';

export function getMaxFileSize(): number {
  return parseInt(process.env.MAX_FILE_SIZE || '31457280', 10);
}

export function getAllowedExtensions(): string[] {
  return (process.env.ALLOWED_EXTENSIONS || '.jpg,.jpeg,.png,.gif')
    .split(',')
    .map((ext) => ext.trim().toLowerCase());
}
export function getAllowedDocumentExtensions(): string[] {
  return (process.env.ALLOWED_DOCUMENT_EXTENSIONS || '.pdf,.docx')
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

export function validateFile(
  imageFile: Express.Multer.File,
): ApiResponse<null> {
  const max_file_size = getMaxFileSize();
  const allowedExtensions = getAllowedExtensions();

  const hasOversizedFile = !isFileSizeValid(imageFile, max_file_size);
  if (hasOversizedFile) {
    return MEDIA_IMAGE_RESPONSES.FILE_SIZE_TOO_LARGE(max_file_size);
  }

  const hasUnsupportedExtension = !isFileExtensionValid(
    imageFile,
    allowedExtensions,
  );
  if (hasUnsupportedExtension) {
    return MEDIA_IMAGE_RESPONSES.UNSUPPORTED_FILE_EXTENSION(allowedExtensions);
  }
  return null;
}
