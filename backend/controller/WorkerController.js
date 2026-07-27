import db from "../db/db.js";
import initModels from "../model/init-models.js";


const model = initModels(db)
const Worker = model.Worker
const User = model.User
const Skill = model.Skill
const WorkerSkill = model.WorkerSkill

export const getWorker =  async(req, res) => {
    try {
        const perPage = req.query.perPage ?? 10
        const totalData = await Worker.count()
        let page = req.query.page ?? 
        let offset = (page - 1) * perPage

        const worker = await Worker.findAll({
            where: {
                ...req.query
            },

            limit: perPage,
            offset: offset,

            include: [
                {
                    model: User,
                    attributes: {
                        exclude: ["password"]
                    }
                },
                {
                    model: WorkerSkill,
                    include: [
                        {
                            model: Skill
                        }
                    ]
                }
            ]
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: worker,
            totalData: totalData
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getDetailWorker = async (req, res) => {
    try {
        const worker = await Worker.findOne({
            where: {
                WorkerID: req.params.id
            },
            include: [
                {
                    model: User,
                    attributes: {
                        exclude: ["password"]
                    }
                },
                {
                    model: WorkerSkill,
                    include: [
                        {
                            model: Skill
                        }
                    ]
                }
            ]
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: worker
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const createWorker = async(req, res) => {
    try {
        await Worker.create(req.body)

        return res.json({
            message: "Berhasil membuat data"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const updateWorker = async(req, res) => {
    try {
        await Worker.update(req.body, {
            where: {
                WorkerID: req.params.id
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

export const deleteWorker = async(req, res) => {
    try {
        await Worker.destroy({
            where: {
                WorkerID: req.params.id
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