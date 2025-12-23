import { diskStorage } from 'multer';
import { uniqueFilename } from './filename.util';
import { imageFileFilter } from './file-filter.util';

export const multerConfig = {
    storage: diskStorage({
        destination: 'public/uploads',
        filename: uniqueFilename,
    }),

    fileFilter: imageFileFilter,

    limits: {
        fileSize: 50 * 1024 * 1024  // 50MB limit
    }
};
