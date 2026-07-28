import axiosInstance from './axiosInstance';

const getData = (key) => JSON.parse(localStorage.getItem(key));
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const mockWorkerApi = {
    getDashboard: async (workerId) => {
        const workers = getData('ki_workers') || [];
        const worker = workers.find(w => w.id === workerId);
        if (!worker) throw new Error('Worker tidak ditemukan');

        const jobs = (getData('ki_jobs') || []).filter(j => j.workerId === workerId);

        const finishedJobs = jobs.filter(j => j.status === 'COMPLETED' && j.escrowStatus === 'Released');
        const today = new Date().toISOString().slice(0, 10);
        const todayIncome = finishedJobs.filter(j => j.date === today).reduce((acc, curr) => acc + curr.price, 0);
        const totalIncome = finishedJobs.reduce((acc, curr) => acc + curr.price, 0);

        const activeOrder = jobs.filter(j => ['WORKER_ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'WAITING_CONFIRMATION'].includes(j.status)).length;
        const pendingOrder = jobs.filter(j => j.status === 'WAITING_PAYMENT' || j.status === 'ESCROW_PAID').length;
        const completeOrder = finishedJobs.length;

        const nextJob = jobs.find(j => ['WAITING_PAYMENT', 'ESCROW_PAID', 'WORKER_ACCEPTED'].includes(j.status));

        return {
            photo: worker.photo,
            name: worker.name,
            rating: worker.rating,
            status: worker.status,
            income: {
                todayIncome,
                weeklyIncome: totalIncome * 0.7,
                monthlyIncome: totalIncome * 0.9,
                walletBalance: totalIncome
            },
            order: {
                activeOrder,
                pendingOrder,
                completeOrder
            },
            nextJob: nextJob ? {
                clientName: nextJob.clientName,
                service: nextJob.service,
                schedule: nextJob.schedule,
                location: nextJob.address
            } : null
        };
    },

    getProfile: async (workerId) => {
        const workers = getData('ki_workers') || [];
        const worker = workers.find(w => w.id === workerId);
        if (!worker) throw new Error('Worker tidak ditemukan');
        return worker;
    },

    updateProfile: async (workerId, profileData) => {
        const workers = getData('ki_workers') || [];
        const idx = workers.findIndex(w => w.id === workerId);
        if (idx === -1) throw new Error('Worker tidak ditemukan');

        workers[idx] = { ...workers[idx], ...profileData };
        setData('ki_workers', workers);
        return workers[idx];
    },

    getWallet: async (workerId) => {
        const jobs = (getData('ki_jobs') || []).filter(j => j.workerId === workerId && j.status === 'COMPLETED' && j.escrowStatus === 'Released');
        const totalIncome = jobs.reduce((acc, curr) => acc + curr.price, 0);

        const txs = jobs.map(j => ({
            transactionId: `tx-${j.jobId}`,
            type: 'Job Income',
            amount: j.price,
            status: 'Completed',
            createdAt: j.finishedAt || j.date
        }));

        return {
            summary: {
                balance: totalIncome,
                totalIncome,
                weeklyIncome: totalIncome * 0.7,
                monthlyIncome: totalIncome * 0.9,
                withDrawable: totalIncome > 100000 ? totalIncome - 20000 : totalIncome
            },
            transactions: txs
        };
    },

    withdraw: async (workerId, amount) => {
        const notifs = getData('ki_notifications') || [];
        notifs.push({
            notificationId: `notif-${Date.now()}`,
            userId: workerId,
            title: 'Penarikan Saldo Berhasil',
            description: `Dana sebesar Rp${amount.toLocaleString('id-ID')} telah dikirim ke rekening terdaftar Anda.`,
            type: 'payment',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/worker/wallet`
        });
        setData('ki_notifications', notifs);
        return { success: true, newBalance: 0 };
    },

    getActiveJobs: async (workerId) => {
        const jobs = getData('ki_jobs') || [];
        return jobs.filter(j => j.workerId === workerId && !['COMPLETED', 'CANCELLED'].includes(j.status));
    },

    getJobDetail: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const job = jobs.find(j => j.jobId === jobId);
        if (!job) throw new Error('Job tidak ditemukan');
        return job;
    },

    acceptBooking: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].status = 'WORKER_ACCEPTED';
        setData('ki_jobs', jobs);

        const workers = getData('ki_workers') || [];
        const wIdx = workers.findIndex(w => w.id === jobs[idx].workerId);
        if (wIdx !== -1) {
            workers[wIdx].status = 'Busy';
            setData('ki_workers', workers);
        }

        const notifs = getData('ki_notifications') || [];
        notifs.push({
            notificationId: `notif-${Date.now()}`,
            userId: jobs[idx].clientId,
            title: 'Pekerjaan Diterima!',
            description: `${jobs[idx].workerName} telah menerima pekerjaan Anda.`,
            type: 'booking',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/client/tracking/${jobId}`
        });
        setData('ki_notifications', notifs);

        return jobs[idx];
    },

    rejectBooking: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].status = 'CANCELLED';
        setData('ki_jobs', jobs);

        const notifs = getData('ki_notifications') || [];
        notifs.push({
            notificationId: `notif-${Date.now()}`,
            userId: jobs[idx].clientId,
            title: 'Pekerjaan Ditolak/Dibatalkan',
            description: `Maaf, ${jobs[idx].workerName} menolak/membatalkan pekerjaan Anda. Silakan cari worker lain.`,
            type: 'booking',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/client/search`
        });
        setData('ki_notifications', notifs);

        return jobs[idx];
    },

    updateOnTheWay: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].status = 'ON_THE_WAY';
        setData('ki_jobs', jobs);

        const notifs = getData('ki_notifications') || [];
        notifs.push({
            notificationId: `notif-${Date.now()}`,
            userId: jobs[idx].clientId,
            title: 'Pekerja Sedang ke Lokasi',
            description: `${jobs[idx].workerName} sedang dalam perjalanan ke lokasi Anda.`,
            type: 'booking',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/client/tracking/${jobId}`
        });
        setData('ki_notifications', notifs);

        return jobs[idx];
    },

    startJob: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].status = 'IN_PROGRESS';
        jobs[idx].startedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
        setData('ki_jobs', jobs);

        const notifs = getData('ki_notifications') || [];
        notifs.push({
            notificationId: `notif-${Date.now()}`,
            userId: jobs[idx].clientId,
            title: 'Pekerjaan Mulai Dikerjakan',
            description: `${jobs[idx].workerName} telah memulai pekerjaan "${jobs[idx].service}".`,
            type: 'booking',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/client/tracking/${jobId}`
        });
        setData('ki_notifications', notifs);

        return jobs[idx];
    },

    finishJob: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].status = 'WAITING_CONFIRMATION';
        jobs[idx].finishedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
        setData('ki_jobs', jobs);

        const notifs = getData('ki_notifications') || [];
        notifs.push({
            notificationId: `notif-${Date.now()}`,
            userId: jobs[idx].clientId,
            title: 'Pekerjaan Selesai!',
            description: `${jobs[idx].workerName} melaporkan bahwa pekerjaan telah selesai. Silakan berikan konfirmasi dan review.`,
            type: 'booking',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/client/tracking/${jobId}`
        });
        setData('ki_notifications', notifs);

        return jobs[idx];
    },

    getHistory: async (workerId) => {
        const jobs = getData('ki_jobs') || [];
        return jobs.filter(j => j.workerId === workerId && j.status === 'COMPLETED');
    },

    getNotifications: async (workerId) => {
        const notifs = getData('ki_notifications') || [];
        return notifs.filter(n => n.userId === workerId);
    },

    triggerPanic: async (jobId, isEnabled) => {
        const jobs = getData('ki_jobs') || [];
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].panicEnabled = isEnabled;
        setData('ki_jobs', jobs);

        if (isEnabled) {
            const notifs = getData('ki_notifications') || [];
            notifs.push({
                notificationId: `panic-${Date.now()}`,
                userId: 'admin',
                title: 'ALERT PANIC DARURAT!',
                description: `Pekerja ${jobs[idx].workerName} mengaktifkan tombol panik pada pekerjaan: ${jobs[idx].service}.`,
                type: 'panic',
                createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                isRead: false,
                actionLink: `/admin/panic/${jobs[idx].jobId}`
            });
            setData('ki_notifications', notifs);
        }

        return jobs[idx];
    }
};

