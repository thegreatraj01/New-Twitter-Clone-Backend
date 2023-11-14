
const multer = require('multer');
const path = require('path');

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "./multer")
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}_${file.originalname}`)
        }
    }),
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
});


module.exports = upload;

