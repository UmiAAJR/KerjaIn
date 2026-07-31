import { Report, User, Worker, Job } from '../model/models.js';

export const getReports = async (req, res) => {
    try {
        const { page: _page, perPage: _perPage } = req.query;
        const perPage = parseInt(_perPage) || 20;
        const page = parseInt(_page) || 1;
        const offset = (page - 1) * perPage;

        const totalData = await Report.count();
        const reports = await Report.findAll({
            limit: perPage,
            offset,
            include: [
                { model: User, as: 'Reporter', attributes: ['UserID', 'name', 'email', 'phoneNumber'] },
                { model: Worker, as: 'ReportedWorker', include: [{ model: User, as: 'User', attributes: ['UserID', 'name', 'email'] }] },
                { model: Job, as: 'Job' }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.json({
            message: "Berhasil mendapatkan daftar laporan",
            data: reports,
            totalData
        });
    } catch (error) {
        console.error("getReports error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getDetailReport = async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id, {
            include: [
                { model: User, as: 'Reporter', attributes: ['UserID', 'name', 'email', 'phoneNumber'] },
                { model: Worker, as: 'ReportedWorker', include: [{ model: User, as: 'User', attributes: ['UserID', 'name', 'email'] }] },
                { model: Job, as: 'Job' }
            ]
        });

        if (!report) return res.status(404).json({ message: "Laporan tidak ditemukan" });

        return res.json({
            message: "Berhasil mendapatkan rincian laporan",
            data: report
        });
    } catch (error) {
        console.error("getDetailReport error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const createReport = async (req, res) => {
    try {
        const { JobID, category, description, attachment } = req.body;
        if (!category || !description) {
            return res.status(400).json({ message: "Kategori dan deskripsi laporan wajib diisi" });
        }

        let reportedWorkerID = null;
        if (JobID) {
            const job = await Job.findByPk(JobID);
            if (job) reportedWorkerID = job.WorkerID;
        }

        const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
        const initialTimeline = JSON.stringify([
            { time: nowStr, title: 'Laporan Diajukan oleh Pelanggan' }
        ]);

        const newReport = await Report.create({
            reporterID: req.user.id,
            reportedWorkerID,
            JobID: JobID || null,
            category,
            description,
            attachment: attachment || null,
            status: 'Pending',
            timeline: initialTimeline
        });

        return res.status(201).json({
            message: "Laporan kendala berhasil dikirim",
            data: newReport
        });
    } catch (error) {
        console.error("createReport error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const resolveReport = async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id);
        if (!report) return res.status(404).json({ message: "Laporan tidak ditemukan" });

        let timeline = [];
        try {
            timeline = report.timeline ? JSON.parse(report.timeline) : [];
        } catch (e) {}

        const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
        timeline.push({
            time: nowStr,
            title: 'Laporan Ditandai Selesai oleh Admin'
        });

        await report.update({
            status: 'Resolved',
            timeline: JSON.stringify(timeline)
        });

        return res.json({
            message: "Laporan berhasil ditandai selesai",
            data: report
        });
    } catch (error) {
        console.error("resolveReport error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};
