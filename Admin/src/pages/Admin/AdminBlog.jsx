import React, { useState } from 'react'
import Axios from '../../services/axios'
import { api } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Type, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  ExternalLink
} from 'lucide-react'
import { uploadImage } from '../../services/uploadImage'

const AdminBlog = () => {
    const [formData, setFormData] = useState({
        image: '',
        title: '',
        description: '',
    })
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [imagePreview, setImagePreview] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [createdBlog, setCreatedBlog] = useState(null)

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
        setSuccess('')
    }

    // Handle image upload
    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB')
                return
            }


            setUploading(true)
            setImageFile(file)
            
            // Create local preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)

            try {
                // Upload to server
                const imageUrl = await uploadImage(file)
                // console.log(imageUrl, "this is image url")
                
                if (imageUrl) {
                    setFormData(prev => ({ ...prev, image: imageUrl }))
                    setError('')
                } else {
                    setError('Failed to upload image. Please try again.')
                    setImagePreview('')
                    setImageFile(null)
                }
            } catch (uploadError) {
                // console.error('Upload error:', uploadError)
                setError('Failed to upload image. Please try again.')
                setImagePreview('')
                setImageFile(null)
            } finally {
                setUploading(false)
            }
        }
    }

    // Handle form submission
    const handleCreateBlog = async (e) => {
        e.preventDefault()
        
        // Validation
        if (!formData.image) {
            setError('Please upload a blog image')
            return
        }
        if (!formData.title.trim()) {
            setError('Blog title is required')
            return
        }
        if (formData.title.length < 10) {
            setError('Title should be at least 10 characters long')
            return
        }
        if (!formData.description.trim()) {
            setError('Blog description is required')
            return
        }
        if (formData.description.length < 50) {
            setError('Description should be at least 50 characters long')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')
        setCreatedBlog(null)

        try {
            const res = await Axios.post(api.blog.createBlog, formData)
            // console.log(res, "this is res")
            
            if (res.data.success) {
                setSuccess('Blog created successfully!')
                setCreatedBlog(res.data.blog)
                
                // Reset form
                setFormData({
                    image: '',
                    title: '',
                    description: '',
                })
                setImagePreview('')
                setImageFile(null)
                
                // Clear success message after 5 seconds
                setTimeout(() => {
                    setSuccess('')
                }, 5000)
            } else {
                setError(res.data.message || 'Failed to create blog')
            }
        } catch (error) {
            // console.error('Create blog error:', error)
            setError(
                error.response?.data?.message || 
                error.response?.data?.error || 
                'Something went wrong. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    // Remove selected image
    const handleRemoveImage = () => {
        setImagePreview('')
        setImageFile(null)
        setFormData(prev => ({ ...prev, image: '' }))
        setError('')
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    }

    const formVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { type: "spring", stiffness: 100, delay: 0.1 }
        }
    }

    return (
        <motion.div 
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div 
                    className="mb-8 text-center"
                    variants={itemVariants}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                        className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg"
                    >
                        <FileText className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Create New Blog Post
                    </h1>
                    <p className="text-[#475569] max-w-2xl mx-auto">
                        Share your knowledge and insights with a beautifully crafted blog post
                    </p>
                </motion.div>

                {/* Alerts */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6"
                        >
                            <div className="bg-[#FEF2F2] border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-[#EF4444] mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-red-700 font-medium">Error</p>
                                        <p className="text-[#DC2626]">{error}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6"
                        >
                            <div className="bg-[#ECFDF5] border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-[#10B981] mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-green-700 font-medium">Success!</p>
                                        <p className="text-[#10B981]">{success}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Blog Preview */}
                    <motion.div 
                        variants={itemVariants}
                        className="lg:col-span-2"
                    >
                        <div className="bg-[#FFFFFF] rounded-2xl shadow-xl overflow-hidden">
                            <form onSubmit={handleCreateBlog} className="p-6 md:p-8">
                                {/* Image Upload Section */}
                                <motion.div variants={itemVariants} className="mb-8">
                                    <label className="block text-sm font-semibold text-[#0F172A] mb-4 flex items-center">
                                        <ImageIcon className="w-5 h-5 mr-2 text-[#3B82F6]" />
                                        Blog Cover Image
                                        <span className="text-[#EF4444] ml-1">*</span>
                                    </label>
                                    
                                    <div className="space-y-4">
                                        {imagePreview ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="relative"
                                            >
                                                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border-2 border-[#E2E8F0] shadow-md">
                                                    <img 
                                                        src={imagePreview} 
                                                        alt="Preview" 
                                                        className="w-full h-full object-cover"
                                                          onError={(e) => {
                                                e.target.onerror = null
                                                e.target.src = `${import.meta?.env.VITE_ASSETS_URL}${imagePreview}`
                                            }}
                                                    />
                                                    {uploading && (
                                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                                <motion.button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="absolute -top-2 -right-2 bg-[#EF4444] text-white p-2 rounded-full shadow-lg hover:bg-[#DC2626] transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </motion.button>
                                                {imageFile && (
                                                    <div className="mt-2 text-sm text-[#475569] flex items-center justify-between">
                                                        <span className="truncate">{imageFile.name}</span>
                                                        <span className="text-[#64748B]">
                                                            {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ) : (
                                            <motion.label
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${uploading ? 'border-blue-300 bg-[#EFF6FF]' : 'border-[#CBD5E1] hover:border-blue-400 hover:bg-[#EFF6FF]'}`}
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    disabled={uploading}
                                                />
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    {uploading ? (
                                                        <>
                                                            <Loader2 className="w-12 h-12 text-blue-500 mb-4 animate-spin" />
                                                            <p className="text-[#3B82F6] font-medium">Uploading...</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-12 h-12 text-[#94A3B8] mb-4" />
                                                            <p className="mb-2 text-sm text-[#475569]">
                                                                <span className="font-semibold text-[#3B82F6]">Click to upload</span> or drag and drop
                                                            </p>
                                                            <p className="text-xs text-[#64748B]">
                                                                PNG, JPG, WEBP (Max. 5MB)
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.label>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Title Input */}
                                <motion.div variants={itemVariants} className="mb-8">
                                    <label className="block text-sm font-semibold text-[#0F172A] mb-2 flex items-center">
                                        <Type className="w-5 h-5 mr-2 text-[#3B82F6]" />
                                        Blog Title
                                        <span className="text-[#EF4444] ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Write an engaging blog title here..."
                                        className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] focus:border-blue-500 focus:ring-3 focus:ring-blue-200 outline-none transition-all text-lg"
                                        required
                                    />
                                    <div className="flex justify-between mt-2">
                                        <p className="text-xs text-[#64748B]">
                                            Keep it concise but descriptive
                                        </p>
                                        <p className={`text-xs ${formData.title.length < 10 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                                            {formData.title.length}/100 characters
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Description Input */}
                                <motion.div variants={itemVariants} className="mb-8">
                                    <label className="block text-sm font-semibold text-[#0F172A] mb-2 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-[#3B82F6]" />
                                        Blog Content
                                        <span className="text-[#EF4444] ml-1">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Start writing your blog content here... You can use markdown for formatting."
                                        rows="10"
                                        className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] focus:border-blue-500 focus:ring-3 focus:ring-blue-200 outline-none transition-all resize-none font-sans"
                                        required
                                    />
                                    <div className="flex justify-between mt-2">
                                        <p className="text-xs text-[#64748B]">
                                            Write at least 50 characters
                                        </p>
                                        <p className={`text-xs ${formData.description.length < 100 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                                            {formData.description.length} characters
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Submit Button */}
                                <motion.div variants={itemVariants}>
                                    <motion.button
                                        type="submit"
                                        disabled={loading || uploading || !formData.image}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Creating Blog Post...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5" />
                                                Publish Blog Post
                                            </>
                                        )}
                                    </motion.button>
                                </motion.div>
                            </form>
                        </div>
                    </motion.div>

                    {/* Right Column - Preview & Stats */}
                    <div className="space-y-6">
                        {/* Live Preview */}
                        <motion.div 
                            variants={itemVariants}
                            className="bg-[#FFFFFF] rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-[#0F172A] flex items-center">
                                        <Eye className="w-5 h-5 mr-2 text-[#3B82F6]" />
                                        Live Preview
                                    </h3>
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                        Real-time
                                    </span>
                                </div>
                                
                                {formData.title || formData.image || formData.description ? (
                                    <div className="space-y-4">
                                        {/* Preview Image */}
                                        {formData.image && (
                                            <div className="aspect-[16/9] rounded-lg overflow-hidden">
                                                <img 
                                                    src={formData.image} 
                                                    alt="Blog preview" 
                                                    className="w-full h-full object-cover"
                                                      onError={(e) => {
                                                e.target.onerror = null
                                                e.target.src = `${import.meta?.env.VITE_ASSETS_URL}${formData.image}`
                                            }}
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Preview Content */}
                                        <div className="space-y-3">
                                            {formData.title && (
                                                <h4 className="text-xl font-bold text-[#0F172A] line-clamp-2">
                                                    {formData.title}
                                                </h4>
                                            )}
                                            {formData.description && (
                                                <p className="text-[#475569] text-sm line-clamp-4">
                                                    {formData.description}
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* Preview Stats */}
                                        <div className="pt-4 border-t border-[#E2E8F0]">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="text-[#64748B]">Read time:</div>
                                                <div className="text-[#0F172A] font-medium">
                                                    {Math.ceil(formData.description.length / 1000)} min read
                                                </div>
                                                <div className="text-[#64748B]">Status:</div>
                                                <div className="text-[#10B981] font-medium">Draft</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-8 h-8 text-[#94A3B8]" />
                                        </div>
                                        <p className="text-[#64748B]">Start writing to see preview</p>
                                        <p className="text-[#94A3B8] text-sm mt-1">
                                            Your blog preview will appear here
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Created Blog Card */}
                        {createdBlog && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-[#0F172A] flex items-center">
                                            <CheckCircle className="w-5 h-5 mr-2 text-[#10B981]" />
                                            Published!
                                        </h3>
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                            New
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {createdBlog.image && (
                                            <div className="aspect-[16/9] rounded-lg overflow-hidden">
                                                <img 
                                                    src={createdBlog.image} 
                                                    alt={createdBlog.title} 
                                                    className="w-full h-full object-cover"
                                                      onError={(e) => {
                                                e.target.onerror = null
                                                e.target.src = `${import.meta?.env.VITE_ASSETS_URL}${createdBlog.image}`
                                            }}
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-[#0F172A] line-clamp-2">
                                                {createdBlog.title}
                                            </h4>
                                            <p className="text-[#475569] text-sm line-clamp-2">
                                                {createdBlog.description}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-green-200">
                                            <div className="text-sm text-[#475569]">
                                                ID: <span className="font-mono">{createdBlog._id?.slice(-8)}</span>
                                            </div>
                                            <button
                                                onClick={() => window.open(`/blog/${createdBlog._id}`, '_blank')}
                                                className="flex items-center gap-1 text-sm text-[#3B82F6] hover:text-blue-700 font-medium"
                                            >
                                                View Blog
                                                <ExternalLink className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Quick Stats */}
                        <motion.div 
                            variants={itemVariants}
                            className="bg-[#FFFFFF] rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
                                    Quick Stats
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#475569]">Image Uploaded</span>
                                        <span className={`font-medium ${formData.image ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                            {formData.image ? '✓ Ready' : '✗ Required'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#475569]">Title Length</span>
                                        <span className={`font-medium ${formData.title.length >= 10 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                            {formData.title.length}/10
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#475569]">Content Length</span>
                                        <span className={`font-medium ${formData.description.length >= 100 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                            {formData.description.length}/100
                                        </span>
                                    </div>
                                    <div className="pt-4 border-t border-[#E2E8F0]">
                                        <div className="text-center">
                                            <div className="text-sm text-[#64748B] mb-1">Form Status</div>
                                            <div className={`text-lg font-bold ${formData.image && formData.title.length >= 10 && formData.description.length >= 100 ? 'text-[#10B981]' : 'text-yellow-600'}`}>
                                                {formData.image && formData.title.length >= 10 && formData.description.length >= 100 
                                                    ? 'Ready to Publish' 
                                                    : 'Needs Attention'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default AdminBlog