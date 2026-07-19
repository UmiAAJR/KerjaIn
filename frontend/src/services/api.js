import {
    INITIAL_CATEGORIES,
    INITIAL_CLIENT_PROFILE,
    INITIAL_WORKERS,
    INITIAL_JOBS,
    INITIAL_NOTIFICATIONS,
    INITIAL_REPORTS
} from './mockData';

// Helper to initialize LocalStorage db
const initDb = () => {
    if (!localStorage.getItem('ki_categories')) {
        localStorage.setItem('ki_categories', JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem('ki_client_profile')) {
        localStorage.setItem('ki_client_profile', JSON.stringify(INITIAL_CLIENT_PROFILE));
    }
    if (!localStorage.getItem('ki_workers')) {
        localStorage.setItem('ki_workers', JSON.stringify(INITIAL_WORKERS));
    }
    if (!localStorage.getItem('ki_jobs')) {
        localStorage.setItem('ki_jobs', JSON.stringify(INITIAL_JOBS));
    }
    if (!localStorage.getItem('ki_notifications')) {
        localStorage.setItem('ki_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem('ki_reports')) {
        localStorage.setItem('ki_reports', JSON.stringify(INITIAL_REPORTS));
    }
};

initDb();

// Getters and Setters from LocalStorage helper
const getData = (key) => JSON.parse(localStorage.getItem(key));
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// AUTH API SIMULATOR
export const authApi = {
    login: async (email, password) => {
        // Basic verification, client role is default for simplicity
        if (email === 'admin@kerjain.com') {
            return { token: 'admin-token', role: 'admin', user: { name: 'Admin KerjaIn', email } };
        }

        // Check if worker
        const workers = getData('ki_workers');
        const worker = workers.find(w => w.email === email);
        if (worker) {
            return { token: `worker-token-${worker.id}`, role: 'worker', user: worker };
        }

        // Else treat as client
        const clientProfile = getData('ki_client_profile');
        if (clientProfile.email === email) {
            return { token: 'client-token', role: 'client', user: clientProfile };
        }

        // Default simulation logic: if email is worker create/login, if client...
        if (email.includes('worker')) {
            const newWorker = {
                id: `worker-${Date.now()}`,
                name: email.split('@')[0].toUpperCase(),
                email,
                phone: '081299998888',
                photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
                verified: false,
                rating: 5.0,
                status: 'Available',
                experienceYear: 0,
                jobsDone: 0,
                hourlyRate: 30000,
                distance: 1.5,
                latitude: -6.2088,
                longitude: 106.8456,
                address: 'Setiabudi, Jakarta Selatan',
                description: 'Pekerja baru siap melayani.',
                skills: [],
                reviews: [],
                availability: true,
                bio: 'Ready to work!',
                bankAccount: 'BCA - 1234567890',
                ktpStatus: 'Not_Submitted',
                ktpPhoto: '',
                selfiePhoto: ''
            };
            workers.push(newWorker);
            setData('ki_workers', workers);
            return { token: `worker-token-${newWorker.id}`, role: 'worker', user: newWorker };
        }

        // Default Client login
        return { token: 'client-token', role: 'client', user: clientProfile };
    },

    register: async (name, email, password, role) => {
        if (role === 'worker') {
            const workers = getData('ki_workers');
            const newWorker = {
                id: `worker-${Date.now()}`,
                name,
                email,
                phone: '081299998888',
                photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
                verified: false,
                rating: 5.0,
                status: 'Available',
                experienceYear: 0,
                jobsDone: 0,
                hourlyRate: 30000,
                distance: 2.0,
                latitude: -6.2088,
                longitude: 106.8456,
                address: 'Setiabudi, Jakarta Selatan',
                description: 'Worker terdaftar baru.',
                skills: [],
                reviews: [],
                availability: true,
                bio: 'Halo saya ' + name,
                bankAccount: 'BCA - 1234567890',
                ktpStatus: 'Not_Submitted',
                ktpPhoto: '',
                selfiePhoto: ''
            };
            workers.push(newWorker);
            setData('ki_workers', workers);
            return { token: `worker-token-${newWorker.id}`, role: 'worker', user: newWorker };
        } else {
            const newClient = {
                photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
                name,
                email,
                phone: '081234567890',
                latitude: -6.2088,
                longitude: 106.8456,
                address: 'Jakarta Selatan'
            };
            setData('ki_client_profile', newClient);
            return { token: 'client-token', role: 'client', user: newClient };
        }
    }
};

// CLIENT API
export const clientApi = {
    getDashboard: async () => {
        const client = getData('ki_client_profile');
        const workers = getData('ki_workers').filter(w => w.status === 'Available');
        const categories = getData('ki_categories');
        const notifs = getData('ki_notifications').filter(n => n.userId === 'client-1' && !n.isRead);

        return {
            client,
            location: {
                latitude: client.latitude,
                longitude: client.longitude,
                address: client.address
            },
            categories,
            recommendedWorkers: workers.slice(0, 3), // Show first 3 available workers
            unreadNotification: notifs.length
        };
    },

    searchWorkers: async (keyword = '', rating = 0, radius = 10, category = '') => {
        let workers = getData('ki_workers');

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

        // Filter by mockup radius
        workers = workers.filter(w => w.distance <= radius);

        return workers;
    },

    getWorkerDetail: async (id) => {
        const workers = getData('ki_workers');
        const worker = workers.find(w => w.id === id);
        if (!worker) throw new Error('Worker tidak ditemukan');
        return worker;
    },

    createBooking: async (workerId, tanggal, jam, alamat, deskripsi, estimasiHarga) => {
        const jobs = getData('ki_jobs');
        const workers = getData('ki_workers');
        const worker = workers.find(w => w.id === workerId);

        if (!worker) throw new Error('Worker tidak ditemukan');

        const newJob = {
            jobId: `job-${Date.now()}`,
            workerId: worker.id,
            workerName: worker.name,
            workerPhoto: worker.photo,
            clientId: 'client-1',
            clientName: getData('ki_client_profile').name,
            clientPhone: getData('ki_client_profile').phone,
            clientPhoto: getData('ki_client_profile').photo,
            service: worker.skills[0]?.skillName || 'Layanan Umum',
            jobCategory: 'Buruh Harian',
            date: tanggal,
            schedule: `${tanggal} ${jam}`,
            startedAt: null,
            finishedAt: null,
            price: Number(estimasiHarga),
            status: 'Booking', // Initial state
            escrowStatus: 'Holding', // Holding in escrow
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

        // Create notifications for both
        const notifs = getData('ki_notifications');
        notifs.push({
            notificationId: `notif-${Date.now()}-c`,
            userId: 'client-1',
            title: 'Pemesanan Dibuat',
            description: `Menunggu konfirmasi dari ${worker.name}.`,
            type: 'booking',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/client/tracking/${newJob.jobId}`
        });
        notifs.push({
            notificationId: `notif-${Date.now()}-w`,
            userId: worker.id,
            title: 'Booking Baru Masuk',
            description: `Pesanan pekerjaan baru dari ${newJob.clientName}.`,
            type: 'booking',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/worker/activity/${newJob.jobId}`
        });
        setData('ki_notifications', notifs);

        return newJob;
    },

    createEscrowPayment: async (jobId, totalPembayaran, metodePembayaran) => {
        const jobs = getData('ki_jobs');
        const jobIdx = jobs.findIndex(j => j.jobId === jobId);

        if (jobIdx === -1) throw new Error('Pekerjaan tidak ditemukan');

        jobs[jobIdx].status = 'Escrow Paid';
        jobs[jobIdx].escrowStatus = 'Holding';
        setData('ki_jobs', jobs);

        // Add notification
        const notifs = getData('ki_notifications');
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
        setData('ki_notifications', notifs);

        return jobs[jobIdx];
    },

    getJobTracking: async (jobId) => {
        const jobs = getData('ki_jobs');
        const job = jobs.find(j => j.jobId === jobId);
        if (!job) throw new Error('Pekerjaan tidak ditemukan');

        const worker = getData('ki_workers').find(w => w.id === job.workerId);

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
                'Booking',
                'Escrow Paid',
                'Worker Accepted',
                'On The Way',
                'In Progress',
                'Waiting Confirmation',
                'Finished'
            ]
        };
    },

    submitReview: async (jobId, rating, comment, photo = null) => {
        const jobs = getData('ki_jobs');
        const jobIdx = jobs.findIndex(j => j.jobId === jobId);
        if (jobIdx === -1) throw new Error('Pekerjaan tidak ditemukan');

        jobs[jobIdx].rating = Number(rating);
        jobs[jobIdx].comment = comment;
        jobs[jobIdx].status = 'Finished';
        jobs[jobIdx].escrowStatus = 'Released'; // Rilis ke worker
        setData('ki_jobs', jobs);

        // Update worker rating and reviews list
        const workers = getData('ki_workers');
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

            // Calculate new rating average
            const totalReviews = workers[workerIdx].reviews.length;
            const sum = workers[workerIdx].reviews.reduce((acc, curr) => acc + curr.rating, 0);
            workers[workerIdx].rating = parseFloat((sum / totalReviews).toFixed(1));
            workers[workerIdx].jobsDone += 1;
            workers[workerIdx].status = 'Available'; // Free worker up
            setData('ki_workers', workers);
        }

        // Notification to worker
        const notifs = getData('ki_notifications');
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
        const reports = getData('ki_reports');
        const jobs = getData('ki_jobs');
        const job = jobs.find(j => j.jobId === jobId);

        const newReport = {
            reportId: `rep-${Date.now()}`,
            reporterName: getData('ki_client_profile').name,
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
        const jobs = getData('ki_jobs');
        // Filter client-1
        return jobs.filter(j => j.clientId === 'client-1');
    },

    getNotifications: async () => {
        const notifs = getData('ki_notifications');
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

// WORKER API
export const workerApi = {
    getDashboard: async (workerId) => {
        const workers = getData('ki_workers');
        const worker = workers.find(w => w.id === workerId);
        if (!worker) throw new Error('Worker tidak ditemukan');

        const jobs = getData('ki_jobs').filter(j => j.workerId === workerId);

        // Incomes
        const finishedJobs = jobs.filter(j => j.status === 'Finished');
        const today = new Date().toISOString().slice(0, 10);
        const todayIncome = finishedJobs.filter(j => j.date === today).reduce((acc, curr) => acc + curr.price, 0);
        const totalIncome = finishedJobs.reduce((acc, curr) => acc + curr.price, 0);

        const activeOrder = jobs.filter(j => ['Worker Accepted', 'On The Way', 'In Progress'].includes(j.status)).length;
        const pendingOrder = jobs.filter(j => j.status === 'Booking' || j.status === 'Escrow Paid').length;
        const completeOrder = finishedJobs.length;

        const nextJob = jobs.find(j => ['Booking', 'Escrow Paid', 'Worker Accepted'].includes(j.status));

        return {
            photo: worker.photo,
            name: worker.name,
            rating: worker.rating,
            status: worker.status,
            income: {
                todayIncome,
                weeklyIncome: totalIncome * 0.7, // Simulated
                monthlyIncome: totalIncome * 0.9, // Simulated
                walletBalance: totalIncome // Assume balance matches income for mock simplicity
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
        const workers = getData('ki_workers');
        const worker = workers.find(w => w.id === workerId);
        if (!worker) throw new Error('Worker tidak ditemukan');
        return worker;
    },

    updateProfile: async (workerId, profileData) => {
        const workers = getData('ki_workers');
        const idx = workers.findIndex(w => w.id === workerId);
        if (idx === -1) throw new Error('Worker tidak ditemukan');

        workers[idx] = { ...workers[idx], ...profileData };
        setData('ki_workers', workers);
        return workers[idx];
    },

    getWallet: async (workerId) => {
        const jobs = getData('ki_jobs').filter(j => j.workerId === workerId && j.status === 'Finished');
        const totalIncome = jobs.reduce((acc, curr) => acc + curr.price, 0);

        // Mock transactions
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
        // Simulate withdraw, write notification
        const notifs = getData('ki_notifications');
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
        const jobs = getData('ki_jobs');
        return jobs.filter(j => j.workerId === workerId && !['Finished', 'Rejected'].includes(j.status));
    },

    getJobDetail: async (jobId) => {
        const jobs = getData('ki_jobs');
        const job = jobs.find(j => j.jobId === jobId);
        if (!job) throw new Error('Job tidak ditemukan');
        return job;
    },

    acceptBooking: async (jobId) => {
        const jobs = getData('ki_jobs');
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].status = 'Worker Accepted';
        setData('ki_jobs', jobs);

        // Update worker status in db to Busy
        const workers = getData('ki_workers');
        const wIdx = workers.findIndex(w => w.id === jobs[idx].workerId);
        if (wIdx !== -1) {
            workers[wIdx].status = 'Busy';
            setData('ki_workers', workers);
        }

        // Add notif to client
        const notifs = getData('ki_notifications');
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
        const jobs = getData('ki_jobs');
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].status = 'Rejected';
        setData('ki_jobs', jobs);

        // Add notif to client
        const notifs = getData('ki_notifications');
        notifs.push({
            notificationId: `notif-${Date.now()}`,
            userId: jobs[idx].clientId,
            title: 'Pekerjaan Ditolak',
            description: `Maaf, ${jobs[idx].workerName} menolak pekerjaan Anda. Silakan cari worker lain.`,
            type: 'booking',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            isRead: false,
            actionLink: `/client/search`
        });
        setData('ki_notifications', notifs);

        return jobs[idx];
    },

    startJob: async (jobId) => {
        const jobs = getData('ki_jobs');
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].status = 'In Progress';
        jobs[idx].startedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
        setData('ki_jobs', jobs);

        // Notif to client
        const notifs = getData('ki_notifications');
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
        const jobs = getData('ki_jobs');
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].status = 'Waiting Confirmation';
        jobs[idx].finishedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
        setData('ki_jobs', jobs);

        // Notif to client
        const notifs = getData('ki_notifications');
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
        const jobs = getData('ki_jobs');
        return jobs.filter(j => j.workerId === workerId && j.status === 'Finished');
    },

    getNotifications: async (workerId) => {
        const notifs = getData('ki_notifications');
        return notifs.filter(n => n.userId === workerId);
    },

    triggerPanic: async (jobId, isEnabled) => {
        const jobs = getData('ki_jobs');
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].panicEnabled = isEnabled;
        setData('ki_jobs', jobs);

        // If enabled, push alert notification to Admin
        if (isEnabled) {
            const notifs = getData('ki_notifications');
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

// ADMIN API
export const adminApi = {
    getDashboardStats: async () => {
        const workers = getData('ki_workers');
        const jobs = getData('ki_jobs');
        const reports = getData('ki_reports');

        const totalWorker = workers.length;
        const verifiedWorker = workers.filter(w => w.verified).length;
        const pendingWorker = workers.filter(w => w.ktpStatus === 'Pending').length;

        // Client profile mock, let's say client is 1
        const totalClient = 45; // Fixed number + 1 local client

        const activeJob = jobs.filter(j => ['Worker Accepted', 'On The Way', 'In Progress'].includes(j.status)).length;
        const completedJob = jobs.filter(j => j.status === 'Finished').length;

        // Escrows
        const escrowHolding = jobs.filter(j => j.escrowStatus === 'Holding').reduce((acc, curr) => acc + curr.price, 0);
        const escrowReleased = jobs.filter(j => j.escrowStatus === 'Released').reduce((acc, curr) => acc + curr.price, 0);

        const activePanic = jobs.filter(j => j.panicEnabled).length;

        // Revenues (e.g. 10% platform fee)
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
        // Generate some mock clients
        return [
            { userId: 'client-1', name: getData('ki_client_profile').name, role: 'Client', verified: true, phone: getData('ki_client_profile').phone, joinedAt: '2026-06-01', status: 'Active', photo: getData('ki_client_profile').photo },
            { userId: 'client-2', name: 'Ani Yudhoyono', role: 'Client', verified: true, phone: '081299998811', joinedAt: '2026-06-15', status: 'Active', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150' },
            { userId: 'client-3', name: 'Andi Mallarangeng', role: 'Client', verified: false, phone: '081299992222', joinedAt: '2026-07-01', status: 'Suspended', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' }
        ];
    },

    getWorkers: async () => {
        return getData('ki_workers');
    },

    getWorkerVerificationList: async () => {
        const workers = getData('ki_workers');
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
        const workers = getData('ki_workers');
        const idx = workers.findIndex(w => w.id === workerId);
        if (idx === -1) throw new Error('Worker tidak ditemukan');

        workers[idx].ktpStatus = status;
        if (status === 'Verified') {
            workers[idx].verified = true;
        } else {
            workers[idx].verified = false;
        }
        setData('ki_workers', workers);

        // Notify worker
        const notifs = getData('ki_notifications');
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
        return getData('ki_reports');
    },

    getReportDetail: async (reportId) => {
        const reports = getData('ki_reports');
        const report = reports.find(r => r.reportId === reportId);
        if (!report) throw new Error('Laporan tidak ditemukan');

        const worker = getData('ki_workers').find(w => w.id === report.reportedWorkerId);
        const client = getData('ki_client_profile'); // Assume local client reported
        const job = getData('ki_jobs').find(j => j.workerId === report.reportedWorkerId && j.clientName === report.reporterName);

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
        const reports = getData('ki_reports');
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
        const jobs = getData('ki_jobs');
        return jobs.filter(j => j.panicEnabled).map(j => ({
            panicId: `panic-${j.jobId}`,
            jobId: j.jobId,
            workerName: j.workerName,
            workerPhoto: j.workerPhoto,
            createdAt: j.date + ' 10:00', // Mock time
            status: 'Active'
        }));
    },

    getPanicDetail: async (jobId) => {
        const jobs = getData('ki_jobs');
        const job = jobs.find(j => j.jobId === jobId);
        if (!job) throw new Error('Panic detail tidak ditemukan');

        const worker = getData('ki_workers').find(w => w.id === job.workerId);

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
        const jobs = getData('ki_jobs');
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].panicEnabled = false;
        setData('ki_jobs', jobs);
        return { success: true };
    },

    getEscrowList: async () => {
        const jobs = getData('ki_jobs');
        return jobs.map(j => ({
            escrowId: `esc-${j.jobId}`,
            jobId: j.jobId,
            service: j.service,
            worker: j.workerName,
            client: j.clientName,
            amount: j.price,
            status: j.escrowStatus, // Holding, Released, Refunded
            createdAt: j.date + ' 09:00',
            releasedAt: j.escrowStatus === 'Released' ? j.finishedAt || j.date : null
        }));
    },

    releaseEscrow: async (jobId) => {
        const jobs = getData('ki_jobs');
        const idx = jobs.findIndex(j => j.jobId === jobId);
        if (idx === -1) throw new Error('Job tidak ditemukan');

        jobs[idx].escrowStatus = 'Released';
        jobs[idx].status = 'Finished';
        setData('ki_jobs', jobs);
        return jobs[idx];
    },

    getCategories: async () => {
        return getData('ki_categories');
    },

    createCategory: async (nama, icon = 'Layers') => {
        const categories = getData('ki_categories');
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
        let categories = getData('ki_categories');
        categories = categories.filter(c => c.id !== id);
        setData('ki_categories', categories);
        return { success: true };
    }
};
