import express from 'express'
import { getPayment, getDetailPayment, updatePayment, createPayment, handleNotification } from '../controller/PaymentController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const PaymentRoute = express()

// Webhook notification endpoint (no auth required for Midtrans callback)
PaymentRoute.post("/notification", handleNotification)

PaymentRoute.get("/", VerifyUser, CheckRole(["admin"]), getPayment)
PaymentRoute.get("/:id", VerifyUser, getDetailPayment)
PaymentRoute.post("/", VerifyUser, CheckRole(["client"]), createPayment)
PaymentRoute.patch("/:id", VerifyUser, CheckRole(["admin"]), updatePayment)

export default PaymentRoute

