import Axios from "./axios";
import { api } from "./endpoints";

/**
 * Upload an image file (profile, vehicle, etc.) to the server
 * @param {File} image - The File object to upload
 * @param {string} type - Folder type ("profile", "vehicle", etc.)
 * @returns {Promise<string>} - Resolves to the uploaded image URL path
 */
export const uploadImage = async (image, type = "profile") => {
  if (!image) {
    throw new Error("No image file provided");
  }

  const formData = new FormData();
  formData.append("type", type);
  formData.append("image", image);

  const res = await Axios.post(api.file.uploadImage, formData);

  if (res?.data?.success && res?.data?.imageUrl) {
    return res.data.imageUrl;
  }

  throw new Error(res?.data?.message || "Failed to upload image");
};