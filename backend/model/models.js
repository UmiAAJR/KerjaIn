import initModels from './init-models.js';
import db from '../db/db.js';

const models = initModels(db);

export const { Category, Job, Notification, Panic, Payment, Skill, User, Verify, Worker, WorkerSkill, Withdrawal, Report } = models;
export default models;

