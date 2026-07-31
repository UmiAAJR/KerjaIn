import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import axios from 'axios'
import { User, Worker } from '../model/models.js'
dotenv.config()

export const registerClient = async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;
        const role = req.body.role === 'worker' ? 'worker' : 'client';
        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({ message: "Nama, email, nomor telepon, dan password wajib diisi" });
        }
        const checkEmail = await User.findOne({
            where: {
                email: req.body.email
            }
        })

        if (checkEmail) {
            return res.status(409).json({
                message: "Email sudah digunakan"
            })
        }

        const checkPhoneNumber = await User.findOne({
            where: {
                phoneNumber: req.body.phoneNumber
            }
        })

        if (checkPhoneNumber) {
            return res.status(409).json({
                message: "Nomor sudah digunakan"
            })
        }

        const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

        const newUser = await User.create({
            name,
            email: String(email).trim().toLowerCase(),
            phoneNumber,
            photo: req.body.photo || DEFAULT_AVATAR,
            password: await argon2.hash(password),
            role
        })

        if (role === 'worker') {
            await Worker.create({
                UserID: newUser.UserID,
                balance: 0,
                status: 'unverified',
                description: req.body.description || 'Worker terdaftar baru.'
            }).catch(e => console.warn("Auto worker creation notice:", e.message));
        }

        return res.status(201).json({
            message: "Berhasil membuat akun",
            data: newUser
        })
    } catch (error) {
        console.error("register error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const googleLogin = async (req, res) => {
    try {
        const { idToken, role: requestedRole } = req.body;
        let email = 'google.user@gmail.com';
        let name = 'Google User';
        let photo = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150";

        if (idToken && typeof idToken === 'string') {
            try {
                const parts = idToken.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
                    if (payload.email) email = payload.email.toLowerCase();
                    if (payload.name) name = payload.name;
                    if (payload.picture) photo = payload.picture;
                }
            } catch (e) {}
        }

        let user = await User.findOne({ where: { email } });
        const userRole = requestedRole === 'worker' ? 'worker' : 'client';

        if (!user) {
            user = await User.create({
                name,
                email,
                phoneNumber: '081299990000',
                photo,
                password: await argon2.hash('google_auth_dummy_pass'),
                role: userRole
            });
        }

        if (user.role === 'worker') {
            const existingWorker = await Worker.findOne({ where: { UserID: user.UserID } });
            if (!existingWorker) {
                await Worker.create({
                    UserID: user.UserID,
                    balance: 0,
                    status: 'Available',
                    description: 'Worker terdaftar via Google.'
                }).catch(() => {});
            }
        }

        const payload = {
            id: user.UserID,
            role: user.role
        };
        const secret = process.env.JWT_SECRET || 'secret';
        const token = jwt.sign(payload, secret, { expiresIn: 60 * 60 * 24 * 7 });

        return res.json({
            message: "Berhasil login dengan Google",
            token,
            user
        });
    } catch (error) {
        console.error("googleLogin error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}


export const login = async(req, res) => {
    try {
        const user = await User.findOne({
            where: {
                email: req.body.email
            }
        })


        if(!user) {
            return res.status(401).json({
                message: 'Email atau password salah'
            })
        }


        if(!await argon2.verify(user.password, req.body.password)) {
            return res.status(401).json({
                message: "Email atau password salah"
            })
        }
        
        const payload = {
            id: user.UserID,
            role: user.role
        }

        const secret = process.env.JWT_SECRET

        const token = jwt.sign(payload, secret, {expiresIn: 60*60*24*7})

        return res.json({
            message: "Berhasil login",
            token: token
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const updateProfil = async(req, res) => {
    try {
        if (req.body.photo && req.body.photo.startsWith('data:image')) {
            try {
                const formData = new URLSearchParams();
                formData.append("image", req.body.photo.replace(/^data:image\/\w+;base64,/, ''));
                const resp = await axios.post("https://api.imgbb.com/1/upload?key=" + (process.env.IMGDB_KEY || 'dummy_key'), formData);
                if (resp.data?.data?.display_url) {
                    req.body.photo = resp.data.data.display_url;
                }
            } catch (imgErr) {
                console.warn("ImgBB upload warning in updateProfil:", imgErr.message);
            }
        }

        const allowedFields = ["name", "photo", "address", "phoneNumber", "latitude", "longitude"];
        const payload = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
        );

        await User.update(payload, {
            where: {
                UserID: req.user.id
            }
        })

        return res.json({
            message: "Berhasil memperbarui profil"
        })

    } catch (error) {
        console.error("updateProfil error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getUser = async (req, res) => {
    try {
        const { role, page: _page, perPage: _perPage } = req.query;
        const whereClause = {};
        if (role) {
            whereClause.role = role;
        }

        const perPage = parseInt(_perPage) || 100;
        const page = parseInt(_page) || 1;
        const offset = (page - 1) * perPage;

        const totalData = await User.count({ where: whereClause });

        const users = await User.findAll({
            where: whereClause,
            limit: perPage,
            offset: offset,
            order: [
                ["createdAt", "DESC"]
            ]
        });

        return res.json({
            message: "Berhasil mendapatkan data",
            totalData: totalData,
            data: users
        });
    } catch (error) {
        console.error("getUser error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};


export const getDetailUser = async(req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ message: "Akses ditolak" });
        }
        const user = await User.findOne({
            where: {
                UserID: req.params.id
            },
            attributes: {
                exclude: req.user.role === "worker" ? ["password", "createdAt", "email"] : ["password"]
            }
        })

        if(!user) {
            return res.status(404).json({
                message: "Data tidak ditemukan"
            })
        }

        return res.json({
            message: "Berhasil mendapatkan data",
            data: user
        })

    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const deleteUser = async(req, res) => {
    try {
        await User.destroy({
            where: {
                UserID: req.params.id
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
