/**
 * Blog Image Helper
 * Resolves blog/article image URLs correctly and ensures each card displays
 * a distinct, high-quality image rather than repeating the same fallback.
 */

export const BLOG_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80", // Travel / Commute
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80", // Safety / Tech
  "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=800&q=80", // Community / Planning
  "https://images.unsplash.com/photo-1551836026-d5c2c5af78e4?auto=format&fit=crop&w=800&q=80", // Team / Commuters
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80", // Car / Highway
  "https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&w=800&q=80", // Urban mobility
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80", // Ridesharing / Friends
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80", // Driving on road
];

export const CATEGORY_IMAGE_MAP = {
  safety: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
  travel: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
  sustainability: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=800&q=80",
  community: "https://images.unsplash.com/photo-1551836026-d5c2c5af78e4?auto=format&fit=crop&w=800&q=80",
  tips: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  general: "https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&w=800&q=80",
};

/**
 * Resolves a blog image URL.
 * Handles both absolute URLs (e.g. Cloudinary, Unsplash) and relative uploaded paths.
 * If image is missing, picks a fallback by index to avoid identical images.
 */
export const getBlogImageUrl = (image, index = 0, category = "") => {
  if (image && typeof image === "string" && image.trim() !== "") {
    const trimmed = image.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
      return trimmed;
    }
    const baseUrl = (import.meta.env.VITE_ASSETS_URL || "").replace(/\/+$/, "");
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${baseUrl}${cleanPath}`;
  }

  // If a valid category image exists and no specific index is needed, use category image
  const catKey = typeof category === "string" ? category.toLowerCase().trim() : "";
  if (catKey && CATEGORY_IMAGE_MAP[catKey]) {
    return CATEGORY_IMAGE_MAP[catKey];
  }

  const safeIndex = typeof index === "number" && !isNaN(index) ? Math.abs(index) : 0;
  return BLOG_FALLBACK_IMAGES[safeIndex % BLOG_FALLBACK_IMAGES.length];
};

/**
 * Provides an error fallback image for onError handlers, rotating by card index.
 */
export const getFallbackBlogImage = (index = 0, category = "") => {
  const safeIndex = typeof index === "number" && !isNaN(index) ? Math.abs(index) : 0;
  return BLOG_FALLBACK_IMAGES[safeIndex % BLOG_FALLBACK_IMAGES.length];
};
