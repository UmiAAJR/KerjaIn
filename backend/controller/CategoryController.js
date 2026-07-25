import db from "../db/db.js";
import initModels from "../model/init-models.js";


const model = initModels(db)
const Category = model.Category

export const getCategory =  async(req, res) => {
    try {
        const category = await Category.findAll()

        return res.json({
            message: "Berhasil mendapatkan data",
            data: category
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getDetailCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: {
                CategoryID: req.params.id
            }
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: category
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const createCategory = async(req, res) => {
    try {
        await Category.create(req.body)

        return res.json({
            message: "Berhasil membuat data"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const updateCategory = async(req, res) => {
    try {
        await Category.update(req.body, {
            where: {
                CategoryID: req.params.id
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

export const deleteCategory = async(req, res) => {
    try {
        await Category.destroy({
            where: {
                CategoryID: req.params.id
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