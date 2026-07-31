import express from 'express'
import db from './db/db.js';
import UserRouter from './route/UserRoute.js';
import CategoryRoute from './route/CategoryRoute.js';
import SkillRoute from './route/SkillRoute.js';
import PanicRoute from './route/PanicRoute.js';
import WorkerRoute from './route/WorkerRoute.js';
import NotificationRoute from './route/NotificationRoute.js';
import VerifyRoute from './route/VerifyRoute.js';
import WorkerSkillRoute from './route/WorkerSkillRoute.js';
import JobRoute from './route/JobRoute.js';
import PaymentRoute from './route/PaymentRoute.js';
import ReportRoute from './route/ReportRoute.js';
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'],
    credentials: true
}))
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

const port = Number(process.env.PORT) || 5000;

try {
    await db.authenticate();
    await db.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('Database PostgreSQL berhasil disinkronisasi!');
} catch (error) {
    console.error('Gagal sinkronisasi DB:', error);
}

app.use("/user", UserRouter)
app.use("/category", CategoryRoute)
app.use("/skill", SkillRoute)
app.use("/panic", PanicRoute)
app.use("/worker", WorkerRoute)
app.use("/notification", NotificationRoute)
app.use("/verify", VerifyRoute)
app.use("/worker-skill", WorkerSkillRoute)
app.use("/job", JobRoute)
app.use("/payment", PaymentRoute)
app.use("/reports", ReportRoute)

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use((err, _req, res, _next) => {
    console.error('Unhandled request error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
});

app.listen(port, () => {
    console.log("berhasil terhubung ke server");
})

