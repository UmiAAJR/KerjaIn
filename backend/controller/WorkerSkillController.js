import { WorkerSkill, Worker, User, Skill } from "../model/models.js";


export const getWorkerSkill = async (req, res) => {
    try {
        const workerSkill = await WorkerSkill.findAll({
            where: {
                ...req.query
            },
            include: [
                {
                    model: Worker,
                    as: "Worker",
                    attributes: ["WorkerID", "UserID"],
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
                {
                    model: Skill,
                    as: "Skill"
                }
            ]
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: workerSkill
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getDetailWorkerSkill = async (req, res) => {
    try {
        const workerSkill = await WorkerSkill.findOne({
            where: {
                WorkerSkillID: req.params.id
            },

            include: [
                {
                    model: Worker,
                    as: "Worker",
                    attributes: ["WorkerID", "UserID"],
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
                {
                    model: Skill,
                    as: "Skill"
                }
            ]
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: workerSkill
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const createWorkerSkill = async (req, res) => {
    try {
        const worker = await Worker.findOne({ where: { WorkerID: req.body.WorkerID } });
        if (!worker) return res.status(404).json({ message: "Worker tidak ditemukan" });
        if (req.user.role !== 'admin' && worker.UserID !== req.user.id) return res.status(403).json({ message: "Akses ditolak" });
        await WorkerSkill.create({ WorkerID: worker.WorkerID, SkillID: req.body.SkillID, hourlyRate: req.body.hourlyRate })

        return res.json({
            message: "Berhasil membuat data"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const updateWorkerSkill = async (req, res) => {
    try {
        const workerSkill = await WorkerSkill.findByPk(req.params.id, { include: [{ model: Worker, as: 'Worker' }] });
        if (!workerSkill) return res.status(404).json({ message: "Data skill tidak ditemukan" });
        if (req.user.role !== 'admin' && workerSkill.Worker?.UserID !== req.user.id) return res.status(403).json({ message: "Akses ditolak" });
        await workerSkill.update({ SkillID: req.body.SkillID, hourlyRate: req.body.hourlyRate })

        return res.json({
            message: "Berhasil memperbarui data skill worker"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const deleteWorkerSkill = async (req, res) => {
    try {
        const workerSkill = await WorkerSkill.findByPk(req.params.id, { include: [{ model: Worker, as: 'Worker' }] });
        if (!workerSkill) return res.status(404).json({ message: "Data skill tidak ditemukan" });
        if (req.user.role !== 'admin' && workerSkill.Worker?.UserID !== req.user.id) return res.status(403).json({ message: "Akses ditolak" });
        await workerSkill.destroy()

        return res.json({
            message: "Berhasil menghapus data"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}
