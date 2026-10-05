import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Loader2, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../../services/api';
import { uploadImage } from '../../../services/uploadImage';
import Axios from '../../../services/axios';
import { useNavigate } from 'react-router-dom';

export const getBannerImageUrl = (imgPath) => {
    if (!imgPath || typeof imgPath !== "string" || !imgPath.trim()) {
        return "/favicon.jpg";
    }
    const clean = imgPath.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
        return clean;
    }
    const baseUrl = (import.meta.env.VITE_ASSETS_URL || "http://localhost:9898").trim().replace(/\/$/, "");
    const normalized = clean.startsWith("/") ? clean : `/${clean}`;
    return `${baseUrl}${normalized}`;
};

const CreateBanner = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        page: 'home'
    });
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    const createApi = api.banner.create;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, WEBP)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setImageUploading(true);

        try {
            const imageUrl = await uploadImage(file, "profile");
            setFormData(prev => ({ ...prev, image: imageUrl }));
            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Failed to upload image. Please try again.');
        } finally {
            setImageUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, image: '' }));
        const fileInput = document.getElementById('image-input');
        if (fileInput) fileInput.value = '';
        toast.info('Image removed');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description || !formData.image) {
            toast.error('Please fill in all fields and upload an image');
            return;
        }

        setLoading(true);

        try {
            const adminId = localStorage.getItem("adminId") || sessionStorage.getItem("adminId");
            const response = await Axios.post(createApi, { ...formData, adminId });
            
            if (response.data.success) {
                toast.success('Banner created successfully!');
                setFormData({
                    title: '',
                    description: '',
                    image: '',
                    page: 'home'
                });
                const fileInput = document.getElementById('image-input');
                if (fileInput) fileInput.value = '';
                navigate('/admin/banner');
            }
        } catch (error) {
            console.error('Create banner error:', error);
            toast.error(error.response?.data?.message || 'Failed to create banner. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto"
            >
                <div className="bg-[#FFFFFF] rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ImageIcon className="w-6 h-6" />
                            Create New Banner
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">Add a new banner to display on your website</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-medium text-[#0F172A] mb-2">
                                Title <span className="text-[#EF4444]">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter banner title"
                                className="w-full px-4 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>

                        {/* Description Input */}
                        <div>
                            <label className="block text-sm font-medium text-[#0F172A] mb-2">
                                Description <span className="text-[#EF4444]">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter banner description"
                                rows="4"
                                className="w-full px-4 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                                required
                            />
                        </div>

                        {/* Page Select */}
                        <div>
                            <label className="block text-sm font-medium text-[#0F172A] mb-2">
                                Page
                            </label>
                            <div className="relative">
                                <select
                                    name="page"
                                    value={formData.page}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none bg-[#FFFFFF]"
                                >
                                    <option value="home">Home Page</option>
                                    <option value="login">Login Page</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-4 h-4 pointer-events-none" />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-[#0F172A] mb-2">
                                Banner Image <span className="text-[#EF4444]">*</span>
                            </label>
                            
                            {!formData.image ? (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative"
                                >
                                    <input
                                        type="file"
                                        id="image-input"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={handleImageUpload}
                                        disabled={imageUploading}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="image-input"
                                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all
                                            ${imageUploading 
                                                ? 'border-[#CBD5E1] bg-[#F8FAFC]' 
                                                : 'border-[#CBD5E1] hover:border-blue-500 hover:bg-[#EFF6FF]'
                                            }`}
                                    >
                                        {imageUploading ? (
                                            <div className="flex flex-col items-center">
                                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                                                <p className="text-sm text-[#64748B]">Uploading image...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Upload className="w-10 h-10 text-[#94A3B8] mb-2" />
                                                <p className="text-sm text-[#64748B]">Click to upload banner image</p>
                                                <p className="text-xs text-[#94A3B8] mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                                            </div>
                                        )}
                                    </label>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative group"
                                >
                                    <img
                                        src={getBannerImageUrl(formData.image)}
                                        alt="Banner preview"
                                        className="w-full h-48 object-cover rounded-lg shadow-md bg-[#F8FAFC]"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/favicon.jpg";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="opacity-0 group-hover:opacity-100 transition-all bg-[#EF4444] hover:bg-[#DC2626] text-white p-2 rounded-full"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-[#10B981] mt-2 flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3" />
                                        Image uploaded successfully
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading || imageUploading || !formData.image}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium text-white transition-all
                                    ${loading || imageUploading || !formData.image
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </span>
                                ) : (
                                    'Create Banner'
                                )}
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        title: '',
                                        description: '',
                                        image: '',
                                        page: 'home'
                                    });
                                    const fileInput = document.getElementById('image-input');
                                    if (fileInput) fileInput.value = '';
                                    toast.info('Form reset');
                                }}
                                className="px-6 py-2 border border-[#CBD5E1] rounded-lg font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
                            >
                                Reset
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateBanner;