import express from 'express'
import { createNotification, deleteNotification, getNotification, getDetailNotification, updateNotification } from '../controller/NotificationController.js'
import { VerifyAdmin, VerifyUser } from '../middleware/UserAuth.js'

const NotificationRoute = express()

NotificationRoute.get("/", getNotification)
NotificationRoute.get("/:id", getDetailNotification)
NotificationRoute.post("/", VerifyUser, VerifyAdmin, createNotification)
NotificationRoute.patch("/:id", VerifyUser, VerifyAdmin, updateNotification)
NotificationRoute.delete("/:id", VerifyUser, VerifyAdmin, deleteNotification)

export default NotificationRoute