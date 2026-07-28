import express from 'express'
import { createJob, deleteJob, getJob, getDetailJob, updateJob } from '../controller/JobController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const JobRoute = express()

JobRoute.get("/", getJob)
JobRoute.get("/:id", getDetailJob)
JobRoute.post("/", VerifyUser, CheckRole(["admin"]), createJob)
JobRoute.patch("/:id", VerifyUser, CheckRole(["admin"]), updateJob)
JobRoute.delete("/:id", VerifyUser, CheckRole(["admin"]), deleteJob)

export default JobRoute