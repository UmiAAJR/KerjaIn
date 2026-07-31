import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

export const VerifyUser = (req, res, next) => {
    try {
        const {authorization} = req.headers;
        if(!authorization) {
            return res.status(401).json({
                message: "Mohon login ulang"
            })
        }

        const token = authorization.split(' ')[1]
        const secret = process.env.JWT_SECRET

        try {
            const jwtDecode = jwt.verify(token, secret);
            req.user = jwtDecode
        } catch (error) {
            return res.status(401).json({
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

export const CheckRole = (allowedRoles) => {
    return (req, res, next) => {
        
        const userRole = req.user.role;

        if (!userRole) {
            return res.status(401).json({ message: "Akses ditolak. Tidak ada data role." });
        }

        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            return res.status(403).json({ message: "Akses ditolak. Hak akses tidak mencukupi." });
        }
    }
}
