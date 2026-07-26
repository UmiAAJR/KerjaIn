import axiosInstance from './axiosInstance';

const getData = (key) => JSON.parse(localStorage.getItem(key));
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const mockClientApi = {
    getDashboard: async () => {
        const client = getData('ki_client_profile');
        const workers = getData('ki_workers') || [];
        const activeWorkers = workers.filter(w => w.status === 'Available');
        const categories = getData('ki_categories') || [];
        const notifs = getData('ki_notifications') || [];
        const unreadNotifs = notifs.filter(n => n.userId === 'client-1' && !n.isRead);

        return {
            client,
            location: {
                latitude: client?.latitude || -6.2088,
                longitude: client?.longitude || 106.8456,
                address: client?.address || 'Jakarta Selatan'
            },
            categories,
            recommendedWorkers: activeWorkers.slice(0, 3),
            unreadNotification: unreadNotifs.length
        };
    },

    searchWorkers: async (keyword = '', rating = 0, radius = 10, category = '') => {
        let workers = getData('ki_workers') || [];

        if (keyword) {
            const kw = keyword.toLowerCase();
            workers = workers.filter(w =>
                w.name.toLowerCase().includes(kw) ||
                w.skills.some(s => s.skillName.toLowerCase().includes(kw))
            );
        }

        if (category) {
            const cat = category.toLowerCase();
            workers = workers.filter(w =>
                w.skills.some(s => s.skillName.toLowerCase().includes(cat)) ||
                (w.description && w.description.toLowerCase().includes(cat))
            );
        }

        if (rating > 0) {
            workers = workers.filter(w => w.rating >= rating);
        }

        workers = workers.filter(w => w.distance <= radius);
        return workers;
    },

    getWorkerDetail: async (id) => {
        const workers = getData('ki_workers') || [];
        const worker = workers.find(w => w.id === id);
        if (!worker) throw new Error('Worker tidak ditemukan');
        return worker;
    },

    createBooking: async (workerId, tanggal, jam, alamat, deskripsi, estimasiHarga) => {
        const jobs = getData('ki_jobs') || [];
        const workers = getData('ki_workers') || [];
        const worker = workers.find(w => w.id === workerId);

        if (!worker) throw new Error('Worker tidak ditemukan');

        const newJob = {
            jobId: `job-${Date.now()}`,
            workerId: worker.id,
            workerName: worker.name,
            workerPhoto: worker.photo,
            clientId: 'client-1',
            clientName: getData('ki_client_profile')?.name || 'Budi Santoso',
            clientPhone: getData('ki_client_profile')?.phone || '081234567890',
            clientPhoto: getData('ki_client_profile')?.photo || '',
            service: worker.skills[0]?.skillName || 'Layanan Umum',
            jobCategory: 'Buruh Harian',
            date: tanggal,
            schedule: `${tanggal} ${jam}`,
            startedAt: null,
            finishedAt: null,
            price: Number(estimasiHarga),
            status: 'WAITING_PAYMENT',
            escrowStatus: 'Holding',
            address: alamat,
            description: deskripsi,
            rating: 0,
            comment: '',
            eta: '15 mins',
            currentLatitude: worker.latitude,
            currentLongtitude: worker.longitude,
            emergencyPhone: '112',
            panicEnabled: false
        };

        jobs.push(newJob);
        setData('ki_jobs', jobs);

        const notifs = getData('ki_notifications') || [];
        notifs.push({
            notificationId: `notif-${Date.now()}-c`,
            userId: 'client-1',
            title: 'Pemesanan Dibuat',
            description: `Silakan selesaikan pembayaran untuk pekerjaan ${newJob.service}.`,
            type: 'booking',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/client/tracking/${newJob.jobId}`
        });
        setData('ki_notifications', notifs);

        return newJob;
    },

    createEscrowPayment: async (jobId, totalPembayaran, metodePembayaran) => {
        if (metodePembayaran) {
            console.log("Mock payment method used:", metodePembayaran);
        }
        const jobs = getData('ki_jobs') || [];
        const jobIdx = jobs.findIndex(j => j.jobId === jobId);

        if (jobIdx === -1) throw new Error('Pekerjaan tidak ditemukan');

        jobs[jobIdx].status = 'ESCROW_PAID';
        jobs[jobIdx].escrowStatus = 'Holding';
        setData('ki_jobs', jobs);

        const notifs = getData('ki_notifications') || [];
        notifs.push({
            notificationId: `notif-${Date.now()}`,
            userId: 'client-1',
            title: 'Escrow Berhasil Dibayar',
            description: `Dana Rp${totalPembayaran.toLocaleString('id-ID')} disimpan di rekening penampung.`,
            type: 'payment',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/client/tracking/${jobId}`
        });
        notifs.push({
            notificationId: `notif-${Date.now()}-w`,
            userId: jobs[jobIdx].workerId,
            title: 'Pekerjaan Baru Siap',
            description: `Pekerjaan ${jobs[jobIdx].service} telah dibayar oleh Client. Silakan terima pekerjaan.`,
            type: 'booking',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/worker/activity`
        });
        setData('ki_notifications', notifs);

        return jobs[jobIdx];
    },

    getJobTracking: async (jobId) => {
        const jobs = getData('ki_jobs') || [];
        const job = jobs.find(j => j.jobId === jobId);
        if (!job) throw new Error('Pekerjaan tidak ditemukan');

        const worker = (getData('ki_workers') || []).find(w => w.id === job.workerId);

        return {
            jobId: job.jobId,
            status: job.status,
            bookingDate: job.date,
            schedule: job.schedule,
            startedAt: job.startedAt,
            finishedAt: job.finishedAt,
            worker: {
                workerName: job.workerName,
                phone: worker?.phone || 'N/A',
                rating: worker?.rating || 5.0,
                currentLatitude: job.currentLatitude,
                currentLongtitude: job.currentLongtitude,
                eta: job.eta
            },
            smartWage: {
                recommendedPrice: job.price
            },
            panic: {
                enabled: job.panicEnabled,
                emergencyPhone: job.emergencyPhone
            },
            progress: [
                'WAITING_PAYMENT',
                'ESCROW_PAID',
                'WORKER_ACCEPTED',
                'ON_THE_WAY',
                'IN_PROGRESS',
                'WAITING_CONFIRMATION',
                'COMPLETED',
                'CANCELLED'
            ]
        };
    },

    submitReview: async (jobId, rating, comment, photo = null) => {
        if (photo) {
            console.log("Mock review photo attached:", photo);
        }
        const jobs = getData('ki_jobs') || [];
        const jobIdx = jobs.findIndex(j => j.jobId === jobId);
        if (jobIdx === -1) throw new Error('Pekerjaan tidak ditemukan');

        jobs[jobIdx].rating = Number(rating);
        jobs[jobIdx].comment = comment;
        jobs[jobIdx].status = 'COMPLETED';
        jobs[jobIdx].escrowStatus = 'Released';
        setData('ki_jobs', jobs);

        const workers = getData('ki_workers') || [];
        const workerIdx = workers.findIndex(w => w.id === jobs[jobIdx].workerId);
        if (workerIdx !== -1) {
            const newReview = {
                id: `rev-${Date.now()}`,
                clientName: jobs[jobIdx].clientName,
                rating: Number(rating),
                comment,
                date: new Date().toISOString().slice(0, 10)
            };
            workers[workerIdx].reviews.push(newReview);

            const totalReviews = workers[workerIdx].reviews.length;
            const sum = workers[workerIdx].reviews.reduce((acc, curr) => acc + curr.rating, 0);
            workers[workerIdx].rating = parseFloat((sum / totalReviews).toFixed(1));
            workers[workerIdx].jobsDone += 1;
            workers[workerIdx].status = 'Available';
            setData('ki_workers', workers);
        }

        const notifs = getData('ki_notifications') || [];
        notifs.push({
            notificationId: `notif-${Date.now()}`,
            userId: jobs[jobIdx].workerId,
            title: 'Review Masuk!',
            description: `Client memberi rating ${rating} bintang untuk pekerjaan Anda.`,
            type: 'system',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/worker/history`
        });
        setData('ki_notifications', notifs);

        return jobs[jobIdx];
    },

    submitReport: async (jobId, category, description, attachment) => {
        const reports = getData('ki_reports') || [];
        const jobs = getData('ki_jobs') || [];
        const job = jobs.find(j => j.jobId === jobId);

        const newReport = {
            reportId: `rep-${Date.now()}`,
            reporterName: getData('ki_client_profile')?.name || 'Client',
            reportedWorkerName: job ? job.workerName : 'Unknown Worker',
            reportedWorkerId: job ? job.workerId : 'unknown',
            category,
            status: 'Pending',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            description,
            attachment: attachment || 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=400',
            timeline: [
                { time: new Date().toISOString().replace('T', ' ').slice(0, 16), title: 'Laporan Diajukan oleh Client' }
            ]
        };

        reports.push(newReport);
        setData('ki_reports', reports);
        return newReport;
    },

    getHistory: async () => {
        const jobs = getData('ki_jobs') || [];
        return jobs.filter(j => j.clientId === 'client-1');
    },

    getNotifications: async () => {
        const notifs = getData('ki_notifications') || [];
        return notifs.filter(n => n.userId === 'client-1');
    },

    getProfile: async () => {
        return getData('ki_client_profile');
    },

    updateProfile: async (profileData) => {
        const current = getData('ki_client_profile');
        const updated = { ...current, ...profileData };
        setData('ki_client_profile', updated);
        return updated;
    }
};

