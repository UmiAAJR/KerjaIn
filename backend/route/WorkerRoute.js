import express from 'express'
import { createWorker, deleteWorker, getWorker, getDetailWorker, updateWorker, getNearestWorker } from '../controller/WorkerController.js'
import { VerifyUser } from '../middleware/UserAuth.js'

const WorkerRoute = express()

WorkerRoute.get("/", getWorker)
WorkerRoute.get("/nearest", getNearestWorker)
WorkerRoute.get("/:id", getDetailWorker)
WorkerRoute.post("/", VerifyUser, createWorker)
WorkerRoute.patch("/:id", VerifyUser, updateWorker)
WorkerRoute.delete("/:id", VerifyUser, deleteWorker)

export default WorkerRoute