import axiosInstance from './axiosInstance';

const getData = (key) => JSON.parse(localStorage.getItem(key));
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const mockAdminApi = {
    getDashboardStats: async () => {
        const workers = getData('ki_workers') || [];
        const jobs = getData('ki_jobs') || [];
        const totalWorker = workers.length;
        const verifiedWorker = workers.filter(w => w.verified).length;
        const pendingWorker = workers.filter(w => w.ktpStatus === 'Pending').length;
        const totalClient = 45;
        const activeJob = jobs.filter(j => ['WORKER_ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'WAITING_CONFIRMATION'].includes(j.status)).length;
        const completedJob = jobs.filter(j => j.status === 'COMPLETED').length;
        const escrowHolding = jobs.filter(j => j.escrowStatus === 'Holding').reduce((acc, curr) => acc + curr.price, 0);
        const escrowReleased = jobs.filter(j => j.escrowStatus === 'Released').reduce((acc, curr) => acc + curr.price, 0);
        const activePanic = jobs.filter(j => j.panicEnabled).length;
        const todayRevenue = escrowReleased * 0.1;

        return {
            totalWorker,
            verifiedWorker,
            pendingWorker,
            totalClient,
            activeJob,
            completedJob,
            escrowHolding,
            escrowReleased,
            activePanic,
            todayRevenue,
            weeklyRevenue: todayRevenue * 5,
            monthlyRevenue: todayRevenue * 20
        };
    },

    getClients: async () => {
        const clientProfile = getData('ki_client_profile') || { name: 'Budi Santoso', phone: '081234567890', photo: '' };
        return [
            { userId: 'client-1', name: clientProfile.name, role: 'Client', verified: true, phone: clientProfile.phone, joinedAt: '2026-06-01', status: 'Active', photo: clientProfile.photo },
            { userId: 'client-2', name: 'Ani Yudhoyono', role: 'Client', verified: true, phone: '081299998811', joinedAt: '2026-06-15', status: 'Active', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150' },
            { userId: 'client-3', name: 'Andi Mallarangeng', role: 'Client', verified: false, phone: '081299992222', joinedAt: '2026-07-01', status: 'Suspended', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' }
        ];
    },

    getWorkers: async () => {
        return getData('ki_workers') || [];
    },

    getWorkerVerificationList: async () => {
        const workers = getData('ki_workers') || [];
        return workers.filter(w => w.ktpStatus === 'Pending' || w.ktpStatus === 'Verified').map(w => ({
            workerId: w.id,
            photo: w.photo,
            name: w.name,
            ktpPhoto: w.ktpPhoto,
            selfiePhoto: w.selfiePhoto,
            status: w.ktpStatus,
            submittedAt: '2026-07-16 12:00'
        }));
    },

    verifyWorker: async (workerId, status) => {
        const workers = getData('ki_workers') || [];
        const idx = workers.findIndex(w => w.id === workerId);
        if (idx === -1) throw new Error('Worker tidak ditemukan');

        workers[idx].ktpStatus = status;
        workers[idx].verified = status === 'Verified';
        setData('ki_workers', workers);

        const notifs = getData('ki_notifications') || [];
        notifs.push({
            notificationId: `notif-${Date.now()}`,
            userId: workerId,
            title: status === 'Verified' ? 'Akun Anda Terverifikasi!' : 'Verifikasi Akun Ditolak',
            description: status === 'Verified'
                ? 'Selamat, identitas Anda telah diverifikasi oleh Admin. Anda kini mendapat lencana verified.'
                : 'Verifikasi KTP Anda ditolak karena foto kurang jelas. Silakan ajukan ulang.',
            type: 'system',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/worker/profile`
        });
        setData('ki_notifications', notifs);

        return workers[idx];
    },

    getReports: async () => {
        return getData('ki_reports') || [];
    },

    getReportDetail: async (reportId) => {
        const reports = getData('ki_reports') || [];
        const report = reports.find(r => r.reportId === reportId);
        if (!report) throw new Error('Laporan tidak ditemukan');

        const worker = (getData('ki_workers') || []).find(w => w.id === report.reportedWorkerId);
        const client = getData('ki_client_profile') || { name: report.reporterName };
        const job = (getData('ki_jobs') || []).find(j => j.workerId === report.reportedWorkerId && j.clientName === report.reporterName);

        return {
            report,
            worker,
            client,
            job,
            attachment: report.attachment,
            description: report.description,
            timeline: report.timeline
        };
    },

    resolveReport: async (reportId) => {
        const reports = getData('ki_reports') || [];
        const idx = reports.findIndex(r => r.reportId === reportId);
        if (idx === -1) throw new Error('Laporan tidak ditemukan');

        reports[idx].status = 'Resolved';
        reports[idx].timeline.push({
            time: new Date().toISOString().replace('T', ' ').slice(0, 16),
            title: 'Laporan Ditandai Selesai oleh Admin'
        });
        setData('ki_reports', reports);
        return reports[idx];
    },

    getPanicAlerts: async () => {
        const jobs = getData('ki_jobs') || [];
        return jobs.filter(j => j.panicEnabled).map(j => ({
            panicId: `panic-${j.jobId}`,
            jobId: j.jobId,
            workerName: j.workerName,
            workerPhoto: j.workerPhoto,
            createdAt: j.date + ' 10:00',
            status: 'Active'
        }));
    },

    getPanicDetail: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const job = jobs.find(j => j.jobId === jobId);
        if (!job) throw new Error('Panic detail tidak ditemukan');

        const worker = (getData('ki_workers') || []).find(w => w.id === job.workerId);

        return {
            panicId: `panic-${job.jobId}`,
            worker: {
                id: job.workerId,
                name: job.workerName,
                photo: job.workerPhoto
            },
            phone: worker ? worker.phone : 'N/A',
            latitude: job.currentLatitude,
            longitude: job.currentLongtitude,
            job: {
                jobId: job.jobId,
                service: job.service,
                clientName: job.clientName,
                address: job.address
            },
            createdAt: job.date + ' 10:00',
            status: job.panicEnabled ? 'Active' : 'Resolved'
        };
    },

    resolvePanic: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].panicEnabled = false;
        setData('ki_jobs', jobs);
        return { success: true };
    },

    getEscrowList: async () => {
        const jobs = getData('ki_jobs') || [];
        return jobs.map(j => ({
            escrowId: `esc-${j.jobId}`,
            jobId: j.jobId,
            service: j.service,
            worker: j.workerName,
            client: j.clientName,
            amount: j.price,
            status: j.escrowStatus,
            createdAt: j.date + ' 09:00',
            releasedAt: j.escrowStatus === 'Released' ? j.finishedAt || j.date : null
        }));
    },

    releaseEscrow: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].escrowStatus = 'Released';
        jobs[idx].status = 'COMPLETED';
        setData('ki_jobs', jobs);
        return jobs[idx];
    },

    getCategories: async () => {
        return getData('ki_categories') || [];
    },

    createCategory: async (nama, icon = 'Layers') => {
        const categories = getData('ki_categories') || [];
        const newCat = {
            id: `cat-${Date.now()}`,
            nama,
            icon
        };
        categories.push(newCat);
        setData('ki_categories', categories);
        return newCat;
    },

    deleteCategory: async (id) => {
        const categories = getData('ki_categories') || [];
        const filtered = categories.filter(c => c.id !== id);
        setData('ki_categories', filtered);
        return { success: true };
    }
};

const realAdminApi = {
    getDashboardStats: async () => {
        const res = await axiosInstance.get('/admin/dashboard');
        return res.data;
    },
    getClients: async () => {
        const res = await axiosInstance.get('/admin/clients');
        return res.data;
    },
    getWorkers: async () => {
        const res = await axiosInstance.get('/admin/workers');
        return res.data;
    },
    getWorkerVerificationList: async () => {
        const res = await axiosInstance.get('/admin/verifications');
        return res.data;
    },
    verifyWorker: async (workerId, status) => {
        const res = await axiosInstance.post(`/admin/workers/${workerId}/verify`, { status });
        return res.data;
    },
    getReports: async () => {
        const res = await axiosInstance.get('/admin/reports');
        return res.data;
    },
    getReportDetail: async (reportId) => {
        const res = await axiosInstance.get(`/admin/reports/${reportId}`);
        return res.data;
    },
    resolveReport: async (reportId) => {
        const res = await axiosInstance.post(`/admin/reports/${reportId}/resolve`);
        return res.data;
    },
    getPanicAlerts: async () => {
        const res = await axiosInstance.get('/admin/panics');
        return res.data;
    },
    getPanicDetail: async (jobId) => {
        const res = await axiosInstance.get(`/admin/panics/${jobId}`);
        return res.data;
    },
    resolvePanic: async (jobId) => {
        const res = await axiosInstance.post(`/admin/panics/${jobId}/resolve`);
        return res.data;
    },
    getEscrowList: async () => {
        const res = await axiosInstance.get('/admin/escrows');
        return res.data;
    },
    releaseEscrow: async (jobId) => {
        const res = await axiosInstance.post(`/admin/escrows/${jobId}/release`);
        return res.data;
    },
    getCategories: async () => {
        const res = await axiosInstance.get('/admin/categories');
        return res.data;
    },
    createCategory: async (nama, icon = 'Layers') => {
        const res = await axiosInstance.post('/admin/categories', { name: nama, icon });
        return res.data;
    },
    deleteCategory: async (id) => {
        const res = await axiosInstance.delete(`/admin/categories/${id}`);
        return res.data;
    }
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const adminApi = USE_MOCK ? mockAdminApi : realAdminApi;
