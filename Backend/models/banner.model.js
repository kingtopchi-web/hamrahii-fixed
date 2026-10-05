import mongoose from "mongoose";

const bannerSchema =  mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    image : {
        type : String,
        required : true
    }, 
    page : {
        type : String,
        enum : ["home" , "login"],
        default : "home"
    },
})

const bannerModel = mongoose.model("banners" , bannerSchema)

export default bannerModel