import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

export const VerifyUser = (req, res, next) => {
    try {
        const {authorization} = req.headers;
        if(!authorization) {
            return res.status(403).json({
                message: "Mohon login ulang"
            })
        }

        const token = authorization.split(' ')[1]
        const secret = process.env.JWT_SECRET

        try {
            const jwtDecode = jwt.verify(token, secret);
            req.user = jwtDecode
        } catch (error) {
            return res.status(403).json({
                message: "Mohon login ulang"
            })
        }

        next()
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }   
}

export const VerifyClient = (req, res, next) => {
    try {
        if(req.user.role === "client") {
            return next()
        }

        return res.status(404).json({
            message: "Halaman tidak ditemukan"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const VerifyWorker = (req, res, next) => {
    try {
        if(req.user.role === "worker") {
            return next()
        }

        return res.status(404).json({
            message: "Halaman tidak ditemukan"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const VerifyAdmin = (req, res, next) => {
    try {
        if(req.user.role === "admin") {
            return next()
        }

        return res.status(404).json({
            message: "Halaman tidak ditemukan"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}