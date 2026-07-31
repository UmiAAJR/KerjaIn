import express from 'express'
import { deleteUser, getDetailUser, getUser, login, registerClient, updateProfil, googleLogin } from '../controller/UserController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const UserRouter = express()

UserRouter.post("/login", login)
UserRouter.post("/register", registerClient)
UserRouter.post("/google-login", googleLogin)
UserRouter.patch("/update", VerifyUser, updateProfil)
UserRouter.get("/", VerifyUser, CheckRole(["admin"]), getUser)
UserRouter.get("/:id", VerifyUser, getDetailUser)
UserRouter.delete("/:id", VerifyUser, CheckRole(["admin"]), deleteUser)

export default UserRouter