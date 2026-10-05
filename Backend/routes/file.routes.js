import { Router } from "express";
import upload from "../middleware/multer.js";
import { hanelImageUpload } from "../controller/file.controller.js";

const fileRouter = Router()

fileRouter.post("/upload-image" , upload.single("image"),  hanelImageUpload)


export default fileRouter