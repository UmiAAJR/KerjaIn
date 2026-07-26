import express from 'express'
import { createVerify, deleteVerify, getVerify, getDetailVerify, updateVerify, handleVerify } from '../controller/VerifyController.js'
import { VerifyAdmin, VerifyUser, VerifyWorker } from '../middleware/UserAuth.js'

const VerifyRoute = express()

VerifyRoute.get("/", getVerify)
VerifyRoute.get("/:id", getDetailVerify)
VerifyRoute.post("/", VerifyUser, VerifyWorker, createVerify)
VerifyRoute.patch("/:id", VerifyUser, VerifyWorker, updateVerify)
VerifyRoute.delete("/:id", VerifyUser, VerifyAdmin, deleteVerify)
VerifyRoute.patch("/accept", VerifyUser, VerifyAdmin, handleVerify)

export default VerifyRoute