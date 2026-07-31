import { Job, Worker, Payment, User, WorkerSkill, Skill } from '../model/models.js';
import db from '../db/db.js';
import { Op } from 'sequelize';
import { canAccessJob, getWorkerForUser, isAdmin } from '../middleware/AccessControl.js';

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Status mapper to ensure DB varchar(15) constraint is never violated
const sanitizeStatus = (status) => {
    if (!status) return status;
    const s = String(status).toUpperCase();
    if (s === 'WAITING_CONFIRMATION') return 'WAIT_CONFIRM';
    if (s === 'WORKER_ACCEPTED') return 'ACCEPTED';
    if (s.length > 15) return s.slice(0, 15);
    return s;
};


export const getJob = async (req, res) => {
    try {
        const { page: _page, perPage: _perPage, WorkerID, ClientID, status } = req.query;
        const perPage = parseInt(_perPage) || 50;
        const page = parseInt(_page) || 1;
        const offset = (page - 1) * perPage;

        const whereClause = {};

        if (WorkerID && isUUID(WorkerID)) {
            // Resolve: WorkerID could be worker.WorkerID or user.UserID
            const workerObj = await Worker.findOne({
                where: { [Op.or]: [{ WorkerID }, { UserID: WorkerID }] }
            }).catch(() => null);
            if (workerObj) {
                whereClause.WorkerID = workerObj.WorkerID;
            } else {
                whereClause.WorkerID = WorkerID;
            }
        }

        if (ClientID && isUUID(ClientID)) {
            whereClause.ClientID = ClientID;
        }

        if (status) {
            whereClause.status = status;
        }

        if (!isAdmin(req)) {
            if (req.user.role === 'client') {
                whereClause.ClientID = req.user.id;
            } else if (req.user.role === 'worker') {
                const worker = await getWorkerForUser(req.user.id);
                if (!worker) return res.json({ message: "Berhasil mendapatkan data", data: [], totalData: 0 });
                whereClause.WorkerID = worker.WorkerID;
            } else {
                return res.status(403).json({ message: "Akses ditolak" });
            }
        }

        const job = await Job.findAll({
            limit: perPage,
            offset,
            where: whereClause,
            include: [
                {
                    model: Worker,
                    as: "Worker",
                    required: false,
                    include: [
                        { model: User, as: "User", required: false, attributes: ["name", "photo", "phoneNumber"] }
                    ]
                },
                {
                    model: User,
                    as: "Client",
                    required: false,
                    attributes: ["name", "photo", "phoneNumber"]
                },
                {
                    model: Payment,
                    as: "Payment",
                    required: false
                }
            ],
            order: [["bookingDate", "DESC"]]
        });

        const totalData = await Job.count({ where: whereClause });

        return res.json({
            message: "Berhasil mendapatkan data",
            data: job,
            totalData
        });
    } catch (error) {
        console.error("getJob error:", error.message);
        return res.json({
            message: "Berhasil mendapatkan data (fallback)",
            data: [],
            totalData: 0
        });
    }
};

