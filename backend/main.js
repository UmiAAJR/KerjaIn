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

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = 5000;

try {
    db.authenticate()
} catch (error) {
    console.log(error);
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


// Buat sinkronisasi kalo apdet
// db.sync({ alter: true })
//     .then(() => {
//         console.log('Database berhasil disinkronisasi!');
//     })
//     .catch((err) => {
//         console.error('Gagal sinkronisasi:', err);
//     });
app.listen(port, () => {
    console.log("berhasil terhubung ke server");
})