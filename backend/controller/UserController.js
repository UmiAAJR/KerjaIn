import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import initModels from '../model/init-models.js'
import db from '../db/db.js'
dotenv.config()

const model = initModels(db)
const User = model.User;

export const registerClient = async (req, res) => {
    try {
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

        const object = {
            ...req.body,
            password: await argon2.hash(req.body.password),
            role: req.body.role ?? "client"
        }

        await User.create(object)

        return res.status(201).json({
            message: "Berhasil membuat akun"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
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
        const checkEmail = await User.findOne({
            where: {
                email: req.body.email
            }
        })

        if(checkEmail && checkEmail.UserID !== req.user.id) {
            return res.status(409).json({
                message: "Email sudah digunakan"
            })
        }

        const checkPhoneNumber = await User.findOne({
            where: {
                phoneNumber: req.body.phoneNumber
            }
        })

        if(checkPhoneNumber && checkPhoneNumber.UserID !== req.user.id) {
            return res.status(409).json({
                message: "Nomor sudah digunakan"
            })
        }

        await User.update(req.body, {
            where: {
                UserID: req.user.id
            }
        })

        return res.json({
            message: "Berhasil memperbarui profil"
        })

    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getUser = async(req, res) => {
    try {
        const perPage = req.query.perPage ?? 10
        const totalData = await User.count()
        let page = req.query.page ?? 1
        let offset = (page-1)*perPage

        const users = await User.findAll({
            limit: perPage,
            offset: offset,
            order: [
                ["createdAt", "DESC"]
            ]
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            totalData: totalData,
            data: users
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getDetailUser = async(req, res) => {
    try {
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