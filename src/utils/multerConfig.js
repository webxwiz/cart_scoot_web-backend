import multer, { memoryStorage } from 'multer';

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true)
    } else {
        cb(new Error('Wrong file format. Please upload only images'), false)
    }
};

const limits = {
    fileSize: 10240000, // 10 Mb
    files: 10,
    fields: 20
};

export const multerConfig = multer({
    storage: memoryStorage(),
    fileFilter,
    limits,
});
