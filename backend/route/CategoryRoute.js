import express from 'express'
import { createCategory, deleteCategory, getCategory, getDetailCategory, updateCategory } from '../controller/CategoryController.js'
import { VerifyAdmin, VerifyUser } from '../middleware/UserAuth.js'

const CategoryRoute = express()

CategoryRoute.get("/", getCategory)
CategoryRoute.get("/:id", getDetailCategory)
CategoryRoute.post("/", VerifyUser, VerifyAdmin, createCategory)
CategoryRoute.patch("/:id", VerifyUser, VerifyAdmin, updateCategory)
CategoryRoute.delete("/:id", VerifyUser, VerifyAdmin, deleteCategory)

export default CategoryRoute