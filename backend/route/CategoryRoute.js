import express from 'express'
import { createCategory, deleteCategory, getCategory, getDetailCategory, updateCategory } from '../controller/CategoryController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const CategoryRoute = express()

CategoryRoute.get("/", getCategory)
CategoryRoute.get("/:id", getDetailCategory)
CategoryRoute.post("/", VerifyUser, CheckRole(["admin"]), createCategory)
CategoryRoute.patch("/:id", VerifyUser, CheckRole(["admin"]), updateCategory)
CategoryRoute.delete("/:id", VerifyUser, CheckRole(["admin"]), deleteCategory)

export default CategoryRoute