import express from 'express'
import { createJob, deleteJob, getJob, getDetailJob, updateJob, completeJob } from '../controller/JobController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const JobRoute = express()

JobRoute.get("/", VerifyUser, getJob)
JobRoute.get("/:id", VerifyUser, getDetailJob)
JobRoute.post("/", VerifyUser, CheckRole(["client"]), createJob)
JobRoute.post("/complete/:id", VerifyUser, completeJob)
JobRoute.patch("/:id", VerifyUser, updateJob)
JobRoute.delete("/:id", VerifyUser, CheckRole(["admin"]), deleteJob)

export default JobRoute
