import { v2 as cloudinary } from 'cloudinary';
import { configDotenv } from 'dotenv';
configDotenv()


cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET
});




export const uploadImage = async (imagePath) => {
    try {
      if(!imagePath) {
       return console.log("please provide the image path");
       
      }

      // console.log(imagePath , "this is image path")
      // console.log("uploading...")
      const result =  await cloudinary.uploader.upload(imagePath);
      return result
        
    } catch (error) {
      console.error(error);
      return error
    }
};


