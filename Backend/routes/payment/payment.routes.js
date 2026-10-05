import { Router } from "express"
import { handleCreatePayment, handlePayment } from "../../controller/payment/payment.controller.js"
import { auth } from "../../middleware/auth.js"


const paymentRouter = Router()


paymentRouter.post("/create" , auth , handleCreatePayment)
paymentRouter.post("/handle-payment" , auth ,  handlePayment)



export default paymentRouter