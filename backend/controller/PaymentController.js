import db from "../db/db.js";
import initModels from "../model/init-models.js";


const model = initModels(db)
const Payment = model.Payment

export const getPayment =  async(req, res) => {
    try {
        const perPage = req.query.perPage ?? 10
        const totalData = await Payment.count()
        let page = req.query.page ?? 1
        let offset = (page-1)*perPage
        
        const skill = await Payment.findAll({
            limit: perPage,
            offset: offset,
            where: {
                ...req.query
            }
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: skill,
            totalData: totalData
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getDetailPayment = async (req, res) => {
    try {
        const skill = await Payment.findOne({
            where: {
                PaymentID: req.params.id
            }
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: skill
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const updatePayment = async(req, res) => {
    try {
        await Payment.update(req.body, {
            where: {
                PaymentID: req.params.id
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