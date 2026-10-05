import { uploadImage } from "../config/uploadImage.js";


// export const hanelImageUpload = async (req , res , next) => {
//     try {
//          const { path } = req.file;
//         //  console.log(req.file , "this is file")

//         if (!path) {
//             return res.status(400).json({
//                 message: "No path to upload",
//                 error: true,
//                 success: false,
//             });
//         }

//         const response = await uploadImage(path);

//         return res.status(200).json({
//             message: "Image uploaded",
//             error: false,
//             success: true,
//             imageUrl: response.secure_url,
//         });
//     } catch (error) {
//         next(error)
//     }
// }

export const hanelImageUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
        error: true,
        success: false,
      });
    }

    // REAL VPS URL
    const imageUrl = `/uploads/${req.body.type || "profile" }/${req.file.filename}`;

    return res.status(200).json({
      message: "Image uploaded",
      error: false,
      success: true,
      imageUrl,
    });

  } catch (error) {
    next(error);
  }
};
