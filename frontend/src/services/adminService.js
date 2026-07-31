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
        try {
            const [usersRes, workersRes, jobsRes, paymentsRes, panicRes] = await Promise.allSettled([
                axiosInstance.get('/user'),
                axiosInstance.get('/worker'),
                axiosInstance.get('/job'),
                axiosInstance.get('/payment'),
                axiosInstance.get('/panic')
            ]);

            const users = usersRes.status === 'fulfilled' ? (usersRes.value.data.data || []) : [];
            const workers = workersRes.status === 'fulfilled' ? (workersRes.value.data.data || []) : [];
            const jobs = jobsRes.status === 'fulfilled' ? (jobsRes.value.data.data || []) : [];
            const payments = paymentsRes.status === 'fulfilled' ? (paymentsRes.value.data.data || []) : [];
            const panics = panicRes.status === 'fulfilled' ? (panicRes.value.data.data || []) : [];

            const totalClient = users.filter(u => u.role === 'client').length;
            const totalWorker = workers.length;
            const verifiedWorker = workers.filter(w => w.status === 'verified').length;
            const pendingWorker = workers.filter(w => w.status === 'pending_verification' || w.status === 'pending').length;

            const activeJob = jobs.filter(j => ['WORKER_ACCEPTED', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'WAITING_CONFIRMATION', 'WAIT_CONFIRM'].includes(j.status)).length;
            const completedJob = jobs.filter(j => j.status === 'COMPLETED').length;

            const escrowHolding = payments.filter(p => p.status === 'pending' || p.status === 'holding').reduce((acc, p) => acc + Number(p.amount || 0), 0);
            const escrowReleased = payments.filter(p => p.status === 'released').reduce((acc, p) => acc + Number(p.amount || 0), 0);
            const todayRevenue = Math.floor(escrowReleased * 0.1);
            const activePanic = panics.filter(p => p.status !== 'resolved').length;

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
        } catch (err) {
            console.error("Failed to aggregate dashboard stats:", err);
            return {
                totalWorker: 0, verifiedWorker: 0, pendingWorker: 0,
                totalClient: 0, activeJob: 0, completedJob: 0,
                escrowHolding: 0, escrowReleased: 0, activePanic: 0,
                todayRevenue: 0, weeklyRevenue: 0, monthlyRevenue: 0
            };
        }
    },
    getJobs: async () => {
        const res = await axiosInstance.get('/job');
        const jobs = res.data.data || [];
        return jobs.map(j => ({
            ...j,
            JobID: j.JobID || j.jobId,
            jobId: j.JobID || j.jobId,
            title: j.comment || `Pekerjaan Jasa #${(j.JobID || '').slice(0, 6)}`,
            service: j.comment || 'Pekerjaan Jasa',
            clientName: j.Client?.name || 'Client',
            workerName: j.Worker?.User?.name || 'Worker Belum Ditentukan',
            price: Number(j.Payment?.amount || 0),
            amount: Number(j.Payment?.amount || 0),
            escrowStatus: j.Payment?.status === 'released' ? 'Released' : j.Payment?.status === 'holding' ? 'Holding' : 'Pending',
            createdAt: j.createdAt || j.bookingDate || new Date().toISOString()
        }));
    },
    getClients: async () => {
        const res = await axiosInstance.get('/user?role=client&perPage=500');
        const users = res.data.data || [];
        return users.map(u => ({
            ...u,
            id: u.UserID || u.id,
            UserID: u.UserID || u.id,
            name: u.name || 'Klien',
            email: u.email || '',
            phone: u.phoneNumber || u.phone || '',
            address: u.address || 'Indonesia',
            photo: u.photo || '',
            joinedAt: u.createdAt,
            status: 'Active'
        }));
    },
    getWorkers: async () => {
        const res = await axiosInstance.get('/worker?perPage=500');
        const workers = res.data.data || [];

        return workers.map(w => {
            const rawStatus = w.status || 'unverified';
            const ktpStatus = rawStatus === 'verified' ? 'Verified' : (rawStatus === 'pending_verification' ? 'Pending' : 'Unverified');
            return {
                ...w,
                id: w.WorkerID,
                WorkerID: w.WorkerID,
                name: w.User?.name || 'Tanpa Nama',
                email: w.User?.email || '',
                phone: w.User?.phoneNumber || '',
                photo: w.User?.photo || '',
                address: w.User?.address || '',
                verified: rawStatus === 'verified',
                ktpStatus: ktpStatus,
                rating: 5.0,
                status: rawStatus,
                skills: (w.Worker_skill || []).map(ws => ({ skillName: ws.Skill?.name }))
            };
        });
    },
    getWorkerVerificationList: async () => {
        try {
            const [verifyRes, workerRes] = await Promise.all([
                axiosInstance.get('/verify?perPage=500').catch(() => ({ data: { data: [] } })),
                axiosInstance.get('/worker?perPage=500').catch(() => ({ data: { data: [] } }))
            ]);

            const verifyList = verifyRes.data?.data || [];
            const workerList = workerRes.data?.data || [];

            // Index verify entries by WorkerID and UserID
            const verifyMap = new Map();
            verifyList.forEach(v => {
                if (v.WorkerID) verifyMap.set(String(v.WorkerID).toLowerCase(), v);
                if (v.Worker?.UserID) verifyMap.set(String(v.Worker.UserID).toLowerCase(), v);
            });

            // Map each worker in Worker table (20 records)
            const result = workerList.map(w => {
                const workerIdKey = String(w.WorkerID || '').toLowerCase();
                const userIdKey = String(w.UserID || '').toLowerCase();
                const v = verifyMap.get(workerIdKey) || verifyMap.get(userIdKey);

                let statusLabel = 'Pending';
                if (v) {
                    const rawStatus = (v.status || '').toLowerCase();
                    statusLabel = (rawStatus === 'accepted' || rawStatus === 'verified') ? 'Verified' : ((rawStatus === 'rejected') ? 'Rejected' : 'Pending');
                } else {
                    const rawStatus = (w.status || '').toLowerCase();
                    statusLabel = (rawStatus === 'verified') ? 'Verified' : ((rawStatus === 'rejected') ? 'Rejected' : 'Pending');
                }

                return {
                    id: w.WorkerID,
                    VerifyID: v ? v.VerifyID : null,
                    WorkerID: w.WorkerID,
                    UserID: w.UserID,
                    name: w.User?.name || w.bankAccount || 'Worker',
                    email: w.User?.email || '',
                    phone: w.User?.phoneNumber || w.bankNumber || '',
                    photo: w.User?.photo || v?.ktpPhoto || '',
                    ktpPhoto: v?.ktpPhoto || '',
                    selfiePhoto: v?.selfiePhoto || '',
                    status: statusLabel,
                    ktpStatus: statusLabel,
                    submittedAt: v?.submittedAt ? String(v.submittedAt).slice(0, 10) : (w.createdAt ? String(w.createdAt).slice(0, 10) : 'Hari ini')
                };
            });

            return result;
        } catch (err) {
            console.error("getWorkerVerificationList error:", err);
            return [];
        }
    },
    getPendingWorkers: async () => {
        const res = await axiosInstance.get('/verify?perPage=500').catch(() => ({ data: { data: [] } }));
        return res.data?.data || [];
    },
    verifyWorker: async (verifyIdOrWorkerId, status) => {
        const mappedStatus = (status === 'Verified' || status === 'accepted') ? 'accepted' : 'rejected';
        try {
            const res = await axiosInstance.patch(`/verify/handle/${verifyIdOrWorkerId}`, { status: mappedStatus });
            return res.data;
        } catch (err) {
            const workerStatus = mappedStatus === 'accepted' ? 'verified' : 'unverified';
            const res = await axiosInstance.patch(`/worker/${verifyIdOrWorkerId}`, { status: workerStatus });
            return res.data;
        }
    },

    getReports: async () => {
        try {
            const res = await axiosInstance.get('/reports');
            return res.data?.data || [];
        } catch (err) {
            console.error("getReports error:", err);
            return [];
        }
    },
    getReportDetail: async (reportId) => {
        try {
            const res = await axiosInstance.get(`/reports/${reportId}`);
            return res.data?.data || null;
        } catch (err) {
            console.error("getReportDetail error:", err);
            return null;
        }
    },
    resolveReport: async (reportId) => {
        const res = await axiosInstance.patch(`/reports/${reportId}/resolve`);
        return res.data;
    },

    getPanicAlerts: async () => {
        const res = await axiosInstance.get('/panic');
        const panics = res.data.data || [];
        return panics.map(p => ({
            PanicID: p.PanicID,
            JobID: p.JobID,
            workerName: p.Job?.Worker?.User?.name || 'Worker',
            workerPhoto: p.Job?.Worker?.User?.photo || '',
            clientName: p.Job?.Client?.name || 'Client',
            address: p.Job?.Client?.address || 'Lokasi Pekerjaan',
            createdAt: p.createdAt || new Date().toISOString(),
            status: p.status || 'Active',
            longitude: Number(p.longitude || 106.8456),
            latitude: Number(p.latitude || -6.2088)
        }));
    },
    getPanicDetail: async (panicId) => {
        const res = await axiosInstance.get(`/panic/${panicId}`);
        const data = res.data.data || res.data;
        return {
            PanicID: data.PanicID,
            JobID: data.JobID,
            worker: {
                id: data.Job?.Worker?.WorkerID,
                name: data.Job?.Worker?.User?.name || 'Worker',
                photo: data.Job?.Worker?.User?.photo || ''
            },
            phone: data.Job?.Worker?.User?.phoneNumber || 'N/A',
            latitude: Number(data.latitude || -6.2088),
            longitude: Number(data.longitude || 106.8456),
            job: {
                JobID: data.JobID,
                jobId: data.JobID,
                service: data.Job?.comment || 'Pekerjaan Jasa',
                clientName: data.Job?.Client?.name || 'Client',
                address: data.Job?.Client?.address || 'Alamat Client'
            },
            createdAt: data.createdAt || new Date().toISOString(),
            status: data.status || 'Active'
        };
    },
    resolvePanic: async (panicId) => {
        const res = await axiosInstance.patch(`/panic/${panicId}`, { status: 'resolved' });
        return res.data;
    },
    getEscrowList: async () => {
        const res = await axiosInstance.get('/payment');
        const payments = res.data.data || [];
        return payments.map(p => {
            const job = p.Job || {};
            const client = job.Client || {};
            const worker = job.Worker || {};
            const workerUser = worker.User || {};

            const totalPrice = Number(p.amount || 0);
            const platformFee = Number(p.platformFee || (p.status === 'released' ? Math.round(totalPrice * 0.10) : 0));
            const workerAmount = Number(p.workerAmount || (p.status === 'released' ? (totalPrice - platformFee) : 0));

            return {
                PaymentID: p.PaymentID,
                Payment: p,
                amount: totalPrice,
                price: totalPrice,
                platformFee,
                workerAmount,
                status: p.status || 'pending',
                escrowStatus: p.status === 'released' ? 'Released' : p.status === 'refunded' ? 'Refunded' : 'Holding',
                createdAt: p.createdAt || '',
                releasedAt: p.releasedAt || null,
                snapToken: p.snapToken,
                jobId: job.JobID || '-',
                title: job.comment || 'Pekerjaan Jasa',
                clientId: client.UserID || job.ClientID || '-',
                clientName: client.name || 'Client',
                workerId: worker.WorkerID || job.WorkerID || '-',
                workerName: workerUser.name || 'Worker'
            };
        });
    },
    approvePayment: async (paymentId) => {
        const res = await axiosInstance.patch(`/payment/${paymentId}`, { status: 'holding' });
        return res.data;
    },
    rejectPayment: async (paymentId) => {
        const res = await axiosInstance.patch(`/payment/${paymentId}`, { status: 'rejected' });
        return res.data;
    },
    releaseEscrow: async (paymentId) => {
        const res = await axiosInstance.patch(`/payment/${paymentId}`, { status: 'released', releasedAt: new Date().toISOString() });
        return res.data;
    },
    refundEscrow: async (paymentId) => {
        const res = await axiosInstance.patch(`/payment/${paymentId}`, { status: 'refunded' });
        return res.data;
    },
    getWithdrawalRequests: async () => {
        let backendList = [];
        try {
            const res = await axiosInstance.get('/worker/withdraw/list');
            backendList = res.data?.data || [];
        } catch (err) {
            console.error("Error fetching withdrawal requests:", err);
        }

        let localList = [];
        try {
            localList = JSON.parse(localStorage.getItem('ki_withdrawals')) || [];
        } catch (e) {}

        const allRaw = [...backendList, ...localList];
        const unique = [];
        const seen = new Set();

        for (const w of allRaw) {
            const id = w.WithdrawalID || w.id || w._id;
            if (id && !seen.has(id)) {
                seen.add(id);
                unique.push(w);
            }
        }

        return unique;
    },
    approveWithdrawal: async (id) => {
        let resData = null;
        try {
            const res = await axiosInstance.patch(`/worker/withdraw/approve/${id}`);
            resData = res.data;
        } catch (e) {
            console.warn("Backend approveWithdrawal notice:", e.message);
        }
        try {
            const localList = JSON.parse(localStorage.getItem('ki_withdrawals')) || [];
            let updated = false;
            localList.forEach((w, idx) => {
                const wId = w.WithdrawalID || w.id;
                if (wId === id || (resData?.data?.amount && Number(w.amount) === Number(resData.data.amount))) {
                    localList[idx].status = 'COMPLETED';
                    updated = true;
                }
            });
            if (updated) {
                localStorage.setItem('ki_withdrawals', JSON.stringify(localList));
            }
        } catch (e) {}
        return resData || { message: 'Berhasil menyetujui penarikan' };
    },
    rejectWithdrawal: async (id) => {
        let resData = null;
        try {
            const res = await axiosInstance.patch(`/worker/withdraw/reject/${id}`);
            resData = res.data;
        } catch (e) {
            console.warn("Backend rejectWithdrawal notice:", e.message);
        }
        try {
            const localList = JSON.parse(localStorage.getItem('ki_withdrawals')) || [];
            let updated = false;
            localList.forEach((w, idx) => {
                const wId = w.WithdrawalID || w.id;
                if (wId === id || (resData?.data?.amount && Number(w.amount) === Number(resData.data.amount))) {
                    localList[idx].status = 'REJECTED';
                    updated = true;
                }
            });
            if (updated) {
                localStorage.setItem('ki_withdrawals', JSON.stringify(localList));
            }
        } catch (e) {}
        return resData || { message: 'Berhasil menolak penarikan' };
    },
    getCategories: async () => {
        const res = await axiosInstance.get('/category');
        const categories = res.data.data || [];
        return categories.map(cat => ({
            ...cat,
            id: cat.CategoryID,
            CategoryID: cat.CategoryID,
            name: cat.name,
            skills: (cat.skills || []).map(sk => ({
                ...sk,
                id: sk.SkillID,
                SkillID: sk.SkillID,
                name: sk.name,
                CategoryID: cat.CategoryID
            }))
        }));
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
        return res.data.data || [];
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
