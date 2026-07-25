import express from 'express'
import { createPanic, deletePanic, getPanic, getDetailPanic, updatePanic } from '../controller/PanicController.js'
import { VerifyAdmin, VerifyUser } from '../middleware/UserAuth.js'

const PanicRoute = express()

PanicRoute.get("/", getPanic)
PanicRoute.get("/:id", getDetailPanic)
PanicRoute.post("/", VerifyUser, VerifyAdmin, createPanic)
PanicRoute.patch("/:id", VerifyUser, VerifyAdmin, updatePanic)
PanicRoute.delete("/:id", VerifyUser, VerifyAdmin, deletePanic)

export default PanicRoute