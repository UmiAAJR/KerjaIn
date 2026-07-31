import express from 'express'
import { createVerify, deleteVerify, getVerify, getDetailVerify, updateVerify, handleVerify } from '../controller/VerifyController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const VerifyRoute = express()

VerifyRoute.get("/", VerifyUser, CheckRole(["admin", "worker"]), getVerify)
VerifyRoute.get("/:id", VerifyUser, CheckRole(["admin", "worker"]), getDetailVerify)
VerifyRoute.post("/", VerifyUser, CheckRole(["admin", "worker"]), createVerify)
VerifyRoute.patch("/handle/:id", VerifyUser, CheckRole(["admin"]), handleVerify)
VerifyRoute.patch("/:id", VerifyUser, CheckRole(["admin", "worker"]), updateVerify)
VerifyRoute.delete("/:id", VerifyUser, CheckRole(["admin", "worker"]), deleteVerify)

export default VerifyRoute