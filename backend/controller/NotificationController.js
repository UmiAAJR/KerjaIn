import { Notification } from "../model/models.js";


export const getNotification =  async(req, res) => {
    try {
        const { page: _page, perPage: _perPage, ...whereClause } = req.query;
        const perPage = parseInt(_perPage) || 10;
        const page = parseInt(_page) || 1;
        const offset = (page - 1) * perPage;
        const totalData = await Notification.count()

        const notification = await Notification.findAll({
            limit: perPage,
            offset: offset,

            where: {
                ...whereClause,
                ...(req.user.role !== 'admin' ? { role: req.user.role } : {})
            },

            order: [
                ["createdAt", "DESC"]
            ]
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: notification,
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
        const notification = await Notification.findOne({
            order: [
                ["createdAt", "DESC"]
            ]
        })
        
        
        return res.json({
            message: "Berhasil mendapatkan data",
            data: notification
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getDetailNotification = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: {
                NotificationID: req.params.id
            }
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: notification
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
            message: "Berhasil memperbarui notifikasi"
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