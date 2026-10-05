
import { instance } from "../../config/razorpay/instance.js";
import RazorpayOrder from "../../models/razorpay/Order.model.js"
import { verifySignature } from "../../utils/razorpay/verifySignature.js";
import { validateField, validateObjectId } from "../../utils/validator/validateFields.js";
import RazorpayPayment from "../../models/razorpay/payment.model.js"
import userModel from "../../models/user.model.js";
import { sendToMany } from "../../utils/sendNotification/sendToMany.js";
import { appendFileSync } from "fs";


export const handleCreatePayment = async (req, res, next) => {
    try {
        const { total, userId, note } = req.body
        const compressed = Date.now().toString(36);
        // console.log("Compressed:", compressed);
        // console.log(req.body, "this is body")

        if (!total || !userId) {
            return res.status(400).json({
                message: "Amount and userId is required",
                error: true,
                success: false
            })
        };

        if (!note) {
            return res.status(400).json({
                message: "Note is required",
                error: true,
                success: false
            })
        }

        const receipt = userId + "&" + compressed


        const options = {
            amount: Number(total * 100),
            currency: "INR",
            receipt: receipt,
            notes: { note: note || "NO notes found" }
        };

        const order = await instance.orders.create(options)
        // console.log(order, " this is order")


        await RazorpayOrder.create({
            orderId: order?.id,
            amount: order?.amount,
            amountDue: order?.amount_due,
            amountPaid: order?.amount_paid,
            currency: order?.currency || "INR",
            status: order?.status,
            receipt: order?.receipt,
            notes: order?.notes || [],
            attempts: order?.attempts,
            createdAtRazorpay: order?.created_at,
            user: userId
        })


        return res.status(200).json({
            message: "order created",
            success: true,
            error: false,
            order,

        })
    } catch (error) {
        next(error)
    }
}

export const handlePayment = async (req, res, next) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId } = req.body

        if (!validateField(razorpay_order_id, "Order id is not available", res)) return
        if (!validateField(razorpay_payment_id, "payment id is not available", res)) return
        if (!validateField(razorpay_signature, "Signature is not available", res)) return
        if (!validateObjectId(userId, "userId is required", res)) return

        if (!validateField(verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature), "Invalid Razorpay details", res)) return

        


        const order = await RazorpayOrder.findOne({
            orderId: razorpay_order_id
        });

        if (!order) {
            return res.status(400).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        const amount = order.amount;

        const isPaymentExist = await RazorpayPayment.findOne({paymentId :razorpay_payment_id })

        if(isPaymentExist){
            return res.status(400).json({
                message : "payment already completed",
                error : true,
                success : false
            })
        }


        await RazorpayPayment.create({
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            signature: razorpay_signature,
            user: userId,
            status: "success",
            verified: true
        });

        await RazorpayOrder.updateOne(
            { orderId: razorpay_order_id },
            {
                $set: {
                    status: "paid",
                    paymentId: razorpay_payment_id,
                    amountPaid: amount,
                    amountDue: 0
                }
            }
        );


        const user = await userModel.findById(userId)

        if (!validateField(user, "User not found", res)) return

        const newBalance = user.wallet.balance + (amount/100);


        const transaction = {
            userId,
            amount: amount/100,
            type: "credit",
            source: "razorpay",
            status: "success",
            referenceId: razorpay_payment_id || null,
            description:  `Wallet credit using razorpay with amount  ${amount/100}`,
            balanceAfter: newBalance,
        };


        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                $inc: { "wallet.balance": (amount/100 )},
                $push: { "wallet.transactions": transaction },
            },
            { new: true },
        );

        sendToMany({
            tokens: user.fcm,
            title: "Wallet credited",
            description: `Wallet credited by amount Rs.${amount/100} . your current balance is ${updatedUser?.wallet.balance} and the source is Razorpay `,
        });


        return res.status(200).json({
            success: true,
            message: `₹${amount/100} added to wallet`,
            balance: updatedUser.wallet.balance,
            transaction,
            user: updatedUser,
        });
    } catch (error) {
        next(error)
    }
}