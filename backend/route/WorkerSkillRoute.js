import express from 'express'
import { createWorkerSkill, deleteWorkerSkill, getWorkerSkill, getDetailWorkerSkill, updateWorkerSkill } from '../controller/WorkerSkillController.js'
import { VerifyUser } from '../middleware/UserAuth.js'

const WorkerSkillRoute = express()

WorkerSkillRoute.get("/", getWorkerSkill)
WorkerSkillRoute.get("/:id", getDetailWorkerSkill)
WorkerSkillRoute.post("/", VerifyUser, createWorkerSkill)
WorkerSkillRoute.patch("/:id", VerifyUser, updateWorkerSkill)
WorkerSkillRoute.delete("/:id", VerifyUser, deleteWorkerSkill)

export default WorkerSkillRoute