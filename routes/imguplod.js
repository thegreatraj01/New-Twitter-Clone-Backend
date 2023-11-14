const express = require('express');
const router = express.Router();
// const verifyuser = require('../middleware/veryfyuser')

const upload = require('../multer/multer');
// --------------------------------------------------------------------------------------------
const path = require('path');
const __basedir = path.resolve();


// -------------------------------------------------------------------------------------------
router.post('/api/upload', upload.single('file'), async (req, res) => {
    // console.log(req.body);

    res.json({ "profileimage": req.file.filename })
});


//---------------------------------------------------------------------------------------------
router.get('/api/download/:filename', (req, res) => {
    const fileName = req.params.filename;
    const path = __basedir + "/multer/";
   

    res.download(path + fileName, (error) => {
        if (error) {
            res.status(500).send({ meassge: "File cannot be downloaded " + error })
        }
    })
});

// -----------------------------------------------------------------------------------------------


module.exports = router;