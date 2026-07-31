import { Job, Worker } from '../model/models.js';

export const isAdmin = (req) => req.user?.role === 'admin';

export const getWorkerForUser = async (userId) => {
    if (!userId) return null;
    return Worker.findOne({ where: { UserID: userId } });
};

export const canAccessJob = async (req, job) => {
    if (!job || !req.user) return false;
    if (isAdmin(req)) return true;
    if (req.user.role === 'client') return job.ClientID === req.user.id;

    if (req.user.role === 'worker') {
        const worker = await getWorkerForUser(req.user.id);
        return Boolean(worker && job.WorkerID === worker.WorkerID);
    }

    return false;
};

export const findAccessibleJob = async (req, jobId, options = {}) => {
    const job = await Job.findOne({ where: { JobID: jobId }, ...options });
    return (await canAccessJob(req, job)) ? job : null;
};
