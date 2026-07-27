import express from 'express'
import { createWorker, deleteWorker, getWorker, getDetailWorker, updateWorker } from '../controller/WorkerController.js'
import { VerifyAdmin, VerifyUser, VerifyWorker } from '../middleware/UserAuth.js'

const WorkerRoute = express()

WorkerRoute.get("/", getWorker)
WorkerRoute.get("/:id", getDetailWorker)
WorkerRoute.post("/", VerifyUser, createWorker)
WorkerRoute.patch("/:id", VerifyUser, updateWorker)
WorkerRoute.delete("/:id", VerifyUser, deleteWorker)

export default WorkerRoute