import { Skill } from "../model/models.js";


export const getSkill =  async(req, res) => {
    try {
        const skill = await Skill.findAll({
            where: {
                ...req.query
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

export const getDetailSkill = async (req, res) => {
    try {
        const skill = await Skill.findOne({
            where: {
                SkillID: req.params.id
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

export const createSkill = async(req, res) => {
    try {
        await Skill.create(req.body)

        return res.json({
            message: "Berhasil membuat data"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const updateSkill = async(req, res) => {
    try {
        await Skill.update(req.body, {
            where: {
                SkillID: req.params.id
            }
        })

        return res.json({
            message: "Berhasil memperbarui skill"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const deleteSkill = async(req, res) => {
    try {
        await Skill.destroy({
            where: {
                SkillID: req.params.id
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