const realClientApi = {
    getDashboard: async () => {
        const res = await axiosInstance.get('/client/dashboard');
        return res.data;
    },
    searchWorkers: async (keyword = '', rating = 0, radius = 10, category = '') => {
        const res = await axiosInstance.get('/client/workers', {
            params: { keyword, rating, radius, category }
        });
        return res.data;
    },
    getWorkerDetail: async (id) => {
        const res = await axiosInstance.get(`/client/workers/${id}`);
        return res.data;
    },
    createBooking: async (workerId, tanggal, jam, alamat, deskripsi, estimasiHarga) => {
        const res = await axiosInstance.post('/client/bookings', {
            workerId,
            bookingDate: tanggal,
            schedule: jam,
            address: alamat,
            description: deskripsi,
            estimatedPrice: Number(estimasiHarga)
        });
        return res.data;
    },
    createEscrowPayment: async (jobId, totalPembayaran, metodePembayaran) => {
        const res = await axiosInstance.post(`/client/jobs/${jobId}/payment`, {
            amount: Number(totalPembayaran),
            paymentMethod: metodePembayaran
        });
        return res.data;
    },
    getJobTracking: async (jobId) => {
        const res = await axiosInstance.get(`/client/jobs/${jobId}/tracking`);
        return res.data;
    },
    submitReview: async (jobId, rating, comment, photo = null) => {
        const res = await axiosInstance.post(`/client/jobs/${jobId}/review`, {
            rating: Number(rating),
            comment,
            photo
        });
        return res.data;
    },
    submitReport: async (jobId, category, description, attachment) => {
        const res = await axiosInstance.post(`/client/jobs/${jobId}/report`, {
            category,
            description,
            attachment
        });
        return res.data;
    },
    getHistory: async () => {
        const res = await axiosInstance.get('/client/history');
        return res.data;
    },
    getNotifications: async () => {
        const res = await axiosInstance.get('/client/notifications');
        return res.data;
    },
    getProfile: async () => {
        const res = await axiosInstance.get('/client/profile');
        return res.data;
    },
    updateProfile: async (profileData) => {
        const res = await axiosInstance.put('/client/profile', profileData);
        return res.data;
    }
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const clientApi = USE_MOCK ? mockClientApi : realClientApi;
