import db from "../db/db.js";
import initModels from "../model/init-models.js";


const model = initModels(db)
const Verify = model.Verify
const Worker = model.Worker
const User = model.User

export const getVerify =  async(req, res) => {
    try {
        const perPage = req.query.perPage ?? 10
        const totalData = await Verify.count()
        let page = req.query.page ?? 1
        let offset = (page - 1) * perPage

        const verify = await Verify.findAll({
            where: {
                ...req.query
            },
            
            limit: perPage,
            offset: offset,

            include: [
                {
                    model: Worker,
                    attributes: ["WorkerID", "UserID"],
                    include: [
                        {
                            model: User,
                            include: ["name"]
                        }
                    ]
                }
            ]
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: verify,
            totalData: totalData
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getDetailVerify = async (req, res) => {
    try {
        const verify = await Verify.findOne({
            where: {
                VerifyID: req.params.id
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
                }
            ]
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: verify
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const createVerify = async(req, res) => {
    try {
        await Verify.create(req.body)

        return res.json({
            message: "Berhasil membuat data"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const updateVerify = async(req, res) => {
    try {
        await Verify.update(req.body, {
            where: {
                VerifyID: req.params.id
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

export const deleteVerify = async(req, res) => {
    try {
        await Verify.destroy({
            where: {
                VerifyID: req.params.id
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

export const handleVerify = async(req, res) => {
    try {
        const verify = await Verify.findOne({
            where: { VerifyID: req.params.id }
        });

        if (!verify) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        await verify.update(req.body);

        if(req.body.status && req.body.status === "accepted") {
            await Worker.update({status: "verified"}, {
                where: {
                    WorkerID: verify.WorkerID
                }
            })
        }

        return res.json({
            message: "Berhasil memperbarui kategori"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}