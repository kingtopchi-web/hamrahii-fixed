import { Router } from "express";
import { deleteBlog, getAllBlog, getBlog, handleCreateBlog } from "../controller/blog.controller.js";
import { isAdmin } from "../middleware/isAdmin.js";

const blogRouter = Router()

blogRouter.post("/create-blog", isAdmin, handleCreateBlog)
blogRouter.post("/get-blog",  isAdmin, getBlog)
blogRouter.post("/delete-blog", isAdmin, deleteBlog)
blogRouter.get("/get-all-blog", getAllBlog)

export default blogRouter