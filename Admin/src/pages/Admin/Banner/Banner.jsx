import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Home,
  LogIn,
  Upload,
} from "lucide-react";
import Axios from "../../../services/axios";
import { api } from "../../../services/api";
import { uploadImage } from "../../../services/uploadImage";

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

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState("");
  const [viewModal, setViewModal] = useState({ isOpen: false, banner: null });
  const [editModal, setEditModal] = useState({ isOpen: false, banner: null });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    bannerId: null,
  });
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    page: "home",
    image: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [editImageUploading, setEditImageUploading] = useState(false);

  const handleGetBanners = async (page = "") => {
    try {
      setLoading(true);
      const res = await Axios.post(api.banner.get, { page });
      if (res?.data?.success) {
        setBanners(res?.data?.data || []);
      }
    } catch (error) {
      toast.info(error?.response?.data?.message || "Some error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetBanners(selectedPage);
  }, [selectedPage]);

  // Handle Delete Banner
  const handleDeleteBanner = async () => {
    if (!deleteModal.bannerId) return;

    setSubmitting(true);
    try {
      const adminId = localStorage.getItem("adminId") || sessionStorage.getItem("adminId");
      const res = await Axios.post(api.banner.delete, {
        bannerId: deleteModal.bannerId,
        adminId,
      });
      if (res?.data?.success) {
        toast.success("Banner deleted successfully!");
        handleGetBanners(selectedPage);
        setDeleteModal({ isOpen: false, bannerId: null });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete banner");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Image Upload for Edit
  const handleEditImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setEditImageUploading(true);
    try {
      const uploadedUrl = await uploadImage(file, "profile");
      setEditFormData((prev) => ({ ...prev, image: uploadedUrl }));
      toast.success("New banner image uploaded!");
    } catch (err) {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setEditImageUploading(false);
    }
  };

  // Handle Edit Banner
  const handleEditBanner = async (e) => {
    e.preventDefault();
    if (!editModal.banner?._id) return;

    setSubmitting(true);
    try {
      const res = await Axios.post(`${api.banner.update}/${editModal.banner?._id}`, editFormData);
      if (res?.data?.success) {
        toast.success("Banner updated successfully!");
        handleGetBanners(selectedPage);
        setEditModal({ isOpen: false, banner: null });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update banner");
    } finally {
      setSubmitting(false);
    }
  };

  const openViewModal = (banner) => {
    setViewModal({ isOpen: true, banner });
  };

  const openEditModal = (banner) => {
    setEditFormData({
      title: banner.title || "",
      description: banner.description || "",
      page: banner.page || "home",
      image: banner.image || "",
    });
    setEditModal({ isOpen: true, banner });
  };

  const openDeleteModal = (bannerId) => {
    setDeleteModal({ isOpen: true, bannerId });
  };

  const getPageIcon = (page) => {
    return page === "home" ? (
      <Home className="w-4 h-4" />
    ) : (
      <LogIn className="w-4 h-4" />
    );
  };

  const getPageBadgeColor = (page) => {
    return page === "home"
      ? "bg-green-100 text-green-800"
      : "bg-purple-100 text-purple-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFFFFF] rounded-2xl shadow-sm mb-8 p-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">
                Banner Management
              </h1>
              <p className="text-[#475569] mt-1">
                Manage and organize your website banners
              </p>
            </div>
            <Link to="/admin/create-banner">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Create New Banner
              </motion.button>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setSelectedPage("")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPage === ""
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-[#F8FAFC] text-[#0F172A] hover:bg-gray-200"
              }`}
            >
              All Banners
            </button>
            <button
              onClick={() => setSelectedPage("home")}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedPage === "home"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-[#F8FAFC] text-[#0F172A] hover:bg-gray-200"
              }`}
            >
              <Home className="w-4 h-4" />
              Home Page
            </button>
            <button
              onClick={() => setSelectedPage("login")}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedPage === "login"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-[#F8FAFC] text-[#0F172A] hover:bg-gray-200"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Login Page
            </button>
          </div>
        </motion.div>

        {/* Banners Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#FFFFFF] rounded-2xl shadow-sm p-12 text-center"
          >
            <ImageIcon className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
              No Banners Found
            </h3>
            <p className="text-[#64748B] mb-6">
              Create your first banner to get started
            </p>
            <Link to="/admin/create-banner">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all">
                Create Banner
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {banners.map((banner, index) => (
                <motion.div
                  key={banner._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#FFFFFF] rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Banner Image */}
                  <div className="relative h-48 overflow-hidden bg-[#F8FAFC] flex items-center justify-center">
                    <img
                      src={getBannerImageUrl(banner.image)}
                      alt={banner.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/favicon.jpg";
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPageBadgeColor(banner.page)}`}
                      >
                        {getPageIcon(banner.page)}
                        {banner.page === "home" ? "Home" : "Login"}
                      </span>
                    </div>
                  </div>

                  {/* Banner Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-[#0F172A] mb-2 line-clamp-1">
                      {banner.title}
                    </h3>
                    <p className="text-[#475569] text-sm mb-4 line-clamp-2">
                      {banner.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openViewModal(banner)}
                        className="flex-1 bg-[#F8FAFC] hover:bg-gray-200 text-[#0F172A] py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(banner)}
                        className="flex-1 bg-[#EFF6FF] hover:bg-blue-100 text-blue-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteModal(banner._id)}
                        className="flex-1 bg-[#FEF2F2] hover:bg-red-100 text-red-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* View Modal */}
        <AnimatePresence>
          {viewModal.isOpen && viewModal.banner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setViewModal({ isOpen: false, banner: null })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-[#FFFFFF] border-b px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-[#0F172A]">
                    Banner Details
                  </h2>
                  <button
                    onClick={() =>
                      setViewModal({ isOpen: false, banner: null })
                    }
                    className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <img
                    src={getBannerImageUrl(viewModal.banner.image)}
                    alt={viewModal.banner.title}
                    className="w-full h-64 object-cover rounded-lg mb-6 bg-[#F8FAFC]"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/favicon.jpg";
                    }}
                  />
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#64748B]">
                        Title
                      </label>
                      <p className="text-lg font-semibold text-[#0F172A]">
                        {viewModal.banner.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#64748B]">
                        Description
                      </label>
                      <p className="text-[#0F172A]">
                        {viewModal.banner.description}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#64748B]">
                        Page
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        {getPageIcon(viewModal.banner.page)}
                        <span className="capitalize">
                          {viewModal.banner.page}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {editModal.isOpen && editModal.banner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setEditModal({ isOpen: false, banner: null })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#FFFFFF] rounded-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-[#0F172A]">
                    Edit Banner
                  </h2>
                  <button
                    onClick={() =>
                      setEditModal({ isOpen: false, banner: null })
                    }
                    className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleEditBanner} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                      Description
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                      rows="3"
                      className="w-full px-4 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                      Page
                    </label>
                    <select
                      value={editFormData.page}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          page: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="home">Home Page</option>
                      <option value="login">Login Page</option>
                    </select>
                  </div>

                  {/* Banner Image Preview & Replace */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                      Banner Image
                    </label>
                    {editFormData.image ? (
                      <div className="relative h-36 w-full rounded-lg overflow-hidden mb-3 border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center">
                        <img
                          src={getBannerImageUrl(editFormData.image)}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/favicon.jpg";
                          }}
                        />
                      </div>
                    ) : null}

                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-[#CBD5E1] rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-all">
                        <Upload className="w-4 h-4" />
                        <span>{editImageUploading ? "Uploading..." : "Replace Image"}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleEditImageUpload}
                          disabled={editImageUploading}
                          className="hidden"
                        />
                      </label>
                      {editImageUploading && (
                        <Loader2 className="w-5 h-5 text-[#3B82F6] animate-spin" />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {submitting ? "Updating..." : "Update Banner"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditModal({ isOpen: false, banner: null })
                      }
                      className="flex-1 border border-[#CBD5E1] text-[#0F172A] py-2 rounded-lg font-medium hover:bg-[#F8FAFC] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteModal.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteModal({ isOpen: false, bannerId: null })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#FFFFFF] rounded-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-red-100 rounded-full p-3">
                      <Trash2 className="w-8 h-8 text-[#DC2626]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center text-[#0F172A] mb-2">
                    Delete Banner
                  </h3>
                  <p className="text-[#475569] text-center mb-6">
                    Are you sure you want to delete this banner? This action
                    cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteBanner}
                      disabled={submitting}
                      className="flex-1 bg-[#DC2626] text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      {submitting ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({ isOpen: false, bannerId: null })
                      }
                      className="flex-1 border border-[#CBD5E1] text-[#0F172A] py-2 rounded-lg font-medium hover:bg-[#F8FAFC] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Banner;
