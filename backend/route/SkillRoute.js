import express from 'express'
import { createSkill, deleteSkill, getSkill, getDetailSkill, updateSkill } from '../controller/SkillController.js'
import { VerifyAdmin, VerifyUser } from '../middleware/UserAuth.js'

const SkillRoute = express()

SkillRoute.get("/", getSkill)
SkillRoute.get("/:id", getDetailSkill)
SkillRoute.post("/", VerifyUser, VerifyAdmin, createSkill)
SkillRoute.patch("/:id", VerifyUser, VerifyAdmin, updateSkill)
SkillRoute.delete("/:id", VerifyUser, VerifyAdmin, deleteSkill)

export default SkillRoute