import mongoose, { isValidObjectId } from "mongoose";
import Support from "../models/support.model.js";
import { validateField, validateObjectId } from "../utils/validator/validateFields.js";
import userModel from "../models/user.model.js";
import supportModel from "../models/support.model.js";
// import { messaging } from "firebase-admin";

export const createSupport = async (req, res, next) => {
  try {
    const {
      subject,
      category,
      priority = "medium",
      rideId,
      userId,
      description
    } = req.body;


    // console.log(req.body, "This is body")

    if (!validateObjectId(userId, "invalid userId", res)) return
    /* -------------------------
       BASIC VALIDATIONS
    ------------------------- */
    if (!subject || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "Subject, category and description are required"
      });
    }

    /* -------------------------
       RIDE ID VALIDATION (OPTIONAL)
    ------------------------- */
    if (rideId && !mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rideId"
      });
    }

    /* -------------------------
       CREATE SUPPORT TICKET
    ------------------------- */
    const support = await Support.create({
      subject: subject.trim(),
      category: category.trim(),
      priority,
      rideId: rideId || null,
      description: description.trim(),
      status: "open",
      userId
    });

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: support
    });

  } catch (error) {
    next(error);
  }
};

export const handleGetSupport = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,        // open | pending | resolved
      priority,      // high | medium | low
      category,
      rideId,
      userId
    } = req.body;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    /* -------------------------
       FILTER CONDITIONS
    ------------------------- */
    const query = {};

   
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId"
        });
      }

    if(!userId){
      return res.status(400).json({
        message : "User not found",
        error : true,
        success : false
      })
    }

    query.userId = userId

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (category) {
      query.category = category;
    }

    if (rideId) {
      if (!mongoose.Types.ObjectId.isValid(rideId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rideId"
        });
      }
      query.rideId = rideId;
    }

    /* -------------------------
       FETCH DATA + COUNT
    ------------------------- */
    const [supports, totalCount] = await Promise.all([
      Support.find(query)
        .populate("rideId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Support.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      message: "Support tickets fetched successfully",
      data: supports,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalRecords: totalCount,
        limit: limitNumber
      }
    });

  } catch (error) {
    next(error);
  }
};



export const handleGetSupportForAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,        // open | pending | resolved
      priority,      // high | medium | low
      category,
      rideId,
      adminId,
      userId
    } = req.body;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const effectiveAdminId = adminId || req.adminId;
    if (effectiveAdminId && !mongoose.Types.ObjectId.isValid(effectiveAdminId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid adminId",
      });
    }

    /* -------------------------
       FILTER CONDITIONS
    ------------------------- */
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    if (rideId) {
      if (!mongoose.Types.ObjectId.isValid(rideId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rideId"
        });
      }
      query.rideId = rideId;
    }

    /* -------------------------
       FETCH DATA + COUNT
    ------------------------- */
    const [supports, totalCount] = await Promise.all([
      Support.find(query)
        .populate({
          path: "userId",
          select: "firstName lastName email phone role profilePhotos"   // only required fields
        })
        .populate({
          path: "rideId",
          populate: [
            { path: "driver", select: "name phone" },
            { path: "car", select: "carNumber carModel" }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Support.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      message: "Support tickets fetched successfully",
      data: supports,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalRecords: totalCount,
        limit: limitNumber
      }
    });

  } catch (error) {
    next(error);
  }
};

export const handleUserSupport = async (req, res, next) => {
  try {
    const { category, description, subject , userId } = req.body
 
    // console.log(req.body , " this is my user details")

    if (!userId) {
      return res.status(400).json({
        message: " userId is required ",
        error: true,
        success: false

      })

    }

    const IsUser = await userModel.findById(userId)
    // console.log(IsUser, " this is user ")

    if (!IsUser) {
      return res.status(400).json({
        message: " user not availble",
        error: true,
        success: false
      })
    }

    const newUserSupport = new Support({
      category,
      description,
      subject

    })        


    return res.status(200).json({
      message: " form submitted successfully",
      error: false,
      success: true,
      newUserSupport,
    
    })

  } catch (error) {
    next(error)

  }
}

export const handleMarkAsResolved = async (req , res , next) => {
  try {
    const {ticketId , adminId , status} = req.body 

    if(!validateObjectId(ticketId , "Invalid ticket id" , res)) return 
    if(!validateObjectId(adminId , "Invalid admin id" , res)) return 


    const isAdmin  = await userModel.findOne({_id : adminId , role : "admin"})
    if(!validateField(isAdmin , "Admin not found" , res)) return 


    const ticket  = await Support.findById(ticketId)
    if(!validateField(ticket , "Ticket is not found" , res)) return 

    const updatedTicket = await Support.findByIdAndUpdate(ticketId , {
      $set : {
        status : status ? status : "resolved"
      }
    }, {new : true})

    return res.status(200).json({
      message : "Status updated",
      error : false,
      success : true,
      ticket , updatedTicket
    })
  } catch (error) {
    next(error)
  }
}