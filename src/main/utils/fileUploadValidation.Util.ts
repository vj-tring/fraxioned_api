import { ApiResponse } from '../commons/response-body/common.responses';
import { MEDIA_IMAGE_RESPONSES } from '../commons/constants/response-constants/media-image.constant';
import {
  getAllowedExtensions,
  getMaxFileSize,
  isFileExtensionValid,
  isFileSizeValid,
} from './image-file.utils';

export const validateFile = async (
  imageFile: Express.Multer.File,
): Promise<ApiResponse<null>> => {
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
};
