import React, { useState, useEffect } from "react";
import Axios from "../../services/axios";
import { api } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle,
  X,
  MoreVertical,
  Tag,
  Clock,
  MessageSquare,
  ThumbsUp,
  BookOpen,
} from "lucide-react";

const ShowBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const navigate = useNavigate();

  // Fetch blogs on component mount
  useEffect(() => {
    handleGetBlogs();
  }, []);

  const handleGetBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await Axios.post(api.blog.getBlog);
      // console.log(res, "this is blog")
      setBlogs(res.data.data || []);
    } catch (error) {
      // console.error(error)
      setError("Failed to fetch blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      //   const blogId = id || deleteId

      // console.log(blogId)
      const res = await Axios.post(api.blog.deleteBlog, { blogId });
      // console.log(res, "this delete blog")

      // Remove deleted blog from state
      setBlogs((prev) => prev.filter((blog) => blog.id !== blogId));
      setSelectedBlogs((prev) =>
        prev.filter((selectedId) => selectedId !== blogId),
      );
      setSuccessMessage("Blog deleted successfully!");
      setShowDeleteModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      // console.error(error)
      setError("Failed to delete blog. Please try again.");
    }
  };

  const handleBulkDelete = () => {
    if (selectedBlogs.length === 0) return;

    setDeleteId(selectedBlogs[0]); // For API, you might need bulk delete endpoint
    setShowDeleteModal(true);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBlogs(blogs.map((blog) => blog.id));
    } else {
      setSelectedBlogs([]);
    }
  };

  const handleSelectBlog = (id) => {
    setSelectedBlogs((prev) =>
      prev.includes(id)
        ? prev.filter((blogId) => blogId !== id)
        : [...prev, id],
    );
  };

  const handleCreateNewBlog = () => {
    navigate("/admin/blog");
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Truncate text
  const truncateText = (text, length) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="flex items-center gap-2 bg-[#ECFDF5]0 text-white px-4 py-3 rounded-lg shadow-lg">
              <CheckCircle size={20} />
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage("")}
                className="ml-2 hover:bg-green-600 rounded p-1"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FFFFFF] rounded-xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <AlertTriangle className="text-[#DC2626]" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] text-center mb-2">
                  Delete Blog{selectedBlogs.length > 1 ? "s" : ""}
                </h3>
                <p className="text-[#475569] text-center mb-6">
                  {selectedBlogs.length > 1
                    ? `Are you sure you want to delete ${selectedBlogs.length} selected blogs? This action cannot be undone.`
                    : "Are you sure you want to delete this blog? This action cannot be undone."}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2.5 px-4 border border-[#CBD5E1] rounded-lg text-[#0F172A] hover:bg-[#F8FAFC] transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(deleteId)}
                    className="flex-1 py-2.5 px-4 bg-[#DC2626] text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">
                Blog Management
              </h1>
              <p className="text-[#475569] mt-2">
                Manage and organize your blog posts
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateNewBlog}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Create New Blog
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-wrap gap-10 mb-6">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-[#FFFFFF] p-5 rounded-xl shadow border border-[#E2E8F0] w-[20%]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">Total Blogs</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">
                    {blogs.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="text-[#3B82F6]" size={20} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-[#FFFFFF] p-5 rounded-xl shadow border border-[#E2E8F0] w-[20%]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">Selected</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">
                    {selectedBlogs.length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <Trash2 className="text-[#DC2626]" size={20} />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.header>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#FFFFFF] rounded-xl shadow border border-[#E2E8F0] p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="text-[#475569]">
              Showing {blogs.length} blog{blogs.length !== 1 ? "s" : ""}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#475569]">View:</span>
                <div className="flex bg-[#F8FAFC] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-[#FFFFFF] shadow" : "text-[#475569] hover:text-[#0F172A]"}`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-[#FFFFFF] shadow" : "text-[#475569] hover:text-[#0F172A]"}`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-3">
                {selectedBlogs.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#DC2626] text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Trash2 size={18} />
                    Delete ({selectedBlogs.length})
                  </motion.button>
                )}
                <button
                  onClick={handleGetBlogs}
                  className="p-2.5 border border-[#CBD5E1] rounded-lg text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                  title="Refresh"
                >
                  <Loader2
                    className={`${loading ? "animate-spin" : ""}`}
                    size={20}
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="bg-[#FFFFFF] rounded-xl shadow border border-[#E2E8F0] overflow-hidden">
          {/* Error State */}
          {error && (
            <div className="p-8 text-center">
              <AlertTriangle className="mx-auto text-[#EF4444] mb-3" size={48} />
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                Error Loading Blogs
              </h3>
              <p className="text-[#475569] mb-4">{error}</p>
              <button
                onClick={handleGetBlogs}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Loader2 size={18} />
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && !error && (
            <div className="p-8 text-center">
              <Loader2
                className="mx-auto animate-spin text-[#3B82F6] mb-3"
                size={48}
              />
              <p className="text-[#475569]">Loading blogs...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && blogs.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4">
                <Edit className="text-[#94A3B8]" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                No blogs found
              </h3>
              <p className="text-[#475569] mb-6">
                Start by creating your first blog post!
              </p>
              <button
                onClick={handleCreateNewBlog}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Create First Blog
              </button>
            </div>
          )}

          {/* Blogs Display */}
          {!loading && !error && blogs.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="p-6"
            >
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((blog) => (
                    <motion.div
                      key={blog.id}
                      variants={itemVariants}
                      whileHover={{ y: -8, transition: { duration: 0.2 } }}
                      className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                    >
                      {/* Blog Header with Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                        {blog.image ? (
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${import.meta?.env.VITE_ASSETS_URL}${blog.image}`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="text-blue-300" size={64} />
                          </div>
                        )}
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${blog.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {blog.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>
                        {/* Checkbox */}
                        <div className="absolute top-3 right-3">
                          <input
                            type="checkbox"
                            checked={selectedBlogs.includes(blog.id)}
                            onChange={() => handleSelectBlog(blog.id)}
                            className="rounded border-[#CBD5E1] text-[#3B82F6] focus:ring-blue-500 bg-[#FFFFFF]"
                          />
                        </div>
                      </div>

                      {/* Blog Content */}
                      <div className="p-5">
                        {/* Title and Category */}
                        <div className="mb-3">
                          <h3 className="font-bold text-[#0F172A] text-lg mb-1 line-clamp-1 group-hover:text-[#3B82F6] transition-colors">
                            {blog.title || "Untitled Blog"}
                          </h3>
                          <div className="flex items-center gap-2">
                            {blog.category && (
                              <span className="text-xs px-2 py-1 bg-[#EFF6FF] text-blue-700 rounded">
                                {blog.category}
                              </span>
                            )}
                            <span className="text-xs text-[#64748B] flex items-center gap-1">
                              <Calendar size={12} />
                              {blog.createdAt
                                ? formatDate(blog.createdAt)
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Content Preview */}
                        <p className="text-[#475569] text-sm mb-4 line-clamp-2">
                          {truncateText(blog.description, 120) ||
                            "No content available"}
                        </p>

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {blog.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-[#F8FAFC] text-[#0F172A] text-xs rounded"
                              >
                                <Tag size={10} />
                                {tag}
                              </span>
                            ))}
                            {blog.tags.length > 3 && (
                              <span className="text-xs text-[#64748B] self-center">
                                +{blog.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-end pt-4 border-t border-[#E2E8F0]">
                          {/* Actions */}
                          <div className="flex items-center  gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setDeleteId(blog._id);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-white bg-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                              title="Delete"
                            >
                              Delete
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {blogs.map((blog) => (
                    <motion.div
                      key={blog.id}
                      variants={itemVariants}
                      whileHover={{ x: 4 }}
                      className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={selectedBlogs.includes(blog._id)}
                              onChange={() => handleSelectBlog(blog._id)}
                              className="rounded border-[#CBD5E1] text-[#3B82F6] focus:ring-blue-500"
                            />
                          </div>

                          {/* Blog Image */}
                          <div className="w-32 h-32 flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                            {blog.image ? (
                              <img
                                src={blog.image}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                                  onError={(e) => {
                                                e.target.onerror = null
                                                e.target.src = `${import.meta?.env.VITE_ASSETS_URL}${blog.image}`
                                            }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="text-blue-300" size={40} />
                              </div>
                            )}
                          </div>

                          {/* Blog Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#64748B] flex items-center gap-1">
                                  <Calendar size={12} />
                                  {blog.createdAt
                                    ? formatDate(blog.createdAt)
                                    : "N/A"}
                                </span>
                              </div>
                            </div>

                            <p className="text-[#475569] text-sm mb-3 line-clamp-2">
                              {truncateText(blog.description, 200) ||
                                "No content available"}
                            </p>

                            <div className="flex items-center justify-between">
                              {/* Author and Tags */}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User size={12} className="text-[#3B82F6]" />
                                  </div>
                                  <span className="text-sm text-[#0F172A]">
                                    {blog.author || "Unknown"}
                                  </span>
                                </div>

                                {blog.tags && blog.tags.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    {blog.tags.slice(0, 2).map((tag, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F8FAFC] text-[#0F172A] text-xs rounded"
                                      >
                                        <Tag size={10} />
                                        {tag}
                                      </span>
                                    ))}
                                    {blog.tags.length > 2 && (
                                      <span className="text-xs text-[#64748B]">
                                        +{blog.tags.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setDeleteId(blog.id);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-2 px-5 text-white bg-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  Delete
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowBlog;
