import db from "../db/db.js";
import initModels from "../model/init-models.js";

const { Panic, User, Worker, Job } = initModels(db)

export const getPanic = async (req, res) => {
    try {
        const perPage = req.query.perPage ?? 10
        const totalData = await User.count()
        let page = req.query.page ?? 1
        let offset = (page - 1) * perPage

        const panic = await Panic.findAll({
            where: {
                ...req.query
            },

            limit: perPage,
            offset: offset,

            order: [
                ["CreatedAt", "DESC"]
            ]
        })

        const totalData = await Panic.count()

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
                    include: [
                        {
                            model: User,
                            attributes: {
                                exclude: ["password"]
                            }
                        },
                        {
                            model: Worker,
                            attributes: {
                                exclude: ["balance"]
                            },
                            include: [
                                {
                                    model: User,
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
        await Panic.create(req.body)

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
        await Panic.update(req.body, {
            where: {
                PanicID: req.params.id
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

export const deletePanic = async (req, res) => {
    try {
        await Panic.destroy({
            where: {
                PanicID: req.params.id
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