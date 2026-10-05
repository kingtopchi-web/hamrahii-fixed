import mongoose from "mongoose";
import { validateField } from "../utils/validator/validateFields.js";
import blogModel from "../models/blog.model.js";

export const handleCreateBlog = async (req, res, next) => {
    try {
       const {image, title, description, adminId}  = req.body
        if(!validateField(image, "image is required", res)) return
        if(!validateField(title, "Title is required", res)) return
        if(!validateField(description, "Description is required", res)) return

        if(!adminId){
            return res.status(400).json({
                message : "Admin not found",
                error : true,
                success : false
            })
        }

      const blog = await blogModel.create({
        image, 
        title,
        description,
        admin : adminId
      })
      
      return res.status(200).json({
        message : "Blog created successfully",
        error : false,
        success : true,
        blog
      })


    } catch (error) {
      next(error)  
    }
}

export const getBlog = async (req, res, next) => {
  try {
    // ---------------- QUERY PARAMS ----------------
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ---------------- FETCH BLOGS ----------------
    const blogs = await blogModel.find()
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit);

    // ---------------- COUNT ----------------
    const totalBlogs = await blogModel.countDocuments();

    // ---------------- RESPONSE ----------------
    return res.status(200).json({
      success: true,
      error: false,
      message: "Blogs fetched successfully",
      meta: {
        total: totalBlogs,
        page,
        limit,
        totalPages: Math.ceil(totalBlogs / limit),
      },
      data: blogs,
    });

  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { blogId, adminId } = req.body;

    // ---------------- VALIDATION ----------------
    if (!blogId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Blog id is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid blog id",
      });
    }

    if (!adminId) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Admin authorization required",
      });
    }

    // ---------------- FIND BLOG ----------------
    const blog = await blogModel.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Blog not found",
      });
    }

    // ---------------- DELETE ----------------
    await blogModel.findByIdAndDelete(blogId);

    // ---------------- RESPONSE ----------------
    return res.status(200).json({
      success: true,
      error: false,
      message: "Blog deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};

export const getAllBlog = async (req, res, next) => {
  try {
    // 🔹 Read pagination params from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // 🔹 Fetch blogs with pagination
    const blogs = await blogModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // latest first

    // 🔹 Total count for pagination metadata
    const totalBlogs = await blogModel.countDocuments();

    if (blogs.length === 0) {
      return res.status(404).json({
        message: "Blog is not available",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Blog fetch successfully",
      success: true,
      error: false,
      data: blogs,
      pagination: {
        totalBlogs,
        currentPage: page,
        totalPages: Math.ceil(totalBlogs / limit),
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};



