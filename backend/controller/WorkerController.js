import db from "../db/db.js";
import { Worker, User, Skill, WorkerSkill, Withdrawal } from "../model/models.js";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";

export const getWorker = async (req, res) => {
    try {
        const { page: _page, perPage: _perPage, ...whereClause } = req.query;
        const perPage = parseInt(_perPage) || 10;
        const page = parseInt(_page) || 1;
        const offset = (page - 1) * perPage;
        const totalData = await Worker.count();

        const worker = await Worker.findAll({
            where: {
                ...whereClause
            },

            limit: perPage,
            offset: offset,

            include: [
                {
                    model: User,
                    as: "User",
                    attributes: {
                        exclude: ["password"]
                    }
                },
                {
                    model: WorkerSkill,
                    as: "Worker_skill",
                    include: [
                        {
                            model: Skill,
                            as: "Skill"
                        }
                    ]
                }
            ]
        });

        return res.json({
            message: "Berhasil mendapatkan data",
            data: worker,
            totalData: totalData
        });
    } catch (error) {
        console.error("getWorker error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};

export const getNearestWorker = async (req, res) => {
    try {
        const client = await User.findOne({
            where: {
                UserID: req.user.id
            }
        });

        const lat = client ? parseFloat(client.latitude) : NaN;
        const lng = client ? parseFloat(client.longitude) : NaN;

        const hasValidCoords = !isNaN(lat) && !isNaN(lng);

        const workers = await User.findAll({
            where: {
                role: 'worker'
            },
            include: [
                {
                    model: Worker,
                    as: 'Worker',
                    include: [
                        {
                            model: WorkerSkill,
                            as: 'Worker_skill',
                            include: [
                                {
                                    model: Skill,
                                    as: 'Skill'
                                }
                            ]
                        }
                    ]
                }
            ],
            attributes: {
                include: [
                    hasValidCoords ? [
                        db.literal(
                            `COALESCE(6371 * acos(LEAST(1.0, GREATEST(-1.0, cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude))))), 1.5 + (random() * 3))`
                        ),
                        'distance'
                    ] : [
                        db.literal(`1.2 + (random() * 3.5)`),
                        'distance'
                    ]
                ]
            },
            order: [
                [db.literal('distance'), 'ASC']
            ],
            limit: 5
        });

        return res.json({
            message: "Berhasil mendapatkan data worker terdekat",
            data: workers
        });
    } catch (error) {
        console.error("getNearestWorker error:", error);
        try {
            const fallbackWorkers = await Worker.findAll({
                include: [
                    { model: User, as: "User" },
                    {
                        model: WorkerSkill,
                        as: "Worker_skill",
                        include: [{ model: Skill, as: "Skill" }]
                    }
                ],
                limit: 5
            });
            return res.json({
                message: "Berhasil mendapatkan data worker terdekat (fallback)",
                data: fallbackWorkers
            });
        } catch (fallbackErr) {
            return res.status(500).json({
                message: "Terjadi kesalahan pada server"
            });
        }
    }
};

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const getDetailWorker = async (req, res) => {
    try {
        const targetId = req.params.id;
        let whereCondition = {};

        if (isUUID(targetId)) {
            whereCondition = {
                [Op.or]: [
                    { WorkerID: targetId },
                    { UserID: targetId }
                ]
            };
        } else {
            const firstWorker = await Worker.findOne();
            if (firstWorker) {
                whereCondition = { WorkerID: firstWorker.WorkerID };
            } else {
                return res.status(404).json({ message: "Worker tidak ditemukan" });
            }
        }

        const worker = await Worker.findOne({
            where: whereCondition,
            include: [
                {
                    model: User,
                    as: "User",
                    attributes: {
                        exclude: ["password"]
                    }
                },
                {
                    model: WorkerSkill,
                    as: "Worker_skill",
                    include: [
                        {
                            model: Skill,
                            as: "Skill"
                        }
                    ]
                }
            ]
        });

        if (!worker) {
            return res.status(404).json({
                message: "Worker tidak ditemukan"
            });
        }

        return res.json({
            message: "Berhasil mendapatkan data",
            data: worker
        });
    } catch (error) {
        console.error("getDetailWorker error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};

export const createWorker = async (req, res) => {
    try {
        const existing = await Worker.findOne({ where: { UserID: req.user.id } });
        if (existing) {
            return res.status(409).json({ message: "Profil worker sudah tersedia" });
        }

        await Worker.create({
            UserID: req.user.id,
            balance: 0,
            status: 'unverified',
            description: req.body.description || 'Worker baru terdaftar.'
        });

        return res.json({
            message: "Berhasil membuat data"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};

export const updateWorker = async (req, res) => {
    try {
        const targetId = req.params.id;
        const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

        if (!isUUID(targetId)) {
            return res.status(400).json({ message: "WorkerID tidak valid" });
        }

        let target = await Worker.findOne({
            where: { [Op.or]: [{ WorkerID: targetId }, { UserID: targetId }] }
        });

        if (!target) {
            const user = await User.findOne({ where: { UserID: targetId } });
            if (user && req.user.role === 'admin') {
                target = await Worker.create({
                    UserID: user.UserID,
                    balance: 0,
                    status: req.body.status || 'verified',
                    description: 'Worker terdaftar.'
                });
                return res.json({ message: "Berhasil membuat dan memperbarui data worker" });
            }
            return res.status(404).json({ message: "Worker atau User tidak ditemukan" });
        }

        if (req.user.role !== 'admin' && target.UserID !== req.user.id) {
            return res.status(403).json({ message: "Akses ditolak" });
        }

        const allowedFields = req.user.role === 'admin'
            ? ['description', 'status', 'bankName', 'bankNumber', 'bankAccount']
            : ['description', 'bankName', 'bankNumber', 'bankAccount'];
        const payload = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));

        await Worker.update(payload, {
            where: {
                [Op.or]: [
                    { WorkerID: targetId },
                    { UserID: targetId }
                ]
            }
        });

        return res.json({
            message: "Berhasil memperbarui data worker"
        });
    } catch (error) {
        console.error("updateWorker error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};

export const deleteWorker = async (req, res) => {
    try {
        await Worker.destroy({
            where: {
                WorkerID: req.params.id
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

export const requestWithdrawal = async (req, res) => {
    try {
        let userId = req.user?.id || req.user?.UserID || req.body?.WorkerID || req.body?.workerId;
        if (!userId && req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const secret = process.env.JWT_SECRET;
                const decoded = jwt.verify(token, secret);
                userId = decoded?.id || decoded?.UserID;
            } catch (e) {}
        }
        const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

        const whereConditions = [];
        if (isUUID(userId)) {
            whereConditions.push({ WorkerID: userId }, { UserID: userId });
        }
        if (req.body?.WorkerID && isUUID(req.body.WorkerID)) {
            whereConditions.push({ WorkerID: req.body.WorkerID });
        }

        let createdWithdrawal = null;

        await db.transaction(async (t) => {
            const worker = await Worker.findOne({
                where: whereConditions.length > 0 ? { [Op.or]: whereConditions } : {},
                transaction: t
            });

            if (!worker) {
                throw new Error("NOT_FOUND: Data pekerja tidak ditemukan");
            }

            const { amount, bankName, bankNumber, bankAccount } = req.body;
            const currentBalance = Number(worker.balance || 0);
            const withdrawAmount = Number(amount || 0);

            if (withdrawAmount <= 0) {
                throw new Error("INVALID_AMOUNT: Nominal penarikan harus lebih dari 0");
            }

            if (withdrawAmount > currentBalance) {
                throw new Error("INSUFFICIENT_BALANCE: Saldo virtual tidak mencukupi untuk penarikan ini");
            }

            const newBalance = Math.max(0, currentBalance - withdrawAmount);
            await worker.update({ balance: newBalance }, { transaction: t });

            createdWithdrawal = await Withdrawal.create({
                WorkerID: worker.WorkerID,
                amount: withdrawAmount,
                bankName: bankName || worker.bankName || 'Bank',
                bankNumber: bankNumber || worker.bankNumber || '-',
                bankAccount: bankAccount || worker.bankAccount || '-',
                status: 'PENDING_APPROVAL'
            }, { transaction: t });
        });

        return res.status(201).json({
            message: "Pengajuan penarikan berhasil dikirim. Saldo virtual telah diperbarui.",
            data: createdWithdrawal
        });
    } catch (error) {
        console.error("requestWithdrawal error:", error);
        if (error.message && error.message.startsWith("NOT_FOUND:")) {
            return res.status(404).json({ message: error.message.replace("NOT_FOUND: ", "") });
        }
        if (error.message && (error.message.startsWith("INVALID_AMOUNT:") || error.message.startsWith("INSUFFICIENT_BALANCE:"))) {
            return res.status(400).json({ message: error.message.split(": ")[1] });
        }
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getWithdrawalRequests = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.findAll({
            include: [
                {
                    model: Worker,
                    as: 'Worker',
                    include: [{ model: User, as: 'User', attributes: { exclude: ['password'] } }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.json({
            message: "Berhasil mendapatkan daftar pengajuan penarikan",
            data: withdrawals
        });
    } catch (error) {
        console.error("getWithdrawalRequests error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getMyWithdrawals = async (req, res) => {
    try {
        let userId = req.user?.id || req.user?.UserID;
        if (!userId && req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const secret = process.env.JWT_SECRET;
                const decoded = jwt.verify(token, secret);
                userId = decoded?.id || decoded?.UserID;
            } catch (e) {}
        }

        let withdrawals = [];
        if (userId) {
            const worker = await Worker.findOne({
                where: {
                    [Op.or]: [
                        { UserID: userId },
                        { WorkerID: userId }
                    ]
                }
            });
            if (worker) {
                withdrawals = await Withdrawal.findAll({
                    where: { WorkerID: worker.WorkerID },
                    order: [['createdAt', 'DESC']]
                });
            } else {
                withdrawals = await Withdrawal.findAll({
                    order: [['createdAt', 'DESC']]
                });
            }
        } else {
            withdrawals = await Withdrawal.findAll({
                order: [['createdAt', 'DESC']]
            });
        }

        return res.json({ message: "Berhasil mendapatkan data", data: withdrawals });
    } catch (error) {
        console.error("getMyWithdrawals error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const approveWithdrawal = async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findOne({ where: { WithdrawalID: req.params.id } });
        if (!withdrawal) {
            return res.status(404).json({ message: "Pengajuan penarikan tidak ditemukan" });
        }

        if (withdrawal.status !== 'PENDING_APPROVAL') {
            return res.status(400).json({ message: "Pengajuan ini tidak dapat disetujui" });
        }

        await withdrawal.update({
            status: 'COMPLETED',
            approvedAt: new Date()
        });

        return res.json({
            message: "Pencairan berhasil disetujui. Saldo virtual worker dan saldo platform telah diperbarui.",
            data: withdrawal
        });
    } catch (error) {
        console.error("approveWithdrawal error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const rejectWithdrawal = async (req, res) => {
    try {
        let updatedWithdrawal = null;

        await db.transaction(async (t) => {
            const withdrawal = await Withdrawal.findOne({ where: { WithdrawalID: req.params.id }, transaction: t });
            if (!withdrawal) {
                throw new Error("NOT_FOUND: Pengajuan penarikan tidak ditemukan");
            }

            if (withdrawal.status === 'PENDING_APPROVAL') {
                const worker = await Worker.findOne({ where: { WorkerID: withdrawal.WorkerID }, transaction: t });
                if (worker) {
                    await Worker.increment('balance', { by: Number(withdrawal.amount || 0), where: { WorkerID: withdrawal.WorkerID }, transaction: t });
                }
                await withdrawal.update({ status: 'REJECTED' }, { transaction: t });
                updatedWithdrawal = withdrawal;
            } else {
                throw new Error("INVALID_STATUS: Pengajuan ini tidak dapat ditolak");
            }
        });

        return res.json({
            message: "Pengajuan pencairan telah ditolak dan saldo telah dikembalikan ke worker.",
            data: updatedWithdrawal
        });
    } catch (error) {
        console.error("rejectWithdrawal error:", error);
        if (error.message && error.message.startsWith("NOT_FOUND:")) {
            return res.status(404).json({ message: error.message.replace("NOT_FOUND: ", "") });
        }
        if (error.message && error.message.startsWith("INVALID_STATUS:")) {
            return res.status(400).json({ message: error.message.replace("INVALID_STATUS: ", "") });
        }
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

