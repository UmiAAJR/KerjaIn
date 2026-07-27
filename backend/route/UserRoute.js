import express from 'express'
import { deleteUser, getDetailUser, getUser, login, registerClient, updateProfil } from '../controller/UserController.js'
import { VerifyAdmin, VerifyUser } from '../middleware/UserAuth.js'

const UserRouter = express()

UserRouter.post("/login", login)
UserRouter.post("/register", registerClient)
UserRouter.patch("/update", updateProfil)
UserRouter.get("/", VerifyUser, VerifyAdmin, getUser)
UserRouter.get("/:id", VerifyUser, getDetailUser)
UserRouter.delete("/:id", VerifyUser, VerifyAdmin, deleteUser)


export default UserRouter