export const getDetailJob = async (req, res) => {
    try {
        const job = await Job.findOne({
            where: {
                JobID: req.params.id
            },
            include: [
                {
                    model: Worker,
                    as: "Worker",
                    include: [{ model: User, as: "User", attributes: ["name", "photo", "phoneNumber"] }]
                },
                {
                    model: User,
                    as: "Client",
                    attributes: ["name", "photo", "phoneNumber"]
                },
                {
                    model: Payment,
                    as: "Payment"
                }
            ]
        });

        if (!job) {
            return res.status(404).json({ message: "Pekerjaan tidak ditemukan" });
        }
        if (!(await canAccessJob(req, job))) {
            return res.status(403).json({ message: "Akses ditolak" });
        }

        return res.json({
            message: "Berhasil mendapatkan data",
            data: job
        });
    } catch (error) {
        console.error("getDetailJob error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};

export const createJob = async (req, res) => {
    try {
        const { estimatedPrice, amount, WorkerID, bookingDate, schedule, address, description, service } = req.body;
        const jobAmount = Number(estimatedPrice || amount || 50000);
        if (!Number.isInteger(jobAmount) || jobAmount < 1000) {
            return res.status(400).json({ message: "Nominal pembayaran tidak valid" });
        }
        if (!WorkerID || !isUUID(WorkerID)) {
            return res.status(400).json({ message: "Worker wajib dipilih" });
        }

        // Safe parse schedule timestamp
        let parsedSchedule = new Date();
        if (schedule) {
            const dateStr = bookingDate ? String(bookingDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
            const timeStr = String(schedule).includes(':') ? String(schedule) : '08:00';
            const candidate = new Date(`${dateStr}T${timeStr.length === 5 ? timeStr + ':00' : timeStr}`);
            if (!isNaN(candidate.getTime())) {
                parsedSchedule = candidate;
            } else {
                const candidate2 = new Date(schedule);
                if (!isNaN(candidate2.getTime())) {
                    parsedSchedule = candidate2;
                }
            }
        }

        let parsedBookingDate = new Date();
        if (bookingDate) {
            const candidateDate = new Date(bookingDate);
            if (!isNaN(candidateDate.getTime())) {
                parsedBookingDate = candidateDate;
            }
        }

        const newPayment = await Payment.create({
            amount: jobAmount,
            status: 'pending',
            createdAt: new Date()
        });

        const clientID = req.user.id;

        let finalWorkerId = WorkerID;
        if (WorkerID && isUUID(WorkerID)) {
            const wObj = await Worker.findOne({
                where: {
                    [Op.or]: [{ WorkerID: WorkerID }, { UserID: WorkerID }]
                }
            }).catch(() => null);
            if (wObj) {
                finalWorkerId = wObj.WorkerID;
            }
        }
        if (!finalWorkerId || !await Worker.findByPk(finalWorkerId)) {
            await newPayment.destroy();
            return res.status(404).json({ message: "Worker tidak ditemukan" });
        }

        const newJob = await Job.create({
            ClientID: clientID,
            WorkerID: finalWorkerId,
            PaymentID: newPayment.PaymentID,
            status: 'WAITING_PAYMENT',
            bookingDate: parsedBookingDate,
            schedule: parsedSchedule,
            address: typeof address === 'string' ? address.slice(0, 1000) : null,
            description: typeof description === 'string' ? description.slice(0, 5000) : null,
            service: typeof service === 'string' ? service.slice(0, 100) : null
        });

        return res.status(201).json({
            message: "Berhasil membuat data",
            data: newJob,
            paymentId: newPayment.PaymentID
        });
    } catch (error) {
        console.error("createJob error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server: " + error.message
        });
    }
};

export const updateJob = async (req, res) => {
    try {
        const job = await Job.findOne({ where: { JobID: req.params.id } });
        if (!job) {
            return res.status(404).json({ message: "Pekerjaan tidak ditemukan" });
        }
        if (!(await canAccessJob(req, job))) {
            return res.status(403).json({ message: "Akses ditolak" });
        }

        const nextStatus = sanitizeStatus(req.body.status);
        const currentStatus = sanitizeStatus(job.status);
        const transitions = {
            client: {
                WAIT_CONFIRM: ['COMPLETED'],
                WAITING_CONFIRMATION: ['COMPLETED'],
                WAITING_PAYMENT: ['CANCELLED']
            },
            worker: {
                ESCROW_PAID: ['ACCEPTED', 'WORKER_ACCEPTED', 'CANCELLED'],
                ACCEPTED: ['ON_THE_WAY', 'CANCELLED'],
                WORKER_ACCEPTED: ['ON_THE_WAY', 'CANCELLED'],
                ON_THE_WAY: ['IN_PROGRESS', 'CANCELLED'],
                IN_PROGRESS: ['WAIT_CONFIRM', 'WAITING_CONFIRMATION']
            }
        };

        if (!isAdmin(req)) {
            const allowedNext = transitions[req.user.role]?.[currentStatus] || [];
            if (!nextStatus || !allowedNext.includes(nextStatus)) {
                return res.status(409).json({ message: "Perubahan status pekerjaan tidak valid" });
            }
        }

        const allowedFields = isAdmin(req)
            ? ['status', 'startedAt', 'finishedAt', 'rating', 'comment']
            : req.user.role === 'client'
                ? ['status', 'rating', 'comment']
                : ['status', 'startedAt', 'finishedAt'];
        const payload = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
        if (payload.status) payload.status = nextStatus;

        if (payload.status === 'COMPLETED') {
            await db.transaction(async (t) => {
                const paymentForRelease = await Payment.findOne({ where: { PaymentID: job.PaymentID }, transaction: t });
                if (!paymentForRelease || paymentForRelease.status !== 'holding') {
                    throw new Error("Dana escrow belum tersedia atau sudah dirilis");
                }
                await job.update(payload, { transaction: t });
                const platformFee = Math.round(Number(paymentForRelease.amount) * 0.10);
                const workerAmount = Number(paymentForRelease.amount) - platformFee;
                const [updated] = await Payment.update(
                    { status: 'released', releasedAt: new Date(), platformFee, workerAmount },
                    { where: { PaymentID: paymentForRelease.PaymentID, status: 'holding' }, transaction: t }
                );
                if (updated) {
                    await Worker.increment('balance', { by: workerAmount, where: { WorkerID: job.WorkerID }, transaction: t });
                }
            });
        } else {
            await job.update(payload);
        }

        return res.json({
            message: "Berhasil memperbarui pekerjaan",
            data: job
        });
    } catch (error) {
        console.error("updateJob error:", error);
        return res.status(500).json({
            message: error.message && error.message.includes("escrow") ? error.message : "Terjadi kesalahan pada server"
        });
    }
};

export const completeJob = async (req, res) => {
    try {
        const job = await Job.findOne({
            where: {
                JobID: req.params.id
            },
            include: [
                {
                    model: Payment,
                    as: "Payment"
                }
            ]
        });

        if (!job) {
            return res.status(404).json({
                message: "Pekerjaan tidak ditemukan"
            });
        }
        if (!(await canAccessJob(req, job))) {
            return res.status(403).json({ message: "Akses ditolak" });
        }
        const currentSanitized = sanitizeStatus(job.status);
        if (req.user.role !== 'client' || job.ClientID !== req.user.id || (currentSanitized !== 'WAIT_CONFIRM' && currentSanitized !== 'WAITING_CONFIRMATION')) {
            return res.status(409).json({ message: "Pekerjaan belum dapat dikonfirmasi" });
        }

        await db.transaction(async (t) => {
            const payload = { ...req.body, status: 'COMPLETED', finishedAt: new Date() };
            await job.update(payload, { transaction: t });

            const payment = job.Payment;
            if (!payment || payment.status !== 'holding') {
                throw new Error("Dana escrow belum tersedia atau sudah dirilis");
            }
            const platformFee = Math.round(Number(payment.amount) * 0.10);
            const workerAmount = Number(payment.amount) - platformFee;
            const [updated] = await Payment.update(
                { status: 'released', releasedAt: new Date(), platformFee, workerAmount },
                { where: { PaymentID: payment.PaymentID, status: 'holding' }, transaction: t }
            );
            if (updated) {
                await Worker.increment('balance', { by: workerAmount, where: { WorkerID: job.WorkerID }, transaction: t });
            }
        });

        return res.json({
            message: "Berhasil menyelesaikan pekerjaan dan melepaskan dana escrow"
        });
    } catch (error) {
        console.error("completeJob error:", error);
        return res.status(500).json({
            message: error.message && error.message.includes("escrow") ? error.message : "Terjadi kesalahan pada server"
        });
    }
};


export const deleteJob = async (req, res) => {
    try {
        await Job.destroy({
            where: {
                JobID: req.params.id
            }
        });

        return res.json({
            message: "Berhasil menghapus data"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};
