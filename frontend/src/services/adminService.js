import axiosInstance from './axiosInstance';

const getData = (key) => JSON.parse(localStorage.getItem(key));
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const mockAdminApi = {
    getDashboardStats: async () => {
        const workers = getData('ki_workers') || [];
        const jobs = getData('ki_jobs') || [];
        const totalWorker = workers.length;
        const verifiedWorker = workers.filter(w => w.ktpStatus === 'Verified' || w.verified).length;
        const pendingWorker = workers.filter(w => w.ktpStatus === 'Pending').length;
        const totalClient = 45;
        const activeJob = jobs.filter(j => ['WORKER_ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'WAITING_CONFIRMATION'].includes(j.status)).length;
        const completedJob = jobs.filter(j => j.status === 'COMPLETED').length;
        const escrowHolding = jobs.filter(j => j.escrowStatus === 'Holding').reduce((acc, curr) => acc + (curr.price || curr.amount || 0), 0);
        const escrowReleased = jobs.filter(j => j.escrowStatus === 'Released').reduce((acc, curr) => acc + (curr.price || curr.amount || 0), 0);
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
            { id: 'client-1', UserID: 'client-1', name: clientProfile.name, role: 'Client', verified: true, phone: clientProfile.phone, joinedAt: '2026-06-01', status: 'Active', photo: clientProfile.photo, address: clientProfile.address },
            { id: 'client-2', UserID: 'client-2', name: 'Ani Yudhoyono', role: 'Client', verified: true, phone: '081299998811', joinedAt: '2026-06-15', status: 'Active', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', address: 'Jakarta Pusat' },
            { id: 'client-3', UserID: 'client-3', name: 'Andi Mallarangeng', role: 'Client', verified: false, phone: '081299992222', joinedAt: '2026-07-01', status: 'Suspended', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', address: 'Kebayoran Baru, Jakarta' }
        ];
    },

    getWorkers: async () => {
        return getData('ki_workers') || [];
    },

    getWorkerVerificationList: async () => {
        const workers = getData('ki_workers') || [];
        return workers.filter(w => w.ktpStatus === 'Pending' || w.ktpStatus === 'Verified' || w.ktpStatus === 'Rejected').map(w => ({
            id: w.id,
            VerifyID: `ver-${w.id}`,
            WorkerID: w.id,
            photo: w.photo,
            name: w.name,
            email: w.email,
            ktpPhoto: w.ktpPhoto,
            selfiePhoto: w.selfiePhoto,
            status: w.ktpStatus || 'Pending',
            ktpStatus: w.ktpStatus || 'Pending',
            submittedAt: w.submittedAt || '2026-07-16 12:00'
        }));
    },

    verifyWorker: async (workerId, status) => {
        const workers = getData('ki_workers') || [];
        const idx = workers.findIndex(w => w.id === workerId || `ver-${w.id}` === workerId);
        if (idx === -1) throw new Error('Worker tidak ditemukan');

        workers[idx].ktpStatus = status;
        workers[idx].verified = status === 'Verified' || status === 'accepted';
        setData('ki_workers', workers);

        const notifs = getData('ki_notifications') || [];
        notifs.push({
            NotificationID: `notif-${Date.now()}`,
            notificationId: `notif-${Date.now()}`,
            userId: workers[idx].id,
            title: status === 'Verified' || status === 'accepted' ? 'Akun Anda Terverifikasi!' : 'Verifikasi Akun Ditolak',
            description: status === 'Verified' || status === 'accepted'
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
        if (!reports[idx].timeline) reports[idx].timeline = [];
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
            PanicID: `panic-${j.jobId}`,
            JobID: j.jobId,
            workerName: j.workerName,
            workerPhoto: j.workerPhoto,
            createdAt: j.date + ' 10:00',
            status: 'Active',
            longitude: j.currentLongtitude || 106.8456,
            latitude: j.currentLatitude || -6.2088
        }));
    },

    getPanicDetail: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const job = jobs.find(j => j.jobId === jobId || `panic-${j.jobId}` === jobId);
        if (!job) throw new Error('Panic detail tidak ditemukan');

        const worker = (getData('ki_workers') || []).find(w => w.id === job.workerId);

        return {
            PanicID: `panic-${job.jobId}`,
            JobID: job.jobId,
            worker: {
                id: job.workerId,
                name: job.workerName,
                photo: job.workerPhoto
            },
            phone: worker ? worker.phone : 'N/A',
            latitude: job.currentLatitude || -6.2088,
            longitude: job.currentLongtitude || 106.8456,
            job: {
                JobID: job.jobId,
                jobId: job.jobId,
                service: job.service || job.title,
                clientName: job.clientName,
                address: job.address
            },
            createdAt: job.date + ' 10:00',
            status: job.panicEnabled ? 'Active' : 'Resolved'
        };
    },

    resolvePanic: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const cleanJobId = jobId.startsWith('panic-') ? jobId.replace('panic-', '') : jobId;
        const idx = jobs.findIndex(j => j.jobId === cleanJobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].panicEnabled = false;
        setData('ki_jobs', jobs);
        return { success: true };
    },

    getEscrowList: async () => {
        const jobs = getData('ki_jobs') || [];
        const escrowJobs = jobs.filter(j => j.escrowStatus && j.escrowStatus !== 'None');
        return escrowJobs.map(j => ({
            PaymentID: `pay-${j.jobId}`,
            Payment: {
                PaymentID: `pay-${j.jobId}`,
                amount: j.price,
                status: j.escrowStatus === 'Released' ? 'released' : j.escrowStatus === 'Refunded' ? 'refunded' : 'holding',
                createdAt: j.date || '2026-07-27',
                releasedAt: j.escrowStatus === 'Released' ? j.finishedAt || j.date : null
            },
            escrowId: `esc-`,
            jobId: j.jobId,
            JobID: j.jobId,
            title: j.service || j.title,
            service: j.service || j.title,
            workerName: j.workerName,
            clientName: j.clientName,
            price: j.price,
            status: j.status,
            escrowStatus: j.escrowStatus,
            paymentProof: j.paymentProof,
            createdAt: j.date || new Date().toISOString().slice(0, 10),
            releasedAt: j.escrowStatus === 'Released' ? j.finishedAt || j.date : null
        }));
    },

    approvePayment: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');
        jobs[idx].status = 'ACCEPTED';
        jobs[idx].escrowStatus = 'Holding';
        setData('ki_jobs', jobs);
        return jobs[idx];
    },

    rejectPayment: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');
        jobs[idx].status = 'WAITING_PAYMENT';
        jobs[idx].escrowStatus = 'Pending';
        delete jobs[idx].paymentProof;
        setData('ki_jobs', jobs);
        return jobs[idx];
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

    refundEscrow: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');
        jobs[idx].status = 'CANCELLED';
        jobs[idx].escrowStatus = 'Refunded';
        setData('ki_jobs', jobs);
        return jobs[idx];
    },

    getJobs: async () => {
        const jobs = getData('ki_jobs') || [];
        return jobs.map(j => ({
            ...j,
            JobID: j.jobId || j.JobID,
            createdAt: j.createdAt || j.date || new Date().toISOString()
        }));
    },

    getCategories: async () => {
        const categories = getData('ki_categories') || [];
        return categories.map(cat => ({
            ...cat,
            CategoryID: cat.id || cat.CategoryID,
            name: cat.nama || cat.name,
            skills: (cat.skills || []).map(sk => ({
                ...sk,
                SkillID: sk.id || sk.SkillID,
                name: sk.name
            }))
        }));
    },

    createCategory: async (nama, icon = 'Layers') => {
        const categories = getData('ki_categories') || [];
        const id = `cat-${Date.now()}`;
        const newCat = {
            id,
            CategoryID: id,
            nama,
            name: nama,
            icon,
            skills: []
        };
        categories.push(newCat);
        setData('ki_categories', categories);
        return newCat;
    },

    deleteCategory: async (id) => {
        const categories = getData('ki_categories') || [];
        const filtered = categories.filter(c => c.id !== id && c.CategoryID !== id);
        setData('ki_categories', filtered);
        return { success: true };
    },

    createSkill: async (categoryId, skillName) => {
        const categories = getData('ki_categories') || [];
        const idx = categories.findIndex(c => c.id === categoryId || c.CategoryID === categoryId);
        if (idx === -1) throw new Error('Kategori tidak ditemukan');
        if (!categories[idx].skills) {
            categories[idx].skills = [];
        }
        const id = `sk-${Date.now()}`;
        const newSkill = {
            id,
            SkillID: id,
            name: skillName,
            CategoryID: categoryId
        };
        categories[idx].skills.push(newSkill);
        setData('ki_categories', categories);
        return newSkill;
    },

    deleteSkill: async (categoryId, skillId) => {
        const categories = getData('ki_categories') || [];
        const idx = categories.findIndex(c => c.id === categoryId || c.CategoryID === categoryId);
        if (idx === -1) throw new Error('Kategori tidak ditemukan');
        if (categories[idx].skills) {
            categories[idx].skills = categories[idx].skills.filter(s => s.id !== skillId && s.SkillID !== skillId);
        }
        setData('ki_categories', categories);
        return { success: true };
    },

    getNotifications: async () => {
        return getData('ki_notifications') || [];
    },

    createNotification: async (data) => {
        const notifs = getData('ki_notifications') || [];
        const id = `notif-${Date.now()}`;
        const newNotif = {
            NotificationID: id,
            notificationId: id,
            title: data.title,
            description: data.description,
            type: data.type || 'system',
            role: data.role || 'all',
            actionLink: data.actionLink || '',
            createdAt: new Date().toISOString(),
            isRead: false
        };
        notifs.unshift(newNotif);
        setData('ki_notifications', notifs);
        return newNotif;
    },

    deleteNotification: async (id) => {
        const notifs = getData('ki_notifications') || [];
        const filtered = notifs.filter(n => n.NotificationID !== id && n.notificationId !== id);
        setData('ki_notifications', filtered);
        return { success: true };
    }
};

