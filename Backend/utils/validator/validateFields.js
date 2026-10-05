import mongoose from "mongoose"

export const validateField =  (condition, message = "Some error accourd ", res, statusCode = 400) => {
    if (condition) {
        return true
    } else {
        res.status(statusCode).json({
            message: message,
            error: true,
            success: false
        })
        return false
    }
}

export const validateEmail =  (email, message = "Invalid Email", res, statusCode = 400) => {
    const emailRegex = /^(?!.*@(?:tempmail|10minutemail|guerrillamail|yopmail|mailinator|dispostable|sharklasers|trashmail)\.)(?!\.)(?!.*\.\.)(?!.*\.$)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?!-)[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?:\.[A-Za-z]{2,})+$/;

    if (emailRegex.test(email)) {
        return true
    } else {
        res.status(statusCode).json({
            message,
            error: true,
            success: false
        })
        return false
    }
}

export const validatePhone =  (phone, message = "Invalid Phone Number", res, statusCode = 400) => {
    const indianPhoneStrict = /^(?:(?:\+|0{0,2})91[\-\s]?)?([6789](?:[0-9]?){9})$/;
    if (indianPhoneStrict.test(phone)) {
        return true
    } else {
        res.status(statusCode).json({
            message,
            error: true,
            success: false
        })
        return false
    }
}

export const validatePassword = (password, res) => {
    const veryStrongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+#^()\[\]{}~|;:,.<>\/\\"'-_=])[A-Za-z\d@$!%*?&+#^()\[\]{}~|;:,.<>\/\\"'-_=]{12,}$/;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: "Password is required"
        });
    }

    if (password.length < 12) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 12 characters long"
        });
    }

    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least one uppercase letter"
        });
    }

    if (!/[a-z]/.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least one lowercase letter"
        });
    }

    if (!/\d/.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least one number"
        });
    }

    if (!/[@$!%*?&+#^()\[\]{}~|;:,.<>\/\\"'-_=]/.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least one special character"
        });
    }

    // Final safety check
    if (!veryStrongPasswordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password does not meet security requirements"
        });
    }

    return true; // password is valid
};

export const validateObjectId = (id, message = "Invalid Id", res, statusCode = 400) => {
    const isValid = mongoose.Types.ObjectId.isValid(id)

    if (isValid) {
        return true
    } else {
        res.status(statusCode).json({
            message,
            error: true,
            success: false
        })
        return false
    }
}