import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  Search,
  Calendar,
  User,
  Clock,
  Tag,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  TrendingUp,
  Filter
} from 'lucide-react'
import { api } from '../services/endpoints'
import { getBlogImageUrl, getFallbackBlogImage } from '../utils/blogImageHelper'

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  
  // API State
  const [blogs, setBlogs] = useState([])
  const [meta, setMeta] = useState({
    totalBlogs: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 6
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const postsPerPage = 6

  const colors = {
    primary: '#E10600',
    background: '#FFFFFF',
    surface: '#F7F7F7',
    textPrimary: '#111111',
    textSecondary: '#555555',
    border: '#E5E5E5',
    accent: '#B8B8B8'
  }

  // Fetch blogs from API with pagination
  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      // Controller के according pagination parameters भेजें
    

      const response = await axios.get(`${api.blog.getAllBlog}?page=${page}&limit=${meta.limit}`)
      // console.log("API Response:", response.data)

      if (response.data.success) {
        // Transform API response
        const transformedBlogs = transformBlogs(response.data.data)
        setBlogs(transformedBlogs)
        
        // Set pagination metadata from API response
        if (response.data.pagination) {
          setMeta({
            totalBlogs: response.data.pagination.totalBlogs,
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages,
            limit: response.data.pagination.limit
          })
        } else {
          // Fallback if pagination data not available
          setMeta({
            totalBlogs: response.data.data?.length || 0,
            currentPage: page,
            totalPages: Math.ceil((response.data.data?.length || 0) / postsPerPage),
            limit: postsPerPage
          })
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch blogs')
      }
    } catch (err) {
      // console.error('Error fetching blogs:', err)
      setError(err.response?.data?.message || 'Failed to load blogs. Please try again later.')
      // Use mock data for fallback
      setBlogs(getMockBlogs())
      setMeta({
        totalBlogs: 10,
        currentPage: 1,
        totalPages: 2,
        limit: postsPerPage
      })
    } finally {
      setLoading(false)
    }
  }

  // Transform blog data from API to component format
  const transformBlogs = (apiBlogs) => {
    if (!apiBlogs || !Array.isArray(apiBlogs)) return []
    
    return apiBlogs.map(blog => ({
      id: blog._id || blog.id || Math.random(),
      title: blog.title || 'Untitled',
      excerpt: blog.excerpt || blog.description || blog.content?.substring(0, 150) + '...' || 'No description available',
      category: blog.category?.toLowerCase() || 'general',
      author: blog.author?.name || blog.author || 'Admin',
      date: formatDate(blog.createdAt || blog.date || blog.publishedDate),
      readTime: calculateReadTime(blog.content) || '5 min read',
      image: blog.image || blog.featuredImage || blog.thumbnail || getDefaultImage(blog.category),
      featured: blog.featured || false,
      trending: blog.trending || false,
      // Additional fields from API
      content: blog.content || '',
      tags: blog.tags || [],
      slug: blog.slug || blog.title?.toLowerCase().replace(/\s+/g, '-') || ''
    }))
  }

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (e) {
      return 'Recently'
    }
  }

  const calculateReadTime = (content) => {
    if (!content) return '5 min read'
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return `${minutes} min read`
  }

  const getDefaultImage = (category) => {
    const categoryImages = {
      'safety': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800',
      'travel': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800',
      'sustainability': 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=800',
      'community': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800',
      'tips': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800'
    }
    return categoryImages[category] || 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=800'
  }

  // Mock data for fallback
  const getMockBlogs = () => {
    return [
      {
        id: 1,
        title: 'How Carpooling Can Save You Money',
        excerpt: 'Discover the financial benefits of shared commuting and save up to 70% on travel costs.',
        category: 'tips',
        author: 'HumRahii Team',
        date: 'Dec 15, 2023',
        readTime: '5 min read',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        featured: true
      },
      {
        id: 2,
        title: 'Safe Ride Sharing Guide',
        excerpt: 'Essential safety tips for every rider. Learn how verified profiles ensure safer journeys.',
        category: 'safety',
        author: 'Safety Expert',
        date: 'Dec 12, 2023',
        readTime: '8 min read',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
        featured: true
      },
      {
        id: 3,
        title: 'Sustainable Travel & Eco-Friendly Commuting',
        excerpt: 'Learn how carpooling reduces city emissions and builds greener communities.',
        category: 'sustainability',
        author: 'Eco Warrior',
        date: 'Dec 10, 2023',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=800&q=80',
        featured: false
      },
      {
        id: 4,
        title: 'Building Meaningful Communities on Every Ride',
        excerpt: 'How everyday commuters turn rush hours into valuable networking opportunities.',
        category: 'community',
        author: 'Community Lead',
        date: 'Dec 8, 2023',
        readTime: '4 min read',
        image: 'https://images.unsplash.com/photo-1551836026-d5c2c5af78e4?auto=format&fit=crop&w=800&q=80',
        featured: false
      },
      {
        id: 5,
        title: 'Top Highway Routes & Commute Hacks',
        excerpt: 'Essential road trip and city commute tips for efficient interstate rides.',
        category: 'travel',
        author: 'Travel Planner',
        date: 'Dec 5, 2023',
        readTime: '7 min read',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        featured: false
      },
      {
        id: 6,
        title: 'The Future of Urban Shared Mobility',
        excerpt: 'Exploring next-generation carpooling platforms and city connectivity.',
        category: 'general',
        author: 'Urban Tech',
        date: 'Dec 3, 2023',
        readTime: '9 min read',
        image: 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&w=800&q=80',
        featured: false
      }
    ]
  }

  // Categories
  const categories = [
    { id: 'all', name: 'All Topics', count: meta.totalBlogs, icon: BookOpen },
    { id: 'safety', name: 'Safety Tips', count: blogs.filter(b => b.category === 'safety').length, icon: BookOpen },
    { id: 'travel', name: 'Travel Guides', count: blogs.filter(b => b.category === 'travel').length, icon: BookOpen },
    { id: 'sustainability', name: 'Sustainability', count: blogs.filter(b => b.category === 'sustainability').length, icon: BookOpen },
    { id: 'community', name: 'Community Stories', count: blogs.filter(b => b.category === 'community').length, icon: BookOpen },
    { id: 'tips', name: 'Travel Tips', count: blogs.filter(b => b.category === 'tips').length, icon: BookOpen }
  ]

  // Filter posts based on search and category
  const filteredPosts = blogs.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory
    
    return matchesSearch && matchesCategory
  })

  // Initial data fetch
  useEffect(() => {
    fetchBlogs(currentPage)
    document.title = "Our Blog"
  }, [])

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId)
    setCurrentPage(1)
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    fetchBlogs(newPage) // Fetch new page data from API
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get featured posts (first 2 as featured)
  const featuredPosts = blogs.filter(blog => blog.featured).slice(0, 2) || blogs.slice(0, 2)

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.primary }}></div>
          <p style={{ color: colors.textPrimary }}>Loading blog posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full"
            style={{ backgroundColor: `${colors.primary}05` }}
          />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full"
            style={{ backgroundColor: `${colors.accent}05` }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-6"
              style={{ 
                backgroundColor: `${colors.primary}15`,
                color: colors.primary,
                border: `1px solid ${colors.border}`
              }}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="font-bold">Insights & Stories</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: colors.textPrimary }}>
              <span style={{ color: colors.primary }}>Blog</span> & Resources
            </h1>
            
            <p className="text-xl mb-10 max-w-3xl mx-auto" style={{ color: colors.textSecondary }}>
              Discover stories, tips, and insights about sustainable travel, safety, and community
            </p>

          </motion.div>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                >
                  <div className="rounded-2xl overflow-hidden mb-6 relative"
                    style={{ border: `1px solid ${colors.border}` }}
                  >
                    <div className="aspect-[16/9] relative">
                      <img 
                        src={getBlogImageUrl(post.image, index, post.category)} 
                        alt={post.title || "Featured Blog"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = getFallbackBlogImage(index, post.category);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-sm"
                      style={{ color: colors.primary }}
                    >
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                    <div className="flex items-center gap-1 text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 group-hover:underline"
                    style={{ color: colors.textPrimary }}
                  >
                    {post.title}
                  </h3>
                  <p className="mb-4" style={{ color: colors.textSecondary }}>
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${colors.primary}15` }}
                    >
                      <User className="w-4 h-4" style={{ color: colors.primary }} />
                    </div>
                    <span style={{ color: colors.textPrimary }}>{post.author}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {/* Categories Filter */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  Latest Articles
                </h2>
                <div className="text-sm" style={{ color: colors.textSecondary }}>
                  Showing {filteredPosts.length} of {meta.totalBlogs} articles
                </div>
              </div>

              
            </div>

            {/* Blog Posts Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: colors.primary }}></div>
                <p style={{ color: colors.textSecondary }}>Loading posts...</p>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -8 }}
                    className="group cursor-pointer"
                  >
                    <div className="rounded-2xl overflow-hidden mb-4 relative"
                      style={{ border: `1px solid ${colors.border}` }}
                    >
                      <div className="aspect-[4/3] relative">
                        <img 
                          src={getBlogImageUrl(post.image, index, post.category)} 
                          alt={post.title || "Blog Article"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = getFallbackBlogImage(index, post.category);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </div>
                        <div className="flex items-center gap-1 text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold group-hover:underline"
                        style={{ color: colors.textPrimary }}
                      >
                        {post.title}
                      </h3>

                      <p className="text-sm line-clamp-2"
                        style={{ color: colors.textSecondary }}
                      >
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${colors.primary}15` }}
                        >
                          <User className="w-3 h-3" style={{ color: colors.primary }} />
                        </div>
                        <span className="text-sm" style={{ color: colors.textPrimary }}>
                          {post.author}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4"
                  style={{ color: colors.textSecondary }}
                />
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                  No articles found
                </h3>
                <p style={{ color: colors.textSecondary }}>
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}

            {/* Pagination - Using server-side pagination */}
            {meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg disabled:opacity-50"
                  style={{ 
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {[...Array(meta.totalPages)].map((_, index) => {
                  const pageNumber = index + 1
                  // Show only relevant page numbers
                  if (
                    pageNumber === 1 ||
                    pageNumber === meta.totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          currentPage === pageNumber ? 'font-bold' : ''
                        }`}
                        style={{
                          backgroundColor: currentPage === pageNumber 
                            ? colors.primary 
                            : colors.surface,
                          color: currentPage === pageNumber 
                            ? colors.background 
                            : colors.textPrimary,
                          border: `1px solid ${
                            currentPage === pageNumber 
                              ? colors.primary 
                              : colors.border
                          }`
                        }}
                      >
                        {pageNumber}
                      </button>
                    )
                  }
                  return null
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === meta.totalPages}
                  className="p-2 rounded-lg disabled:opacity-50"
                  style={{ 
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Page info */}
                <div className="ml-4 text-sm" style={{ color: colors.textSecondary }}>
                  Page {currentPage} of {meta.totalPages}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4 space-y-8">
            {/* Popular Tags */}
            <div className="rounded-2xl p-6"
              style={{ 
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`
              }}
            >
              <h3 className="font-bold mb-4 flex items-center gap-2"
                style={{ color: colors.textPrimary }}
              >
                <Tag className="w-4 h-4" />
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.slice(1).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className="px-3 py-1.5 rounded-lg text-sm hover:scale-105 transition-transform"
                    style={{ 
                      backgroundColor: colors.background,
                      color: colors.textSecondary,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="rounded-2xl p-6"
              style={{ 
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`
              }}
            >
              <h3 className="font-bold mb-4 flex items-center gap-2"
                style={{ color: colors.textPrimary }}
              >
                <TrendingUp className="w-4 h-4" />
                Recent Posts
              </h3>
              <div className="space-y-3">
                {blogs.slice(0, 4).map((post, index) => (
                  <div key={post.id || index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={getBlogImageUrl(post.image, index + 2, post.category)} 
                        alt={post.title || "Recent Post"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = getFallbackBlogImage(index + 2, post.category);
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium line-clamp-2" style={{ color: colors.textPrimary }}>
                        {post.title}
                      </div>
                      <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                        {post.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Info */}
            <div className="rounded-2xl p-6"
              style={{ 
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`
              }}
            >
              <h3 className="font-bold mb-4" style={{ color: colors.textPrimary }}>
                Blog Stats
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Total Articles:</span>
                  <span style={{ color: colors.textPrimary, fontWeight: 'bold' }}>{meta.totalBlogs}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Current Page:</span>
                  <span style={{ color: colors.primary, fontWeight: 'bold' }}>{currentPage}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Articles Per Page:</span>
                  <span style={{ color: colors.textPrimary }}>{meta.limit}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm"
          style={{ 
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B'
          }}
        >
          <p className="font-medium">Error loading blogs</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

export default Blog