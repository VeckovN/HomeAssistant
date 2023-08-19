const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null, "../client/public/assets/userImages");
    },
    filename: (req, file, cb) =>{
        cb(null, Date.now() + '_' + file.originalname)
    }
});
const upload = multer({storage:storage});

// //Route With files(Multer)
// app.post("/api/auth/register", upload.single("picture"), register);
// //upload image
// app.post("/api/update/picture", upload,single("picture"), updatePicture);


module.exports = upload;