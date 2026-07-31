import { Panic, User, Worker, Job } from "../model/models.js";
import { canAccessJob, isAdmin } from '../middleware/AccessControl.js';

export const getPanic = async (req, res) => {
    try {
        const { page: _page, perPage: _perPage, ...whereClause } = req.query;
        const perPage = parseInt(_perPage) || 10;
        const page = parseInt(_page) || 1;
        const offset = (page - 1) * perPage;
        const totalData = await Panic.count()

        const panic = await Panic.findAll({
            where: {
                ...whereClause
            },

            limit: perPage,
            offset: offset,

            include: [
                {
                    model: Job,
                    as: "Job",
                    include: [
                        {
                            model: User,
                            as: "Client",
                            attributes: { exclude: ["password"] }
                        },
                        {
                            model: Worker,
                            as: "Worker",
                            include: [
                                {
                                    model: User,
                                    as: "User",
                                    attributes: { exclude: ["password"] }
                                }
                            ]
                        }
                    ]
                }
            ],

            order: [
                ["createdAt", "DESC"]
            ]
        })


        return res.json({
            message: "Berhasil mendapatkan data",
            data: panic,
            totalData: totalData
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getDetailPanic = async (req, res) => {
    try {
        const panic = await Panic.findOne({
            include: [
                {
                    model: Job,
                    as: "Job",
                    include: [
                        {
                            model: User,
                            as: "Client",
                            attributes: {
                                exclude: ["password"]
                            }
                        },
                        {
                            model: Worker,
                            as: "Worker",
                            attributes: {
                                exclude: ["balance"]
                            },
                            include: [
                                {
                                    model: User,
                                    as: "User",
                                    attributes: {
                                        exclude: ["password"]
                                    }
                                }
                            ]
                        },
                    ]
                }
            ],

            where: {
                PanicID: req.params.id
            }
        })
        if (!panic) return res.status(404).json({ message: "Data panic tidak ditemukan" });
        if (!isAdmin(req) && !(await canAccessJob(req, panic.Job))) {
            return res.status(403).json({ message: "Akses ditolak" });
        }

        return res.json({
            message: "Berhasil mendapatkan data",
            data: panic
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const createPanic = async (req, res) => {
    try {
        const job = await Job.findByPk(req.body.JobID);
        if (!job) return res.status(404).json({ message: "Pekerjaan tidak ditemukan" });
        if (!(await canAccessJob(req, job))) return res.status(403).json({ message: "Akses ditolak" });
        await Panic.create({
            JobID: job.JobID,
            longitude: req.body.longitude,
            latitude: req.body.latitude,
            status: 'active'
        })

        return res.json({
            message: "Berhasil membuat data"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const updatePanic = async (req, res) => {
    try {
        const panic = await Panic.findByPk(req.params.id, { include: [{ model: Job, as: 'Job' }] });
        if (!panic) return res.status(404).json({ message: "Data panic tidak ditemukan" });
        if (!isAdmin(req) && !(await canAccessJob(req, panic.Job))) return res.status(403).json({ message: "Akses ditolak" });
        await panic.update({ status: isAdmin(req) ? req.body.status : panic.status })

        return res.json({
            message: "Berhasil memperbarui data panic"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const deletePanic = async (req, res) => {
    try {
        const panic = await Panic.findByPk(req.params.id, { include: [{ model: Job, as: 'Job' }] });
        if (!panic) return res.status(404).json({ message: "Data panic tidak ditemukan" });
        if (!isAdmin(req)) return res.status(403).json({ message: "Akses ditolak" });
        await panic.destroy()

        return res.json({
            message: "Berhasil menghapus data"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}
