
export const handleError = (err , req , res , next) => {
    console.log(err?.message || err)
    return res.status(err?.status || 500).json({
        message : err?.message || "Internal server error",
        error : true,
        success : false
    })
}