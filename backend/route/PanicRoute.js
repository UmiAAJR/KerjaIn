import express from 'express'
import { createPanic, deletePanic, getPanic, getDetailPanic, updatePanic } from '../controller/PanicController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const PanicRoute = express()

PanicRoute.get("/", VerifyUser, CheckRole(["admin"]), getPanic)
PanicRoute.get("/:id", VerifyUser, getDetailPanic)
PanicRoute.post("/", VerifyUser, createPanic)
PanicRoute.patch("/:id", VerifyUser, updatePanic)
PanicRoute.delete("/:id", VerifyUser, deletePanic)

export default PanicRoute