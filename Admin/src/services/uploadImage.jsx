import Axios from "./axios";
import { api } from "./api";

export const uploadImage = async (image, type = "profile") => {
  try {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("type", type);
    
    const res = await Axios.post(api.file.uploadImage, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res?.data?.imageUrl) {
      return res.data.imageUrl;
    }
    throw new Error(res?.data?.message || "Image upload failed");
  } catch (error) {
    console.error("Upload image error:", error);
    throw error;
  }
};