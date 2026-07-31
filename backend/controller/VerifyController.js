import axios from "axios";
import dotenv from "dotenv"
import { Op } from "sequelize";
import { Verify, Worker, User } from "../model/models.js";
dotenv.config()



const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const getVerify = async (req, res) => {
    try {
        const { page: _page, perPage: _perPage, ...whereClause } = req.query;
        const perPage = parseInt(_perPage) || 10;
        const page = parseInt(_page) || 1;
        const offset = (page - 1) * perPage;

        if (req.user.role === 'worker') {
            const worker = await Worker.findOne({ where: { UserID: req.user.id } });
            if (!worker) {
                return res.json({ message: "Berhasil mendapatkan data", data: [], totalData: 0 });
            }
            whereClause.WorkerID = worker.WorkerID;
        }

        const totalData = await Verify.count({ where: { ...whereClause } });

        const verify = await Verify.findAll({
            where: {
                ...whereClause
            },
            limit: perPage,
            offset: offset,
            include: [
                {
                    model: Worker,
                    as: "Worker",
                    include: [
                        {
                            model: User,
                            as: "User",
                            attributes: ["UserID", "name", "email", "phoneNumber", "photo", "address"]
                        }
                    ]
                }
            ]
        });

        return res.json({
            message: "Berhasil mendapatkan data",
            data: verify,
            totalData: totalData
        });
    } catch (error) {
        console.error("getVerify error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};

export const getDetailVerify = async (req, res) => {
    try {
        if (!isUUID(req.params.id)) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }
        const verify = await Verify.findOne({
            where: {
                VerifyID: req.params.id
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
                }
            ]
        });
        if (!verify) return res.status(404).json({ message: "Data tidak ditemukan" });
        if (req.user.role === 'worker' && verify.Worker?.UserID !== req.user.id) {
            return res.status(403).json({ message: "Akses ditolak" });
        }

        return res.json({
            message: "Berhasil mendapatkan data",
            data: verify
        });
    } catch (error) {
        console.error("getDetailVerify error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};

export const createVerify = async (req, res) => {
    try {
        let ktpUrl = req.body.ktpPhoto;
        let selfieUrl = req.body.selfiePhoto;
        if (!ktpUrl || !selfieUrl) {
            return res.status(400).json({ message: "Foto KTP dan selfie wajib diisi" });
        }

        if (ktpUrl && ktpUrl.startsWith('data:image')) {
            try {
                const formDataKtp = new URLSearchParams();
                formDataKtp.append("image", ktpUrl.replace(/^data:image\/\w+;base64,/, ''));
                const resKtp = await axios.post("https://api.imgbb.com/1/upload?key=" + (process.env.IMGDB_KEY || 'dummy_key'), formDataKtp);
                if (resKtp.data?.data?.display_url) {
                    ktpUrl = resKtp.data.data.display_url;
                }
            } catch (imgErr) {
                console.warn("ImgBB KTP upload warning:", imgErr.message);
            }
        }

        if (selfieUrl && selfieUrl.startsWith('data:image')) {
            try {
                const formDataSelfie = new URLSearchParams();
                formDataSelfie.append("image", selfieUrl.replace(/^data:image\/\w+;base64,/, ''));
                const resSelfie = await axios.post("https://api.imgbb.com/1/upload?key=" + (process.env.IMGDB_KEY || 'dummy_key'), formDataSelfie);
                if (resSelfie.data?.data?.display_url) {
                    selfieUrl = resSelfie.data.data.display_url;
                }
            } catch (imgErr) {
                console.warn("ImgBB Selfie upload warning:", imgErr.message);
            }
        }

        const worker = await Worker.findOne({ where: { UserID: req.user.id } });
        const workerId = worker?.WorkerID;
        if (!workerId) return res.status(409).json({ message: "Profil worker belum tersedia" });

        const verifyData = {
            WorkerID: workerId,
            ktpPhoto: ktpUrl,
            selfiePhoto: selfieUrl,
            status: req.body.status || 'pending',
            createdAt: new Date()
        };

        const newVerify = await Verify.create(verifyData);

        if (workerId) {
            await Worker.update({ status: 'pending_verification' }, { where: { WorkerID: workerId } }).catch(() => {});
            if (selfieUrl) {
                const worker = await Worker.findOne({ where: { WorkerID: workerId } });
                if (worker && worker.UserID) {
                    await User.update({ photo: selfieUrl }, { where: { UserID: worker.UserID } }).catch(() => {});
                }
            }
        }

        return res.status(201).json({
            message: "Berhasil mengirimkan data verifikasi",
            data: newVerify
        });
    } catch (error) {
        console.error("createVerify error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};

export const updateVerify = async (req, res) => {
    try {
        const verify = await Verify.findByPk(req.params.id, { include: [{ model: Worker, as: 'Worker' }] });
        if (!verify) return res.status(404).json({ message: "Data tidak ditemukan" });
        if (req.user.role === 'worker' && verify.Worker?.UserID !== req.user.id) return res.status(403).json({ message: "Akses ditolak" });
        const payload = req.user.role === 'admin' ? req.body : { ktpPhoto: req.body.ktpPhoto, selfiePhoto: req.body.selfiePhoto };
        await verify.update(payload)

        return res.json({
            message: "Berhasil memperbarui data verifikasi"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const deleteVerify = async (req, res) => {
    try {
        const verify = await Verify.findByPk(req.params.id, { include: [{ model: Worker, as: 'Worker' }] });
        if (!verify) return res.status(404).json({ message: "Data tidak ditemukan" });
        if (req.user.role === 'worker' && verify.Worker?.UserID !== req.user.id) return res.status(403).json({ message: "Akses ditolak" });
        await verify.destroy()

        return res.json({
            message: "Berhasil menghapus data"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const handleVerify = async (req, res) => {
    try {
        const targetId = req.params.id;
        const newStatus = (req.body.status === "accepted" || req.body.status === "Verified") ? "accepted" : "rejected";
        const workerStatus = newStatus === "accepted" ? "verified" : "unverified";

        // Try finding in Verify table by VerifyID or WorkerID
        let verify = await Verify.findOne({
            where: {
                [Op.or]: [
                    { VerifyID: targetId },
                    { WorkerID: targetId }
                ]
            }
        });

        if (verify) {
            await verify.update({ status: newStatus });
            await Worker.update({ status: workerStatus }, {
                where: { WorkerID: verify.WorkerID }
            });
            return res.json({ message: "Berhasil memperbarui status verifikasi" });
        }

        // Fallback: Find in Worker table by WorkerID or UserID and update worker status directly
        const worker = await Worker.findOne({
            where: {
                [Op.or]: [
                    { WorkerID: targetId },
                    { UserID: targetId }
                ]
            }
        });

        if (worker) {
            await worker.update({ status: workerStatus });

            // Create or update verify record if not exists
            try {
                const [verifyRec] = await Verify.findOrCreate({
                    where: { WorkerID: worker.WorkerID },
                    defaults: {
                        WorkerID: worker.WorkerID,
                        status: newStatus,
                        ktpPhoto: '',
                        selfiePhoto: ''
                    }
                });
                if (verifyRec) {
                    await verifyRec.update({ status: newStatus });
                }
            } catch (vErr) {
                console.warn("Notice: Verify record sync warning:", vErr.message);
            }

            return res.json({ message: "Berhasil memperbarui status verifikasi worker" });
        }

        // Fallback: Check if targetId is UserID
        const user = await User.findOne({ where: { UserID: targetId } });
        if (user) {
            const newWorker = await Worker.create({
                UserID: user.UserID,
                balance: 0,
                status: workerStatus,
                description: 'Worker terdaftar.'
            });
            return res.json({ message: "Berhasil membuat profil dan memperbarui status verifikasi worker" });
        }

        return res.status(404).json({ message: "Data verifikasi/worker tidak ditemukan" });
    } catch (error) {
        console.error("CRITICAL handleVerify error:", error.name, error.message, error.original || '', error.sql || '');
        return res.status(500).json({
            message: "Terjadi kesalahan pada server: " + error.message
        });
    }
};


