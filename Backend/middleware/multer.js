// import multer from "multer";

// const upload = multer({
//     storage : multer.diskStorage({}),
//     limits : {fileSize : 10485760}
// })

// export default upload;


import multer from "multer";
import path from "path";
import fs from "fs";

// Auto create folder if not exist
const createFolder = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

const storage = multer.diskStorage({

destination: (req, file, cb) => {
  const type = req.body.type || "profile";
  const baseFolder = fs.existsSync("/pictures") ? "/pictures" : path.join(process.cwd(), "uploads");
  const folder = path.join(baseFolder, type);
  createFolder(folder);
  cb(null, folder);
},


  filename: (req, file, cb) => {

    const ext = path.extname(file.originalname);

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      ext;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10485760 }, // 10MB

  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;

    const ext = allowed.test(
      path.extname(file.originalname).toLowerCase()
    );

    const mime = allowed.test(file.mimetype);

    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"));
    }
  },
});

export default upload;
