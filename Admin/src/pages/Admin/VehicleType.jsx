import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Car, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle, 
  XCircle,
  Upload,
  Plus,
  Save,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Axios from '../../services/axios'
import { api } from '../../services/api'
import { uploadImage } from '../../services/uploadImage' // Fixed import path
import {useNavigate} from "react-router-dom"

const VehicleType = () => {
    const [formData, setFormData] = useState({
        type: '',
        image: '',
        description: '',
        maxParcelWeight: 5,
        createdBy: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false) // Fixed variable name
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [previewImage, setPreviewImage] = useState('')
    const navigate  = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Update preview when image URL changes
        if (name === 'image') {
            setPreviewImage(value)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB')
            return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }

        setIsUploading(true)
        
        // Create local preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreviewImage(reader.result)
        }
        reader.readAsDataURL(file)

        try {
            // Upload to server
            const imageUrl = await uploadImage(file)
            // console.log(imageUrl, "this is image url")
            
            if (imageUrl) {
                setFormData(prev => ({ 
                    ...prev, 
                    image: imageUrl 
                }))
                setError('')
            } else {
                setError('Failed to upload image. Please try again.')
                setPreviewImage('')
            }
        } catch (uploadError) {
            // console.error('Upload error:', uploadError)
            setError('Failed to upload image. Please try again.')
            setPreviewImage('')
        } finally {
            setIsUploading(false)
        }
    }

    const validateForm = () => {
        if (!formData.type.trim()) {
            setError('Vehicle type is required')
            return false
        }
        if (!formData.image) {
            setError('Please upload an image or provide an image URL')
            return false
        }
        return true
    }

    const handleCreateVehicleType = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }
        
        setIsLoading(true)
        setError('')
        
        try {
            const res = await Axios.post(
                api.vehicleType.createVehicleType,
                formData
            )
            
            // console.log(res, "this is response")
            
            // Show success
            setSuccess(true)
            
            // Reset form
            setFormData({
                type: '',
                image: '',
                description: '',
                createdBy: ''
            })
            setPreviewImage('')
            
            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000)
            navigate("/admin/show-vehicle-type")
            
        } catch (error) {
            // console.error(error)
            setError(error.response?.data?.message || 'Failed to create vehicle type')
        } finally {
            setIsLoading(false)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    }

    const buttonVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Car className="w-8 h-8 text-[#3B82F6]" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#0F172A]">
                            Create New Vehicle Type
                        </h1>
                    </div>
                    <p className="text-[#475569]">
                        Add a new vehicle category to your system
                    </p>
                </motion.div>

                {/* Success Message */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-[#ECFDF5] border border-green-200 rounded-xl flex items-center gap-3"
                        >
                            <CheckCircle className="w-5 h-5 text-[#10B981]" />
                            <span className="text-green-700 font-medium">
                                Vehicle type created successfully!
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-[#DC2626] mt-0.5" />
                            <div className="flex-1">
                                <span className="text-red-700 font-medium">
                                    Error
                                </span>
                                <p className="text-[#DC2626] text-sm mt-1">
                                    {error}
                                </p>
                            </div>
                            <button
                                onClick={() => setError('')}
                                className="ml-auto flex-shrink-0"
                            >
                                <XCircle className="w-5 h-5 text-red-400 hover:text-[#DC2626] transition-colors" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <motion.form
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        onSubmit={handleCreateVehicleType}
                        className="bg-[#FFFFFF] rounded-2xl shadow-lg p-6 md:p-8"
                    >
                        <h2 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Vehicle Details
                        </h2>

                        {/* Type Field */}
                        <motion.div variants={itemVariants} className="mb-6">
                            <label className="flex items-center gap-2 text-[#0F172A] font-medium mb-2">
                                <Car className="w-4 h-4" />
                                Vehicle Type
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Sedan, SUV, Truck"
                                    className="w-full px-4 py-3 pl-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                                <Car className="absolute left-3 top-3.5 w-4 h-4 text-[#94A3B8]" />
                            </div>
                        </motion.div>

                        {/* Image Field */}
                        <motion.div variants={itemVariants} className="mb-6">
                            <label className="flex items-center gap-2 text-[#0F172A] font-medium mb-2">
                                <ImageIcon className="w-4 h-4" />
                                Vehicle Image
                            </label>
                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        placeholder="Enter image URL or upload below"
                                        className="w-full px-4 py-3 pl-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                    <ImageIcon className="absolute left-3 top-3.5 w-4 h-4 text-[#94A3B8]" />
                                </div>
                                
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                                            isUploading 
                                                ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#94A3B8] cursor-not-allowed' 
                                                : 'bg-[#EFF6FF] border-blue-200 text-[#3B82F6] hover:bg-blue-100 hover:border-blue-300'
                                        }`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="font-medium">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                <span className="font-medium">Upload Image</span>
                                            </>
                                        )}
                                    </label>
                                    <p className="text-xs text-[#64748B] mt-2">
                                        Supports: JPG, PNG, GIF • Max size: 5MB
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description Field */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <label className="flex items-center gap-2 text-[#0F172A] font-medium mb-2">
                                <FileText className="w-4 h-4" />
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe the vehicle type features and specifications..."
                                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                            />
                        </motion.div>

                        {/* Max Parcel Weight Field */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <label className="flex items-center gap-2 text-[#0F172A] font-medium mb-2">
                                <FileText className="w-4 h-4" />
                                Max Parcel Weight (KG)
                            </label>
                            <input
                                type="number"
                                name="maxParcelWeight"
                                value={formData.maxParcelWeight}
                                onChange={handleChange}
                                min="1"
                                placeholder="Enter maximum parcel weight (e.g. 10)"
                                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                required
                            />
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div variants={itemVariants}>
                            <motion.button
                                type="submit"
                                disabled={isLoading || isUploading}
                                variants={buttonVariants}
                                initial="initial"
                                whileHover={!isLoading && !isUploading ? "hover" : {}}
                                whileTap={!isLoading && !isUploading ? "tap" : {}}
                                className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                                    isLoading || isUploading
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Create Vehicle Type
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </motion.form>

                    {/* Preview Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#FFFFFF] rounded-2xl shadow-lg p-6 md:p-8"
                    >
                        <h2 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Preview
                        </h2>

                        {/* Preview Card */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-[#E2E8F0]">
                            {previewImage ? (
                                <div className="mb-4">
                                    <img
                                        src={previewImage}
                                        alt="Vehicle preview"
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                          onError={(e) => {
                                                e.target.onerror = null
                                                e.target.src = `${import.meta?.env.VITE_ASSETS_URL}${previewImage}`
                                            }}
                                    />
                                </div>
                            ) : (
                                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex flex-col items-center justify-center mb-4 border-2 border-dashed border-[#CBD5E1]">
                                    <ImageIcon className="w-12 h-12 text-[#94A3B8] mb-2" />
                                    <p className="text-[#64748B] text-sm text-center">
                                        Image preview will appear here
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#0F172A]">
                                        {formData.type || 'Vehicle Type Name'}
                                    </h3>
                                    {formData.type && (
                                        <p className="text-sm text-[#64748B]">
                                            Type
                                        </p>
                                    )}
                                </div>

                                {formData.description && (
                                    <div>
                                        <h4 className="font-medium text-[#0F172A] mb-1">
                                            Description
                                        </h4>
                                        <p className="text-[#475569] text-sm leading-relaxed">
                                            {formData.description}
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-[#E2E8F0]">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-[#64748B]">
                                            Status
                                        </span>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-[#EFF6FF] rounded-lg border border-blue-100">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-[#3B82F6] mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-blue-800 mb-1">
                                        Tips
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Use clear, descriptive vehicle type names</li>
                                        <li>• High-quality images recommended</li>
                                        <li>• Keep descriptions concise but informative</li>
                                        <li>• Supported formats: JPG, PNG, GIF</li>
                                        <li>• Maximum file size: 5MB</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Stats Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 pt-6 border-t border-[#E2E8F0]"
                >
                    <div className="flex flex-wrap items-center justify-between text-sm text-[#64748B]">
                        <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded ${formData.type ? 'bg-green-100 text-green-700' : 'bg-[#F8FAFC] text-[#0F172A]'}`}>
                                Status: {formData.type ? 'Filled' : 'Empty'}
                            </span>
                            <span>Fields: 4</span>
                            <span>Required: 2</span>
                        </div>
                        <div>
                            <span>All fields are validated in real-time</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default VehicleType