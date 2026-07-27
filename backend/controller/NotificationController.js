import db from "../db/db.js";
import initModels from "../model/init-models.js";


const model = initModels(db)
const Notification = model.Notification

export const getNotification =  async(req, res) => {
    try {
        const perPage = req.query.perPage ?? 10
        const totalData = await Notification.count()
        let page = req.query.page ?? 1
        let offset = (page - 1) * perPage

        const notifiaction = await Notification.findAll({
            limit: perPage,
            offset: offset,

            where: {
                ...req.query,
                role: req.user.role
            }
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: notifiaction,
            totalData: totalData
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getLatestNotification = async (req, res) => {
    try {
        const notifiaction = await Notification.findOne({
            order: [
                ["createdAt", "DESC"]
            ]
        })
        
        
        return res.json({
            message: "Berhasil mendapatkan data",
            data: notifiaction
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getDetailNotification = async (req, res) => {
    try {
        const notifiaction = await Notification.findOne({
            where: {
                NotificationID: req.params.id
            }
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: notifiaction
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const createNotification = async(req, res) => {
    try {
        await Notification.create(req.body)

        return res.json({
            message: "Berhasil membuat data"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const updateNotification = async(req, res) => {
    try {
        await Notification.update(req.body, {
            where: {
                NotificationID: req.params.id
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

export const deleteNotification = async(req, res) => {
    try {
        await Notification.destroy({
            where: {
                NotificationID: req.params.id
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