import express from 'express'
import { createNotification, deleteNotification, getNotification, getDetailNotification, updateNotification, getLatestNotification } from '../controller/NotificationController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const NotificationRoute = express()

NotificationRoute.get("/", VerifyUser, getNotification)
NotificationRoute.get("/latest", VerifyUser, getLatestNotification)
NotificationRoute.get("/:id", VerifyUser, getDetailNotification)
NotificationRoute.post("/", VerifyUser, CheckRole(["admin"]), createNotification)
NotificationRoute.patch("/:id", VerifyUser, CheckRole(["admin"]), updateNotification)
NotificationRoute.delete("/:id", VerifyUser, CheckRole(["admin"]), deleteNotification)

export default NotificationRoute