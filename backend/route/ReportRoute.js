import express from 'express';
import { getReports, getDetailReport, createReport, resolveReport } from '../controller/ReportController.js';
import { VerifyUser, CheckRole } from '../middleware/UserAuth.js';

const ReportRoute = express();

ReportRoute.get("/", VerifyUser, CheckRole(["admin"]), getReports);
ReportRoute.get("/:id", VerifyUser, getDetailReport);
ReportRoute.post("/", VerifyUser, createReport);
ReportRoute.patch("/:id/resolve", VerifyUser, CheckRole(["admin"]), resolveReport);

export default ReportRoute;
