import { Payment, Job, User, Worker } from "../model/models.js";
import db from '../db/db.js';
import midtransClient from 'midtrans-client';
import crypto from 'crypto';
import { canAccessJob, isAdmin } from '../middleware/AccessControl.js';

export const getPayment = async (req, res) => {
    try {
        const { page: _page, perPage: _perPage, ...whereClause } = req.query;
        const perPage = parseInt(_perPage) || 10;
        const page = parseInt(_page) || 1;
        const offset = (page - 1) * perPage;

        const totalData = await Payment.count({ where: { ...whereClause } });
        
        const payment = await Payment.findAll({
            limit: perPage,
            offset: offset,
            where: {
                ...whereClause
            },
            include: [
                {
                    model: Job,
                    as: "Job",
                    include: [
                        { model: User, as: "Client", attributes: ["UserID", "name", "email", "phoneNumber"] },
                        {
                            model: Worker,
                            as: "Worker",
                            include: [{ model: User, as: "User", attributes: ["UserID", "name", "email", "phoneNumber"] }]
                        }
                    ]
                }
            ],
            order: [
                ["createdAt", "DESC"]
            ]
        });

        return res.json({
            message: "Berhasil mendapatkan data",
            data: payment,
            totalData: totalData
        });
    } catch (error) {
        console.error("getPayment error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};

export const getDetailPayment = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            where: {
                PaymentID: req.params.id
            },
            include: [{ model: Job, as: 'Job' }]
        });
        if (!payment) return res.status(404).json({ message: "Payment tidak ditemukan" });
        if (!(await canAccessJob(req, payment.Job))) return res.status(403).json({ message: "Akses ditolak" });

        return res.json({
            message: "Berhasil mendapatkan data",
            data: payment
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};

export const updatePayment = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            where: { PaymentID: req.params.id }
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment tidak ditemukan" });
        }

        const requestedStatus = req.body.status;
        if (!['holding', 'released', 'refunded', 'failed'].includes(requestedStatus)) {
            return res.status(400).json({ message: "Status pembayaran tidak valid" });
        }

        // Auto update job status if payment status changed to 'holding'
        if (requestedStatus === 'holding') {
            await Job.update({ status: 'ESCROW_PAID' }, {
                where: { PaymentID: payment.PaymentID }
            });
            await payment.update({ status: 'holding' });
        } else if (requestedStatus === 'released') {
            await db.transaction(async (t) => {
                const freshPayment = await Payment.findOne({ where: { PaymentID: payment.PaymentID }, transaction: t });
                if (!freshPayment || freshPayment.status !== 'holding') {
                    throw new Error("Escrow belum dapat dilepas atau sudah dilepaskan");
                }
                const totalPrice = Number(freshPayment.amount || 0);
                const platformFee = Math.round(totalPrice * 0.10);
                const workerAmount = totalPrice - platformFee;

                const [updated] = await Payment.update({
                    status: 'released',
                    releasedAt: new Date(),
                    platformFee,
                    workerAmount
                }, { where: { PaymentID: freshPayment.PaymentID, status: 'holding' }, transaction: t });

                const job = await Job.findOne({ where: { PaymentID: freshPayment.PaymentID }, transaction: t });
                if (job && updated) {
                    await job.update({ status: 'COMPLETED' }, { transaction: t });
                    if (job.WorkerID) {
                        await Worker.increment('balance', { by: workerAmount, where: { WorkerID: job.WorkerID }, transaction: t });
                    }
                }
            });
        } else {
            await payment.update({ status: requestedStatus });
        }

        return res.json({
            message: "Berhasil memperbarui pembayaran",
            data: payment
        });
    } catch (error) {
        console.error("updatePayment error:", error);
        return res.status(500).json({
            message: error.message && error.message.includes("Escrow") ? error.message : "Terjadi kesalahan pada server"
        });
    }
};