const realWorkerApi = {
    getDashboard: async (workerId) => {
        const res = await axiosInstance.get(`/worker/${workerId}`);
        const worker = res.data.data;
        const balance = Number(worker?.balance || 0);
        return {
            photo: worker?.User?.photo || '',
            name: worker?.User?.name || '',
            rating: worker?.rating || 5.0,
            status: worker?.status || 'Available',
            income: {
                todayIncome: 0,
                weeklyIncome: balance * 0.7,
                monthlyIncome: balance * 0.9,
                walletBalance: balance
            },
            order: {
                activeOrder: 0,
                pendingOrder: 0,
                completeOrder: 0
            },
            nextJob: null
        };
    },
    getProfile: async (workerId) => {
        const res = await axiosInstance.get(`/worker/${workerId}`);
        const worker = res.data.data;
        if (worker) {
            return {
                ...worker,
                id: worker.WorkerID,
                name: worker.User?.name || '',
                email: worker.User?.email || '',
                photo: worker.User?.photo || '',
                phone: worker.User?.phoneNumber || '',
                address: worker.User?.address || ''
            };
        }
        return null;
    },
    updateProfile: async (workerId, profileData) => {
        const userData = {};
        if (profileData.name) userData.name = profileData.name;
        if (profileData.phone) userData.phoneNumber = profileData.phone;
        if (profileData.phoneNumber) userData.phoneNumber = profileData.phoneNumber;
        if (profileData.photo) userData.photo = profileData.photo;
        if (profileData.address) userData.address = profileData.address;
        
        if (Object.keys(userData).length > 0) {
            const getRes = await axiosInstance.get(`/worker/${workerId}`);
            const userId = getRes.data.data?.UserID;
            if (userId) {
                await axiosInstance.patch(`/user/update`, userData);
            }
        }

        const workerData = {};
        if (profileData.description) workerData.description = profileData.description;
        if (profileData.status) workerData.status = profileData.status;
        if (profileData.bankNumber) workerData.bankNumber = profileData.bankNumber;
        if (profileData.bankAccount) workerData.bankAccount = profileData.bankAccount;

        if (Object.keys(workerData).length > 0) {
            await axiosInstance.patch(`/worker/${workerId}`, workerData);
        }

        return await realWorkerApi.getProfile(workerId);
    },
    getWallet: async (workerId) => {
        const res = await axiosInstance.get(`/worker/${workerId}`);
        const worker = res.data.data;
        const balance = Number(worker?.balance || 0);
        return {
            summary: {
                balance,
                totalIncome: balance,
                weeklyIncome: balance * 0.7,
                monthlyIncome: balance * 0.9,
                withDrawable: balance
            },
            transactions: []
        };
    },
    withdraw: async (workerId, amount) => {
        const getRes = await axiosInstance.get(`/worker/${workerId}`);
        const currentBalance = Number(getRes.data.data?.balance || 0);
        const newBalance = currentBalance - Number(amount);
        
        await axiosInstance.patch(`/worker/${workerId}`, { balance: newBalance });
        
        await axiosInstance.post('/notification', {
            title: 'Penarikan Saldo Berhasil',
            description: `Dana sebesar Rp${Number(amount).toLocaleString('id-ID')} telah dikirim ke rekening terdaftar Anda.`,
            type: 'payment',
            role: 'worker',
            actionLink: `/worker/wallet`
        });

        return { success: true, newBalance };
    },
    getActiveJobs: async (workerId) => {
        const res = await axiosInstance.get(`/job`, { params: { WorkerID: workerId } });
        const jobs = res.data.data || [];
        return jobs.filter(j => !['COMPLETED', 'CANCELLED'].includes(j.status));
    },
    getJobDetail: async (jobId) => {
        const res = await axiosInstance.get(`/job/${jobId}`);
        return res.data.data;
    },
    acceptBooking: async (jobId) => {
        const res = await axiosInstance.patch(`/job/${jobId}`, { status: 'WORKER_ACCEPTED' });
        return res.data;
    },
    rejectBooking: async (jobId) => {
        const res = await axiosInstance.patch(`/job/${jobId}`, { status: 'WAITING_PAYMENT' });
        return res.data;
    },
    updateOnTheWay: async (jobId) => {
        const res = await axiosInstance.patch(`/job/${jobId}`, { status: 'ON_THE_WAY' });
        return res.data;
    },
    startJob: async (jobId) => {
        const res = await axiosInstance.patch(`/job/${jobId}`, { 
            status: 'IN_PROGRESS', 
            startedAt: new Date().toISOString() 
        });
        return res.data;
    },
    finishJob: async (jobId) => {
        const res = await axiosInstance.patch(`/job/${jobId}`, { 
            status: 'WAITING_CONFIRMATION', 
            finishedAt: new Date().toISOString() 
        });
        return res.data;
    },
    getHistory: async (workerId) => {
        const res = await axiosInstance.get(`/job`, { params: { WorkerID: workerId, status: 'COMPLETED' } });
        return res.data.data || [];
    },
    getNotifications: async (workerId) => {
        const res = await axiosInstance.get(`/notification`, { params: { role: 'worker' } });
        return res.data.data || [];
    },
    triggerPanic: async (jobId, isEnabled) => {
        const res = await axiosInstance.patch(`/job/${jobId}`, { panicEnabled: isEnabled });
        if (isEnabled) {
            const jobRes = await axiosInstance.get(`/job/${jobId}`);
            const job = jobRes.data.data;
            await axiosInstance.post(`/panic`, {
                JobID: jobId,
                latitude: job?.latitude || -6.2088,
                longitude: job?.longitude || 106.8456,
                status: 'Active'
            });
        }
        return res.data;
    }
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const workerApi = USE_MOCK ? mockWorkerApi : realWorkerApi;
