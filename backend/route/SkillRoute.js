import express from 'express'
import { createSkill, deleteSkill, getSkill, getDetailSkill, updateSkill } from '../controller/SkillController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const SkillRoute = express()

SkillRoute.get("/", getSkill)
SkillRoute.get("/:id", getDetailSkill)
SkillRoute.post("/", VerifyUser, CheckRole(["admin"]), createSkill)
SkillRoute.patch("/:id", VerifyUser, CheckRole(["admin"]), updateSkill)
SkillRoute.delete("/:id", VerifyUser, CheckRole(["admin"]), deleteSkill)

export default SkillRoute