const realAdminApi = {
    getDashboardStats: async () => {
        const res = await axiosInstance.get('/admin/dashboard');
        return res.data;
    },
    getJobs: async () => {
        const res = await axiosInstance.get('/admin/jobs');
        return res.data;
    },
    getClients: async () => {
        const res = await axiosInstance.get('/user?role=client');
        return res.data;
    },
    getWorkers: async () => {
        const res = await axiosInstance.get('/worker');
        return res.data;
    },
    getWorkerVerificationList: async () => {
        const res = await axiosInstance.get('/verify');
        return res.data;
    },
    verifyWorker: async (workerId, status) => {
        const res = await axiosInstance.patch(`/verify/handle/${workerId}`, { status });
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
        const res = await axiosInstance.get('/panic');
        return res.data;
    },
    getPanicDetail: async (jobId) => {
        const res = await axiosInstance.get(`/panic/${jobId}`);
        return res.data;
    },
    resolvePanic: async (jobId) => {
        const res = await axiosInstance.patch(`/panic/${jobId}`, { status: 'resolved' });
        return res.data;
    },
    getEscrowList: async () => {
        const res = await axiosInstance.get('/admin/escrows');
        return res.data;
    },
    approvePayment: async (jobId) => {
        const res = await axiosInstance.post(`/admin/escrows/${jobId}/approve`);
        return res.data;
    },
    rejectPayment: async (jobId) => {
        const res = await axiosInstance.post(`/admin/escrows/${jobId}/reject`);
        return res.data;
    },
    releaseEscrow: async (jobId) => {
        const res = await axiosInstance.post(`/admin/escrows/${jobId}/release`);
        return res.data;
    },
    refundEscrow: async (jobId) => {
        const res = await axiosInstance.post(`/admin/escrows/${jobId}/refund`);
        return res.data;
    },
    getCategories: async () => {
        const res = await axiosInstance.get('/category');
        return res.data;
    },
    createCategory: async (nama, icon = 'Layers') => {
        const res = await axiosInstance.post('/category', { name: nama, icon });
        return res.data;
    },
    deleteCategory: async (id) => {
        const res = await axiosInstance.delete(`/category/${id}`);
        return res.data;
    },
    createSkill: async (categoryId, skillName) => {
        const res = await axiosInstance.post(`/skill`, { name: skillName, CategoryID: categoryId });
        return res.data;
    },
    deleteSkill: async (categoryId, skillId) => {
        const res = await axiosInstance.delete(`/skill/${skillId}`);
        return res.data;
    },
    getNotifications: async () => {
        const res = await axiosInstance.get('/notification');
        return res.data;
    },
    createNotification: async (data) => {
        const res = await axiosInstance.post('/notification', data);
        return res.data;
    },
    deleteNotification: async (id) => {
        const res = await axiosInstance.delete(`/notification/${id}`);
        return res.data;
    }
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const adminApi = USE_MOCK ? mockAdminApi : realAdminApi;
