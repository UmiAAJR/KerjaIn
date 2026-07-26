import db from "../db/db.js";
import initModels from "../model/init-models.js";


const model = initModels(db)
const WorkerSkill = model.WorkerSkill
const Worker = model.Worker
const User = model.User
const Skill = model.Skill

export const getWorkerSkill =  async(req, res) => {
    try {
        const workerSkill = await WorkerSkill.findAll({
            where: {
                ...req.query
            },
            include: [
                {
                    model: Worker,
                    attributes: ["WorkerID", "UserID"],
                    include: [
                        {
                            model: User,
                            attributes: {
                                exclude: ["password"]
                            }
                        }
                    ]
                },
                {
                    model: Skill
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
                    attributes: ["WorkerID", "UserID"],
                    include: [
                        {
                            model: User,
                            attributes: {
                                exclude: ["password"]
                            }
                        }
                    ]
                },
                {
                    model: Skill
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

export const createWorkerSkill = async(req, res) => {
    try {
        await WorkerSkill.create(req.body)

        return res.json({
            message: "Berhasil membuat data"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const updateWorkerSkill = async(req, res) => {
    try {
        await WorkerSkill.update(req.body, {
            where: {
                WorkerSkillID: req.params.id
            }
        })

        return res.json({
            message: "Berhasil memperbarui kategori"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const deleteWorkerSkill = async(req, res) => {
    try {
        await WorkerSkill.destroy({
            where: {
                WorkerSkillID: req.params.id
            }
        })

        return res.json({
            message: "Berhasil menghapus data"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}