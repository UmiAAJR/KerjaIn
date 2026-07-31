import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

dotenv.config()

const isSslRequired = process.env.DB_SSL === 'true' || (process.env.DB_URL && process.env.DB_URL.includes('sslmode=require'));

const db = new Sequelize(process.env.DB_URL || 'postgresql://postgres:postgres@localhost:5432/kerjain', {
    dialect: 'postgres',
    logging: false,
    ...(isSslRequired ? {
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    } : {})
})

export default db