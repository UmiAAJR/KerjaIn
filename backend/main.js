import express from 'express'
import db from './db/db.js';
import UserRouter from './route/UserRoute.js';
import CategoryRoute from './route/CategoryRoute.js';
import SkillRoute from './route/SkillRoute.js';
import PanicRoute from './route/PanicRoute.js';

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

app.listen(port, () => {
    console.log("berhasil terhubung ke server");
})