const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Thu muc luu anh san pham sau khi upload.
const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Chi nhan file anh.
    if (file.mimetype.startsWith('image/')) {
        return cb(null, true);
    }
    return cb(new Error('Only image files are allowed'));
};

const uploadProductImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { uploadProductImage };
