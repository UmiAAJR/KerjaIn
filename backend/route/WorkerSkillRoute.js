import express from 'express'
import { createWorkerSkill, deleteWorkerSkill, getWorkerSkill, getDetailWorkerSkill, updateWorkerSkill } from '../controller/WorkerSkillController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const WorkerSkillRoute = express()

WorkerSkillRoute.get("/", getWorkerSkill)
WorkerSkillRoute.get("/:id", getDetailWorkerSkill)
WorkerSkillRoute.post("/", VerifyUser, CheckRole(["worker", "admin"]), createWorkerSkill)
WorkerSkillRoute.patch("/:id", VerifyUser, CheckRole(["worker", "admin"]), updateWorkerSkill)
WorkerSkillRoute.delete("/:id", VerifyUser, CheckRole(["worker", "admin"]), deleteWorkerSkill)

export default WorkerSkillRoute
