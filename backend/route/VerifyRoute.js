import express from 'express'
import { createVerify, deleteVerify, getVerify, getDetailVerify, updateVerify, handleVerify } from '../controller/VerifyController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const VerifyRoute = express()

VerifyRoute.get("/", CheckRole(["admin", "worker"]), getVerify)
VerifyRoute.get("/:id", CheckRole(["admin", "worker"]), getDetailVerify)
VerifyRoute.post("/", VerifyUser, CheckRole(["admin", "worker"]), createVerify)
VerifyRoute.patch("/:id", VerifyUser,  CheckRole(["admin", "worker"]), updateVerify)
VerifyRoute.delete("/:id", VerifyUser,  CheckRole(["admin", "worker"]), deleteVerify)
VerifyRoute.patch("/handle/:id", VerifyUser,  CheckRole(["admin", "worker"]), handleVerify)

export default VerifyRoute