import express from 'express'
import { createWorker, deleteWorker, getWorker, getDetailWorker, updateWorker, getNearestWorker, requestWithdrawal, getMyWithdrawals, getWithdrawalRequests, approveWithdrawal, rejectWithdrawal } from '../controller/WorkerController.js'
import { CheckRole, VerifyUser } from '../middleware/UserAuth.js'

const WorkerRoute = express()

WorkerRoute.get("/", getWorker)
WorkerRoute.get("/nearest", VerifyUser, CheckRole(["client"]), getNearestWorker)
WorkerRoute.get("/withdraw", VerifyUser, CheckRole(["worker", "admin"]), getMyWithdrawals)
WorkerRoute.get("/withdraw/list", VerifyUser, CheckRole(["admin"]), getWithdrawalRequests)
WorkerRoute.post("/withdraw", VerifyUser, CheckRole(["worker"]), requestWithdrawal)
WorkerRoute.patch("/withdraw/approve/:id", VerifyUser, CheckRole(["admin"]), approveWithdrawal)
WorkerRoute.patch("/withdraw/reject/:id", VerifyUser, CheckRole(["admin"]), rejectWithdrawal)
WorkerRoute.get("/:id", getDetailWorker)
WorkerRoute.post("/", VerifyUser, CheckRole(["worker"]), createWorker)
WorkerRoute.patch("/:id", VerifyUser, updateWorker)
WorkerRoute.delete("/:id", VerifyUser, CheckRole(["admin"]), deleteWorker)

export default WorkerRoute

