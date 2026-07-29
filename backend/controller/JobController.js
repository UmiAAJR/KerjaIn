import { where } from "sequelize";
import db from "../db/db.js";
import initModels from "../model/init-models.js";
import midtransClient from 'midtrans-client';


const model = initModels(db)
const Job = model.Job
const Worker = model.Worker
const Payment = model.Payment

export const getJob = async (req, res) => {
    try {
        const perPage = req.query.perPage ?? 10
        let page = req.query.page ?? 1
        let offset = (page - 1) * perPage

        const job = await Job.findAll({
            limit: perPage,
            offset: offset,
            where: {
                ...req.query
            },
            order: [
                ["createdAt", "DESC"]
            ]
        })

        const totalData = await Job.count()

        return res.json({
            message: "Berhasil mendapatkan data",
            data: job,
            totalData: totalData
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const getDetailJob = async (req, res) => {
    try {
        const job = await Job.findOne({
            where: {
                JobID: req.params.id
            }
        })

        return res.json({
            message: "Berhasil mendapatkan data",
            data: job
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const createJob = async (req, res) => {
    try {
        const snap = new midtransClient.Snap({
            isProduction: false, // Ubah ke true pas sudah rilis
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.MIDTRANS_CLIENT_KEY
        });

        const { amount } = req.body;

        const newPayment = await Payment.create({
            amount: amount,
            status: 'pending',
        });

        const parameter = {
            transaction_details: {
                order_id: newPayment.PaymentID,
                gross_amount: newPayment.amount
            },
        };

        const transaction = await snap.createTransaction(parameter);
        const token = transaction.token;

        await newPayment.update({ snapToken: token });

        await Job.create({
            ...req.body,
            PaymentID: newPayment.PaymentID
        })

        return res.json({
            message: "Berhasil membuat data",
            token: token
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const updateJob = async (req, res) => {
    try {
        await Job.update(req.body, {
            where: {
                JobID: req.params.id
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

export const completeJob = async (req, res) => {
    try {
        const job = await Job.findOne({
            where: {
                JobID: req.params.id
            },
            include: [
                {
                    model: Payment,
                    as: "Payment",
                    attributes: ["amount"]
                }
            ]
        }) 
        
        await job.update(req.body)

        const worker = await Worker.findOne({
            where: {
                WorkerID: job.WorkerID
            }
        })

        const amount = job.Payment.amount
        const newBalance = worker.balance + (job.Payment.amount - (job.Payment.amount / 10))

        worker.update({balance: newBalance})

        return res.json({
            message: "Berhasil memperbarui kategori"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        })
    }
}

export const deleteJob = async (req, res) => {
    try {
        await Job.destroy({
            where: {
                JobID: req.params.id
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