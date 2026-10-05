import { Router } from "express";
import { createSupport, handleGetSupport, handleGetSupportForAdmin, handleMarkAsResolved, handleUserSupport } from "../controller/support.controller.js";
import { auth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";

const supportRouter = Router()

supportRouter.post("/create-support" ,auth ,  createSupport)
supportRouter.post("/get-support", auth, handleGetSupport)
supportRouter.post("/get-support-admin", isAdmin,  handleGetSupportForAdmin)
supportRouter.post("/support", handleUserSupport )
supportRouter.post("/mark-resolved", isAdmin ,  handleMarkAsResolved )

export default supportRouter