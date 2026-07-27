import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

dotenv.config()

const db = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false, // buat lihat log query
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
})

export default db