export const createPayment = async (req, res) => {
    try {
        const { JobID, customerName, customerEmail, customerPhone, serviceName } = req.body;
        if (!JobID) return res.status(400).json({ message: "JobID wajib diisi" });
        
        const serverKey = process.env.MIDTRANS_SERVER_KEY || 'dummy_server_key';
        const clientKey = process.env.MIDTRANS_CLIENT_KEY || 'dummy_client_key';
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true' || (serverKey.startsWith('Mid-server-') && !serverKey.startsWith('SB-Mid-server-'));

        const snap = new midtransClient.Snap({
            isProduction: isProduction,
            serverKey: serverKey,
            clientKey: clientKey
        });

        // Try to fetch Client info from Job if available
        let clientInfo = {
            first_name: customerName || 'Client KerjaIn',
            email: customerEmail || 'client@kerjain.com',
            phone: customerPhone || '08123456789'
        };

        const job = await Job.findOne({
            where: { JobID },
            include: [{ model: User, as: 'Client' }, { model: Payment, as: 'Payment' }]
        });
        if (!job) return res.status(404).json({ message: "Pekerjaan tidak ditemukan" });
        if (!(await canAccessJob(req, job))) return res.status(403).json({ message: "Akses ditolak" });
        if (job.status !== 'WAITING_PAYMENT') return res.status(409).json({ message: "Pekerjaan tidak menunggu pembayaran" });
        if (job?.Client) {
            clientInfo = {
                first_name: job.Client.name || clientInfo.first_name,
                email: job.Client.email || clientInfo.email,
                phone: job.Client.phoneNumber || clientInfo.phone
            };
        }

        const newPayment = job.Payment;
        if (!newPayment) return res.status(409).json({ message: "Payment pekerjaan tidak ditemukan" });
        if (newPayment.status !== 'pending') return res.status(409).json({ message: "Payment sudah diproses" });

        let snapToken = 'mock_snap_token_' + Date.now();
        let redirectUrl = null;

        try {
            const parameter = {
                transaction_details: {
                    order_id: newPayment.PaymentID,
                    gross_amount: Math.round(Number(newPayment.amount))
                },
                item_details: [
                    {
                        id: JobID || newPayment.PaymentID,
                        price: Math.round(Number(newPayment.amount)),
                        quantity: 1,
                        name: (serviceName || 'Layanan Harian KerjaIn').slice(0, 50)
                    }
                ],
                customer_details: clientInfo
            };
            
            const transaction = await snap.createTransaction(parameter);
            if (transaction && transaction.token) {
                snapToken = transaction.token;
                redirectUrl = transaction.redirect_url;
            }
        } catch (midtransErr) {
            console.warn("Midtrans snap creation warning (using fallback token):", midtransErr.message);
        }

        await newPayment.update({ snapToken: snapToken });

        return res.status(201).json({
            message: "Berhasil membuat pembayaran",
            data: newPayment,
            snapToken: snapToken,
            redirectUrl: redirectUrl,
            clientKey: clientKey,
            isProduction: isProduction
        });
    } catch (error) {
        console.error("createPayment error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};

export const handleNotification = async (req, res) => {
    try {
        const notification = req.body;
        const paymentId = notification.order_id || req.body.order_id;
        const statusCode = notification.status_code || req.body.status_code;
        const grossAmount = notification.gross_amount || req.body.gross_amount;
        const transactionStatus = notification.transaction_status || req.body.transaction_status;
        const fraudStatus = notification.fraud_status || req.body.fraud_status;
        const signatureKey = notification.signature_key || req.body.signature_key;

        if (!paymentId) {
            return res.status(400).json({ message: "order_id (PaymentID) wajib ada" });
        }

        // Verify Signature Key if Server Key is configured and signatureKey is present
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        if (!serverKey || !signatureKey || !statusCode || !grossAmount) {
            return res.status(403).json({ message: "Signature Key wajib dan konfigurasi Midtrans belum lengkap" });
        }
        {
            const hash = crypto.createHash('sha512')
                .update(`${paymentId}${statusCode}${grossAmount}${serverKey}`)
                .digest('hex');
            if (hash !== signatureKey) {
                console.warn("⚠️ Midtrans webhook signature mismatch! Unauthorized request rejected.");
                return res.status(403).json({ message: "Signature Key tidak valid" });
            }
        }

        const payment = await Payment.findOne({
            where: { PaymentID: paymentId }
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment tidak ditemukan" });
        }
        if (Number(grossAmount) !== Number(payment.amount)) {
            return res.status(400).json({ message: "Nominal callback tidak sesuai" });
        }

        let newPaymentStatus = payment.status;
        let newJobStatus = null;

        if (transactionStatus === 'capture') {
            if (fraudStatus === 'challenge') {
                newPaymentStatus = 'pending';
            } else if (fraudStatus === 'accept') {
                newPaymentStatus = 'holding';
                newJobStatus = 'ESCROW_PAID';
            }
        } else if (transactionStatus === 'settlement') {
            newPaymentStatus = 'holding';
            newJobStatus = 'ESCROW_PAID';
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            newPaymentStatus = 'failed';
            newJobStatus = 'CANCELLED';
        } else if (transactionStatus === 'pending') {
            newPaymentStatus = 'pending';
        }

        if (newPaymentStatus === 'holding' && payment.status !== 'pending' && payment.status !== 'holding') {
            return res.status(409).json({ message: "Status callback tidak sesuai dengan payment saat ini" });
        }
        if (newPaymentStatus === 'failed' && payment.status !== 'pending') {
            return res.status(409).json({ message: "Status callback tidak sesuai dengan payment saat ini" });
        }

        const [updated] = await Payment.update(
            { status: newPaymentStatus },
            { where: { PaymentID: payment.PaymentID, status: payment.status } }
        );

        if (newJobStatus && updated) {
            await Job.update(
                { status: newJobStatus },
                { where: { PaymentID: paymentId } }
            );
        }

        return res.json({
            message: "Berhasil memproses notifikasi pembayaran",
            paymentStatus: newPaymentStatus,
            jobStatus: newJobStatus
        });
    } catch (error) {
        console.error("handleNotification error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};
