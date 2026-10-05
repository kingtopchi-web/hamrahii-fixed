import React, { useState, useEffect } from 'react';
import { 
  Send,
  Bell,
  AlertCircle,
  Loader,
  Link as LinkIcon,
  CheckCircle,
  X,
  Image as ImageIcon,
  Upload,
  Eye,
  Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import Axios from '../../services/axios';
import { api } from '../../services/api';
import { uploadImage } from '../../services/uploadImage';

const getPreviewUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = (import.meta.env.VITE_ASSETS_URL || 'http://localhost:9898').replace(/\/$/, '');
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${normalized}`;
};

const BroadCast = () => {
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    icon: '', // URL from uploaded image
    link: ''  // Optional: Deep link URL
  });

  // Professional color palette
  const colors = {
    primary: '#111111',
    secondary: '#555555',
    accent: '#E10600',
    background: '#FFFFFF',
    surface: '#F7F7F7',
    border: '#E5E5E5',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    textPrimary: '#111111',
    textSecondary: '#555555',
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const imageUrl = await uploadImage(file);
      
      setFormData(prev => ({
        ...prev,
        icon: imageUrl
      }));
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      // console.error('Error uploading image:', error);
      toast.error(error?.response?.data?.message || 'Failed to upload image');
      setPreviewImage(null);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      icon: ''
    }));
    setPreviewImage(null);
  };

  // Handle broadcast submission
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.body.trim()) {
      toast.error('Message body is required');
      return;
    }

    setSending(true);
    
    try {
      const response = await Axios.post(api.admin.broadCast, {
        ...formData,
        image: formData.icon,
      });
      
      if (response.data.success) {
        toast.success('Broadcast sent successfully!');
        
        // Reset form
        setFormData({
          title: '',
          body: '',
          icon: '',
          link: ''
        });
        setPreviewImage(null);
        
        // Show stats
        if (response.data.stats) {
          const { successCount, failureCount } = response.data.stats;
          const total = successCount + failureCount;
          toast.info(`Delivered to ${successCount}/${total} devices${failureCount > 0 ? `, ${failureCount} failed` : ''}`);
        }
      
      } else {
        toast.error(response.data.message || 'Failed to send broadcast');
      }
    } catch (error) {
      // console.error('Error sending broadcast:', error);
      
      if (error.response) {
        toast.error(error.response.data?.message || 'Failed to send broadcast');
      } else if (error.request) {
        toast.error('No response from server');
      } else {
        toast.error('Error: ' + error.message);
      }
    } finally {
      setSending(false);
    }
  };

  // Clear form
  const clearForm = () => {
    setFormData({
      title: '',
      body: '',
      icon: '',
      link: ''
    });
    setPreviewImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F7F7] to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-[#FFFFFF] shadow-sm border border-[#E5E5E5]">
                <Bell className="w-6 h-6" style={{ color: colors.accent }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
                  Broadcast Notification
                </h1>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Send push notifications to all users
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Send Broadcast Form */}
        <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
          {/* Form Header */}
          <div className="border-b border-[#E5E5E5] px-6 py-4 bg-gradient-to-r from-white to-[#F7F7F7]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.accent}10` }}>
                  <Send className="w-5 h-5" style={{ color: colors.accent }} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
                    Send Notification
                  </h2>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    This will be sent to all active users
                  </p>
                </div>
              </div>
              <button
                onClick={clearForm}
                disabled={sending}
                className="px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 hover:bg-[#F7F7F7] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  borderColor: colors.border,
                  color: colors.textSecondary
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleBroadcastSubmit} className="p-6 space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: colors.primary }}>
                  Notification Title *
                </label>
                <span className="text-xs" style={{ color: colors.textSecondary }}>
                  {formData.title.length}/100
                </span>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength={100}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#E10600] focus:border-transparent transition-all duration-200"
                style={{ 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
                placeholder="Enter notification title (max 100 characters)"
              />
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Make it clear and attention-grabbing
              </p>
            </div>

            {/* Message Body Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: colors.primary }}>
                  Message Body *
                </label>
                <span className="text-xs" style={{ color: colors.textSecondary }}>
                  {formData.body.length}/500
                </span>
              </div>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                required
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#E10600] focus:border-transparent transition-all duration-200 resize-none"
                style={{ 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
                placeholder="Enter your message here (max 500 characters)"
              />
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Be concise and include important details
              </p>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium" style={{ color: colors.primary }}>
                Notification Icon (Optional)
              </label>
              
              {formData.icon || previewImage ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border" 
                     style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
                  <div className="relative">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border" style={{ borderColor: colors.border }}>
                      <img 
                        src={previewImage || getPreviewUrl(formData.icon)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/default-avatar.jpg";
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 p-1.5 bg-[#FFFFFF] rounded-full shadow-sm border hover:bg-[#F7F7F7] transition-colors"
                      style={{ borderColor: colors.border }}
                    >
                      <Trash2 className="w-3.5 h-3.5" style={{ color: colors.error }} />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
                      <span className="text-sm font-medium" style={{ color: colors.primary }}>
                        Image uploaded successfully
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      This image will appear as the notification icon
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 hover:border-[#E10600] hover:bg-[#F7F7F7]/50"
                  style={{ borderColor: colors.border }}
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${colors.accent}10` }}>
                      {uploading ? (
                        <Loader className="w-6 h-6 animate-spin" style={{ color: colors.accent }} />
                      ) : (
                        <Upload className="w-6 h-6" style={{ color: colors.accent }} />
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: colors.primary }}>
                        {uploading ? 'Uploading image...' : 'Upload notification icon'}
                      </p>
                      <p className="text-xs" style={{ color: colors.textSecondary }}>
                        PNG, JPG or WebP • Max 5MB • Recommended: 512×512
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                      style={{ 
                        borderColor: colors.border,
                        color: colors.textSecondary,
                        backgroundColor: colors.background
                      }}
                    >
                      Choose File
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Deep Link Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: colors.primary }}>
                Deep Link (Optional)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <LinkIcon className="w-4 h-4" style={{ color: colors.textSecondary }} />
                </div>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#E10600] focus:border-transparent transition-all duration-200"
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                  placeholder="app://screen or https://example.com"
                />
              </div>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Opens a specific screen in the app or a web URL
              </p>
            </div>

            {/* Live Preview */}
            {(formData.title || formData.body) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" style={{ color: colors.accent }} />
                    <span className="text-sm font-medium" style={{ color: colors.primary }}>
                      Live Preview
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-[#ECFDF5]0"></div>
                    <span className="text-xs" style={{ color: colors.textSecondary }}>Active</span>
                  </div>
                </div>
                
                <div className="bg-[#F7F7F7] rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border" style={{ borderColor: colors.border }}>
                        {formData.icon || previewImage ? (
                          <img 
                            src={formData.icon || previewImage} 
                            alt="Icon" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" 
                               style={{ backgroundColor: colors.accent, color: 'white' }}>
                            <Bell className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {formData.title && (
                        <div className="font-semibold text-sm mb-1 truncate" style={{ color: colors.primary }}>
                          {formData.title}
                        </div>
                      )}
                      {formData.body && (
                        <div className="text-xs line-clamp-2" style={{ color: colors.textSecondary }}>
                          {formData.body}
                        </div>
                      )}
                      {formData.link && (
                        <div className="text-xs mt-2" style={{ color: colors.accent }}>
                          Tap to open
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Important Note */}
            <div className="p-4 rounded-lg border" style={{ borderColor: `${colors.accent}20`, backgroundColor: `${colors.accent}5` }}>
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: colors.accent }} />
                <div className="text-sm">
                  <p className="font-medium mb-1" style={{ color: colors.primary }}>
                    Important Notes
                  </p>
                  <ul className="space-y-1 text-xs" style={{ color: colors.textSecondary }}>
                    <li>• Notifications are sent to all active users immediately</li>
                    <li>• Users must have push notifications enabled</li>
                    <li>• This action cannot be undone once sent</li>
                    <li>• Verify all details before sending</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
              <button
                type="submit"
                disabled={sending || uploading}
                className="w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                style={{ 
                  backgroundColor: colors.accent,
                  boxShadow: `0 4px 14px ${colors.accent}40`
                }}
              >
                {sending ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Sending Notification...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Broadcast Notification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E5E5E5]">
            <div className="flex items-start space-x-3">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${colors.success}10` }}>
                <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: colors.primary }}>
                  Clear & Concise
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Keep messages short and to the point
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E5E5E5]">
            <div className="flex items-start space-x-3">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${colors.info}10` }}>
                <AlertCircle className="w-4 h-4" style={{ color: colors.info }} />
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: colors.primary }}>
                  Best Timing
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Send during peak user activity hours
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E5E5E5]">
            <div className="flex items-start space-x-3">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${colors.warning}10` }}>
                <Bell className="w-4 h-4" style={{ color: colors.warning }} />
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: colors.primary }}>
                  Test First
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Always test with a small group first
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadCast;