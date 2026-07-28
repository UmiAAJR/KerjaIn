import express from 'express'
import { getPayment, getDetailPayment, updatePayment } from '../controller/PaymentController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const PaymentRoute = express()

PaymentRoute.get("/", getPayment)
PaymentRoute.get("/:id", getDetailPayment)
PaymentRoute.patch("/:id", VerifyUser, CheckRole(["admin"]), updatePayment)

export default PaymentRoute