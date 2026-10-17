import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  BookOpen,
  ChevronRight,
  Check,
  Tag,
  Car,
  Package
} from "lucide-react";
import { api } from "../services/endpoints";
import { getBlogImageUrl, getFallbackBlogImage, createSafeSlug } from "../utils/blogImageHelper";

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [blog, setBlog] = useState(location.state?.blog || null);
  const [loading, setLoading] = useState(!location.state?.blog);
  const [error, setError] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    // If blog was passed through navigation state and matches the current slug
    if (location.state?.blog) {
      const stateSlug = createSafeSlug(location.state.blog.slug || location.state.blog.title);
      if (stateSlug === slug || location.state.blog._id === slug || String(location.state.blog.id) === slug) {
        setBlog(location.state.blog);
        setLoading(false);
        fetchRelated(location.state.blog);
        return;
      }
    }

    // Otherwise fetch blogs and match
    fetchBlogBySlug();
  }, [slug]);

  useEffect(() => {
    if (blog?.title) {
      document.title = `${blog.title} - Humrahii`;
    }
  }, [blog]);

  const fetchBlogBySlug = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${api.blog.getAllBlog}?page=1&limit=20`);

      if (response.data.success && Array.isArray(response.data.data)) {
        const blogsList = response.data.data;
        const matched = blogsList.find((b) => {
          const safe = createSafeSlug(b.slug || b.title);
          return safe === slug || b._id === slug || String(b.id) === slug;
        });

        if (matched) {
          const formattedBlog = {
            id: matched._id || matched.id,
            title: matched.title || "Untitled",
            description: matched.description || matched.content || "",
            excerpt: matched.excerpt || matched.description?.substring(0, 160) || "",
            category: matched.category?.toLowerCase() || "general",
            author: matched.author?.name || matched.author || "HumRahii Team",
            date: formatDate(matched.createdAt || matched.date),
            readTime: calculateReadTime(matched.description || matched.content),
            image: matched.image,
            slug: createSafeSlug(matched.slug || matched.title)
          };
          setBlog(formattedBlog);
          fetchRelated(formattedBlog, blogsList);
        } else {
          setError("The requested article could not be found.");
        }
      } else {
        setError("Unable to load blog articles at this time.");
      }
    } catch (err) {
      console.error("Error fetching blog details:", err);
      setError("Failed to load article. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = (currentBlog, allList = null) => {
    if (allList && Array.isArray(allList)) {
      const others = allList
        .filter((b) => (b._id || b.id) !== currentBlog?.id)
        .slice(0, 3)
        .map((b) => ({
          id: b._id || b.id,
          title: b.title,
          excerpt: b.excerpt || b.description?.substring(0, 100),
          category: b.category?.toLowerCase() || "general",
          author: b.author?.name || b.author || "HumRahii Team",
          date: formatDate(b.createdAt || b.date),
          readTime: calculateReadTime(b.description || b.content),
          image: b.image,
          slug: createSafeSlug(b.slug || b.title)
        }));
      setRelatedBlogs(others);
    } else {
      // Fetch fresh related
      axios
        .get(`${api.blog.getAllBlog}?page=1&limit=6`)
        .then((res) => {
          if (res.data.success && Array.isArray(res.data.data)) {
            const others = res.data.data
              .filter((b) => (b._id || b.id) !== currentBlog?.id)
              .slice(0, 3)
              .map((b) => ({
                id: b._id || b.id,
                title: b.title,
                excerpt: b.excerpt || b.description?.substring(0, 100),
                category: b.category?.toLowerCase() || "general",
                author: b.author?.name || b.author || "HumRahii Team",
                date: formatDate(b.createdAt || b.date),
                readTime: calculateReadTime(b.description || b.content),
                image: b.image,
                slug: createSafeSlug(b.slug || b.title)
              }));
            setRelatedBlogs(others);
          }
        })
        .catch(() => {});
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (e) {
      return "Recently";
    }
  };

  const calculateReadTime = (content) => {
    if (!content) return "3 min read";
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${Math.max(2, minutes)} min read`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: blog?.title,
          text: blog?.excerpt,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#E10600] transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Articles</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#E10600] hover:text-[#E10600] shadow-sm transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-500" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span>Share Article</span>
              </>
            )}
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-card-subtle border border-gray-100/80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E10600] mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading article details...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-card-subtle border border-gray-100/80">
            <div className="w-16 h-16 bg-red-50 text-[#E10600] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/blog")}
              className="px-6 py-2.5 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white font-semibold rounded-xl shadow-md hover:shadow-red-glow transition-all"
            >
              Browse All Articles
            </button>
          </div>
        ) : (
          <article className="bg-white rounded-3xl overflow-hidden shadow-card-subtle border border-gray-100/80">
            {/* Hero Image */}
            <div className="relative w-full h-64 sm:h-96 md:h-[420px] bg-gray-100 overflow-hidden">
              <img
                src={getBlogImageUrl(blog.image, 0, blog.category)}
                alt={blog.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = getFallbackBlogImage(0, blog.category);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute top-5 left-5">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 text-gray-900 shadow-md backdrop-blur-md">
                  {blog.category || "General"}
                </span>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6 sm:p-10">
              {/* Meta information */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 pb-6 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-2 font-medium">
                  <div className="w-7 h-7 rounded-full bg-red-50 text-[#E10600] flex items-center justify-center font-bold text-xs shrink-0">
                    <User size={14} />
                  </div>
                  <span className="text-gray-800 font-semibold">{blog.author}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-1.5">
                  <Calendar size={15} className="text-gray-400" />
                  <span>{blog.date}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-1.5">
                  <Clock size={15} className="text-gray-400" />
                  <span>{blog.readTime}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                {blog.title}
              </h1>

              {/* Body */}
              <div className="prose max-w-none text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-4">
                {blog.description || blog.content || "Full article details coming soon."}
              </div>

              {/* Humrahii Promo Box */}
              <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-red-50 via-[#FCFAEE] to-red-50/50 border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    Ready to share your next journey?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Join thousands of verified commuters saving money and traveling comfortably with Humrahii.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => navigate("/rides")}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-red-glow transition-all"
                  >
                    Find a Ride
                  </button>
                  <button
                    onClick={() => navigate("/offer-ride")}
                    className="px-5 py-2.5 bg-white text-gray-900 font-semibold text-sm rounded-xl border border-gray-200 hover:border-[#E10600] hover:text-[#E10600] transition-all"
                  >
                    Offer Ride
                  </button>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Related Articles
              </h2>
              <button
                onClick={() => navigate("/blog")}
                className="text-sm font-bold text-[#E10600] hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => navigate(`/blog/${item.slug}`, { state: { blog: item } })}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card-subtle hover:shadow-card-hover transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="h-40 bg-gray-100 overflow-hidden relative">
                    <img
                      src={getBlogImageUrl(item.image, idx + 1, item.category)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = getFallbackBlogImage(idx + 1, item.category);
                      }}
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="text-xs text-gray-400 mb-1.5 flex items-center gap-2">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.readTime}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-[#E10600] transition-colors mb-2">
                        {item.title}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-[#E10600] flex items-center gap-1 mt-2">
                      Read Article <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;
