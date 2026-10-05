

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Download,
  User,
  Upload,
  Image,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { uploadImage } from "../../services/uploadImage";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails } from "../../store/userReducer";
import { toast } from "react-toastify";
import { getDefaultProfilePhoto } from "../../utils/profileImageHelper";

// Allowed image types - ONLY JPEG, JPG, PNG, WEBP
const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|webp/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const UploadProfilePic = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user);
  const currentPhotoUrl = getDefaultProfilePhoto(user);
  const hasExistingPhoto = Boolean(user?.profilePhotos?.length || user?.profilePhoto);

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [fileError, setFileError] = useState(null);

  // Validate image type
  const validateImageType = (file) => {
    const fileType = file.type.split('/')[1]?.toLowerCase();
    return ALLOWED_IMAGE_TYPES.test(fileType);
  };

  // Validate file size
  const validateFileSize = (file) => {
    return file.size <= MAX_FILE_SIZE;
  };

  // Handle photo selection with strict validation
  const handlePhotoSelect = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Clear previous errors
    setFileError(null);

    // Validate file type - ONLY JPEG, JPG, PNG, WEBP
    if (!validateImageType(file)) {
      setFileError("Only JPEG, JPG, PNG, and WebP images are allowed");
      toast.error("Invalid file type. Please select JPEG, JPG, PNG, or WebP image.");
      
      // Reset file input
      event.target.value = '';
      return;
    }

    // Validate file size
    if (!validateFileSize(file)) {
      setFileError("Image size must be less than 5MB");
      toast.error("File size must be less than 5MB");
      
      // Reset file input
      event.target.value = '';
      return;
    }

    setPhotoFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    // Auto-upload the image and get URL
    setIsUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setUploadedUrl(url);
      setSelectedPhoto(Date.now()); // Auto-select as default
      toast.success("Photo uploaded successfully! Click 'Save to Profile' to confirm.");
      setFileError(null);
    } catch (error) {
      console.error("Upload error:", error);
      // Keep photoPreview and photoFile so user still sees the preview and can click Save
      setUploadedUrl(null);
      toast.warning("Background upload failed. You can still click 'Save to Profile' to try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save photo to backend
  const savePhoto = async () => {
    if (!photoFile && !uploadedUrl) {
      toast.error("Please select a photo first");
      return;
    }

    setIsUploading(true);
    try {
      let finalUrl = uploadedUrl;
      // If auto-upload did not complete or failed earlier, upload now
      if (!finalUrl && photoFile) {
        setIsUploadingImage(true);
        finalUrl = await uploadImage(photoFile);
        setUploadedUrl(finalUrl);
        setIsUploadingImage(false);
      }

      if (!finalUrl) {
        throw new Error("Unable to obtain uploaded image URL");
      }

      // Prepare data for backend with the uploaded URL
      const backendData = {
        userId: user?._id || localStorage.getItem("userId"),
        profilePhotos: [{
          url: finalUrl,
          isDefault: true,
          uploadedAt: new Date().toISOString(),
          size: "profile",
          format: photoFile?.type?.split('/')[1] || 'jpeg',
          photoId: Date.now(),
        }],
        selectedPhotoId: selectedPhoto || Date.now(),
        metadata: {
          totalPhotos: 1,
          defaultPhotoIndex: 0,
          captureDevice: "file-upload",
          timestamp: new Date().toISOString(),
        },
      };

      // Send to backend API
      const res = await Axios.post(api.user.uploadProfielPic, backendData);

      if (res?.data?.success) {
        dispatch(setUserDetails(res?.data?.user));
        toast.success(res?.data?.message || "Profile photo updated successfully!");
        // Clean up preview URL before navigating
        if (photoPreview) {
          URL.revokeObjectURL(photoPreview);
        }
        navigate("/my-profile");
      } else {
        toast.error(res?.data?.message || "Failed to update profile photo");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to save photo");
    } finally {
      setIsUploading(false);
      setIsUploadingImage(false);
    }
  };

  // Remove selected photo
  const removePhoto = () => {
    // Clean up preview URL
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setPhotoFile(null);
    setUploadedUrl(null);
    setFileError(null);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  // Go back
  const handleGoBack = () => {
    // Clean up preview URL before leaving
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    navigate(-1);
  };

  // Get file extension from file type
  const getFileExtension = (file) => {
    return file?.type?.split('/')[1]?.toUpperCase() || 'UNKNOWN';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F7F7F7]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#E5E5E5] px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-[#F7F7F7] rounded-lg text-[#555555]"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 bg-[#E10600] rounded-lg">
                  <Image className="text-white" size={18} />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-[#111111]">
                    Upload Profile Photo
                  </h1>
                  <p className="text-xs md:text-sm text-[#555555]">
                    Select one photo from your device
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Upload Section */}
          <div className="space-y-6">
            {/* Upload Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm">
              <h2 className="text-lg font-semibold text-[#111111] mb-4">
                Select Photo
              </h2>

              <div className="text-center">
                {photoPreview ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-[#E10600] shadow-lg">
                    <img
                      src={photoPreview}
                      alt="Selected profile"
                      className="w-full h-80 object-cover"
                      style={{ aspectRatio: "1/1" }}
                      onLoad={() => console.log("Image loaded successfully")}
                      onError={(e) => {
                        console.error("Image failed to load");
                        e.target.src = "https://via.placeholder.com/400x400?text=Preview+Failed";
                      }}
                    />
                    
                    {/* File Type Badge */}
                    {photoFile && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                          <Image size={12} />
                          {getFileExtension(photoFile)}
                        </div>
                      </div>
                    )}
                    
                    {/* Upload Status */}
                    {isUploadingImage ? (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                          <p className="text-white font-medium">Uploading photo...</p>
                        </div>
                      </div>
                    ) : uploadedUrl && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                          <Check size={12} />
                          Uploaded
                        </div>
                      </div>
                    )}

                    {/* Selected Badge */}
                    {uploadedUrl && (
                      <div className="absolute bottom-3 left-3">
                        <div className="bg-[#E10600] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                          <Check size={12} />
                          Default
                        </div>
                      </div>
                    )}

                    {/* Remove Button */}
                    <div className="absolute bottom-3 right-3">
                      <button
                        onClick={removePhoto}
                        disabled={isUploadingImage}
                        className="px-4 py-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg hover:bg-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className={`border-2 border-dashed rounded-2xl p-8 hover:border-[#E10600] transition-all duration-200 ${
                      fileError ? 'border-red-500 bg-red-50' : 'border-[#E5E5E5]'
                    }`}>
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className={`w-20 h-20 rounded-full ${
                          fileError ? 'bg-red-100' : 'bg-[#F7F7F7]'
                        } flex items-center justify-center mb-4`}>
                          {fileError ? (
                            <AlertCircle size={32} className="text-red-500" />
                          ) : (
                            <Upload size={32} className="text-[#B8B8B8]" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-[#111111] mb-2">
                          {fileError ? 'Invalid File' : 'Upload Your Photo'}
                        </h3>
                        <p className="text-sm text-[#555555] mb-6 max-w-xs">
                          {fileError || 'Click to browse or drag and drop your photo here'}
                        </p>
                        <div className={`px-6 py-3 ${
                          fileError ? 'bg-red-500' : 'bg-[#E10600]'
                        } text-white rounded-lg font-semibold flex items-center gap-2`}>
                          <Upload size={18} />
                          {fileError ? 'Try Again' : 'Browse Files'}
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoSelect}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </label>
                )}

                {/* File Error Message */}
                {fileError && !photoPreview && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-800">{fileError}</p>
                      <p className="text-xs text-red-700 mt-1">
                        Please select a JPEG, JPG, PNG, or WebP image
                      </p>
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploadingImage && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-[#555555] mb-1">
                      <span>Uploading...</span>
                      <span>Please wait</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full animate-pulse w-3/4"></div>
                    </div>
                  </div>
                )}

                {/* File Requirements */}
                <div className="mt-6 text-left">
                  <h4 className="text-sm font-semibold text-[#111111] mb-2">
                    📸 Photo Requirements
                  </h4>
                  <ul className="space-y-1 text-xs text-[#555555]">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#E10600] mt-1.5"></div>
                      <span className="font-medium">Allowed formats:</span>
                      <span className="text-[#E10600] font-bold">JPEG, JPG, PNG, WEBP only</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#E10600] mt-1.5"></div>
                      <span>Max file size: 5MB</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#E10600] mt-1.5"></div>
                      <span>Square photos work best (1:1 ratio)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#E10600] mt-1.5"></div>
                      <span>Make sure your face is clearly visible</span>
                    </li>
                  </ul>
                  
                  {/* Format Examples */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">.jpeg</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">.jpg</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">.png</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">.webp</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full line-through">.gif</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full line-through">.svg</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full line-through">.bmp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm">
              <h3 className="text-lg font-semibold text-[#111111] mb-4">
                How It Works
              </h3>
              <ul className="space-y-3 text-sm text-[#555555]">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Select Photo</p>
                    <p className="text-xs mt-1">Choose a JPEG, JPG, PNG, or WebP photo from your device</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Instant Preview</p>
                    <p className="text-xs mt-1">Photo preview appears immediately after selection</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Auto-Upload</p>
                    <p className="text-xs mt-1">Photo automatically uploads to cloud storage</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Save to Profile</p>
                    <p className="text-xs mt-1">Finalize by saving the URL to your profile</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-6">
            {/* Photo Preview */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#111111] flex items-center gap-2">
                  <User size={20} />
                  Your Profile Photo
                </h2>
                {uploadedUrl ? (
                  <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Check size={12} />
                    Ready to Save
                  </div>
                ) : photoPreview ? (
                  <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full">
                    New Preview
                  </div>
                ) : hasExistingPhoto ? (
                  <div className="bg-gray-100 text-[#555555] text-xs font-bold px-3 py-1.5 rounded-full">
                    Current Photo
                  </div>
                ) : null}
              </div>

              {photoPreview ? (
                <div className="space-y-6">
                  <div className="relative rounded-xl overflow-hidden border border-[#E5E5E5] shadow-md">
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="w-full h-64 object-cover"
                      style={{ aspectRatio: "1/1" }}
                      onError={(e) => {
                        e.target.src = "/default-avatar.jpg";
                      }}
                    />
                    
                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {uploadedUrl && (
                        <div className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                          <Check size={12} />
                          Uploaded
                        </div>
                      )}
                      <div className="bg-[#E10600] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Check size={12} />
                        Selected
                      </div>
                    </div>

                    {/* File Format Badge */}
                    {photoFile && (
                      <div className="absolute bottom-3 left-3">
                        <div className="bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          {getFileExtension(photoFile)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      {uploadedUrl 
                        ? "✅ Photo is uploaded and ready to save to your profile."
                        : isUploadingImage
                        ? "⏳ Photo is being uploaded. Please wait..."
                        : "Click 'Save to Profile' below to confirm your new photo."}
                    </p>
                  </div>
                </div>
              ) : hasExistingPhoto ? (
                <div className="space-y-6">
                  <div className="relative rounded-xl overflow-hidden border border-[#E5E5E5] shadow-md">
                    <img
                      src={currentPhotoUrl}
                      alt="Current profile"
                      className="w-full h-64 object-cover"
                      style={{ aspectRatio: "1/1" }}
                      onError={(e) => {
                        e.target.src = "/default-avatar.jpg";
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <div className="bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Check size={12} />
                        Active Profile Photo
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-sm text-[#555555]">
                      This is your current profile photo. Select a new photo on the left to update it.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto rounded-full bg-[#F7F7F7] flex items-center justify-center mb-4">
                    <User size={32} className="text-[#B8B8B8]" />
                  </div>
                  <p className="text-[#555555]">No photo selected yet</p>
                  <p className="text-sm text-[#555555] mt-1">
                    Select a JPEG, JPG, PNG, or WebP photo from your device
                  </p>
                </div>
              )}
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm">
              <h3 className="text-lg font-semibold text-[#111111] mb-4">
                Final Step
              </h3>

              <div className="space-y-4">
                {!photoFile && !uploadedUrl ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Please select a JPEG, JPG, PNG, or WebP photo to continue
                    </p>
                  </div>
                ) : uploadedUrl ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-800">
                      ✅ Photo uploaded successfully! Ready to save to your profile.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      {isUploadingImage 
                        ? "⏳ Uploading photo to server... You can click Save to Profile to finalize."
                        : "Photo selected. Click Save to Profile to upload and update."}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGoBack}
                    className="px-6 py-3 border border-[#E5E5E5] text-[#555555] rounded-lg hover:border-[#E10600] hover:text-[#E10600] transition-all duration-200 flex-1"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={savePhoto}
                    disabled={(!photoFile && !uploadedUrl) || isUploading}
                    className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 flex-1 transition-all duration-200 ${
                      (!photoFile && !uploadedUrl) || isUploading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#E10600] text-white hover:bg-[#C10600] cursor-pointer shadow-md hover:shadow-lg"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Save to Profile
                      </>
                    )}
                  </button>
                </div>

                {(uploadedUrl || photoFile) && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-center text-[#555555]">
                      <span className="font-medium">Note:</span> This will set the uploaded photo as your default profile picture
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm">
              <h4 className="text-sm font-semibold text-[#111111] mb-3">
                🔒 Supported Formats
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <Check size={14} className="text-green-600" />
                  <span className="text-xs font-medium text-green-800">JPEG</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <Check size={14} className="text-green-600" />
                  <span className="text-xs font-medium text-green-800">JPG</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <Check size={14} className="text-green-600" />
                  <span className="text-xs font-medium text-green-800">PNG</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <Check size={14} className="text-green-600" />
                  <span className="text-xs font-medium text-green-800">WebP</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg col-span-2">
                  <XCircle size={14} className="text-red-600" />
                  <span className="text-xs font-medium text-red-800">
                    Other formats (GIF, SVG, BMP) not allowed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadProfilePic;