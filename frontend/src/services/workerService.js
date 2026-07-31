import axiosInstance from './axiosInstance';

const getData = (key) => JSON.parse(localStorage.getItem(key));
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const getWorkerHourlyRate = (worker) => {
    const skills = worker.WorkerSkills || worker.Worker_skill || worker.skills || [];
    if (skills.length > 0) {
        const firstSkill = skills[0];
        if (firstSkill && (firstSkill.hourlyRate !== undefined && firstSkill.hourlyRate !== null)) {
            return Number(firstSkill.hourlyRate);
        }
    }
    return 30000; 
};

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

    getWallet: async () => {

        
        const token = localStorage.getItem('ki_token')
        const jobs = (getData('ki_jobs') || []).filter(j => j.workerId === workerId && j.status === 'COMPLETED' && j.escrowStatus === 'Released');
        const totalIncome = jobs.reduce((acc, curr) => acc + curr.price, 0);

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const res = await axiosInstance.get(`/worker/${payload.id}`);
                worker = res.data.data;

                const notifRes = await axiosInstance.get('/notification', { params: { role: 'worker' } });
                const notifications = notifRes.data.data || [];
                unreadNotification = notifications.filter(n => !n.isRead).length;
            } catch (err) {
                console.error("Failed to load client context for dashboard:", err);
            }
        }
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

    updateJobStatus: async (jobId, newStatus) => {
        const s = (newStatus || '').toUpperCase();
        if (s === 'ACCEPTED' || s === 'WORKER_ACCEPTED') {
            return await mockWorkerApi.acceptBooking(jobId);
        } else if (s === 'REJECTED' || s === 'CANCELLED') {
            return await mockWorkerApi.rejectBooking(jobId);
        } else if (s === 'ON_THE_WAY') {
            return await mockWorkerApi.updateOnTheWay(jobId);
        } else if (s === 'IN_PROGRESS') {
            return await mockWorkerApi.startJob(jobId);
        } else if (s === 'COMPLETED' || s === 'WAITING_CONFIRMATION' || s === 'FINISHED') {
            return await mockWorkerApi.finishJob(jobId);
        } else {
            const jobs = getData('ki_jobs') || [];
            const idx = jobs.findIndex(j => j.jobId === jobId);
            if (idx !== -1) {
                jobs[idx].status = newStatus;
                setData('ki_jobs', jobs);
                return jobs[idx];
            }
            throw new Error('Job tidak ditemukan');
        }
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
    },

    getVerification: async (workerId) => {
        const verifs = getData('ki_verifications') || [];
        return verifs.find(v => v.WorkerID === workerId || v.workerId === workerId) || null;
    },

    submitVerification: async (workerId, payload) => {
        const verifs = getData('ki_verifications') || [];
        const newV = {
            VerifyID: `verif-${Date.now()}`,
            WorkerID: workerId,
            ktpPhoto: payload.ktpPhoto,
            selfiePhoto: payload.selfiePhoto,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        verifs.push(newV);
        setData('ki_verifications', verifs);
        return newV;
    }
};

const resolveWorkerId = async (providedId) => {
    const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    
    // First check JWT token if present
    const token = localStorage.getItem('ki_token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.id || payload.UserID;
            if (userId) {
                const res = await axiosInstance.get(`/worker/${userId}`);
                const wObj = res.data?.data;
                if (wObj?.WorkerID) {
                    localStorage.setItem('workerId', wObj.WorkerID);
                    return wObj.WorkerID;
                }
            }
        } catch (e) {
            console.warn("Could not resolve WorkerID from token:", e.message);
        }
    }

    if (isUUID(providedId)) {
        return providedId;
    }
    const storedWorkerId = localStorage.getItem('workerId');
    if (isUUID(storedWorkerId)) {
        return storedWorkerId;
    }

    // Fallback if no token or UUID: fetch worker list from backend
    try {
        const res = await axiosInstance.get('/worker');
        const list = res.data?.data || [];
        if (list.length > 0) {
            const targetWorker = list.find(w => w.User?.name?.includes('Mantap') || Number(w.balance) !== 1000000) || list[0];
            if (targetWorker?.WorkerID) {
                localStorage.setItem('workerId', targetWorker.WorkerID);
                return targetWorker.WorkerID;
            }
        }
    } catch (e) {}

    return providedId;
};

const realWorkerApi = {
    getDashboard: async (workerId) => {
        const resolvedId = await resolveWorkerId(workerId);
        const res = await axiosInstance.get(`/worker/${resolvedId}`);
        const worker = res.data.data;
        const balance = Number(worker?.balance || 0);
        const hourlyRate = getWorkerHourlyRate(worker);
        
        let activeJobs = [];
        try {
            const jobsRes = await axiosInstance.get(`/job`, { params: { WorkerID: worker?.WorkerID || resolvedId } });
            activeJobs = jobsRes.data.data || [];
        } catch (e) {
            console.warn("Failed to fetch worker active jobs for dashboard:", e.message);
        }

        const finishedJobs = activeJobs.filter(j => j.status === 'COMPLETED');
        const activeOrder = activeJobs.filter(j => ['ACCEPTED', 'WORKER_ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'WAIT_CONFIRM', 'WAITING_CONFIRMATION'].includes(j.status)).length;
        const pendingOrder = activeJobs.filter(j => ['WAITING_PAYMENT', 'ESCROW_PAID'].includes(j.status)).length;
        const completeOrder = finishedJobs.length;
        const nextJobData = activeJobs.find(j => ['WAITING_PAYMENT', 'ESCROW_PAID', 'ACCEPTED', 'WORKER_ACCEPTED', 'ON_THE_WAY'].includes(j.status));

        return {
            photo: worker?.User?.photo || '',
            name: worker?.User?.name || '',
            rating: worker?.rating || 5.0,
            status: worker?.status || 'Available',
            hourlyRate,
            income: {
                todayIncome: 0,
                weeklyIncome: balance * 0.7,
                monthlyIncome: balance * 0.9,
                walletBalance: balance
            },
            order: {
                activeOrder,
                pendingOrder,
                completeOrder
            },
            nextJob: nextJobData ? {
                clientName: nextJobData.Client?.name || nextJobData.clientName || 'Pelanggan',
                service: nextJobData.Worker?.Worker_skill?.[0]?.Skill?.name || nextJobData.service || 'Layanan KerjaIn',
                schedule: nextJobData.schedule ? (typeof nextJobData.schedule === 'string' && nextJobData.schedule.includes('T') ? nextJobData.schedule.slice(0, 10) + ' ' + nextJobData.schedule.slice(11, 16) : String(nextJobData.schedule)) : 'Hari Ini',
                location: nextJobData.address || nextJobData.Client?.address || 'Jakarta'
            } : null
        };
    },
    getProfile: async (workerId) => {
        const resolvedId = await resolveWorkerId(workerId);
        const res = await axiosInstance.get(`/worker/${resolvedId}`);
        const worker = res.data.data;
        if (worker) {
            const hourlyRate = getWorkerHourlyRate(worker);
            const skillsList = (worker.Worker_skill || []).map(ws => ({
                WorkerSkillID: ws.WorkerSkillID,
                SkillID: ws.SkillID,
                skillName: ws.Skill?.name,
                name: ws.Skill?.name,
                CategoryID: ws.Skill?.CategoryID,
                categoryName: ws.Skill?.Category?.name
            })).filter(s => s.name);

            const categoryName = skillsList[0]?.categoryName || null;
            const CategoryID = skillsList[0]?.CategoryID || null;

            return {
                ...worker,
                id: worker.WorkerID,
                name: worker.User?.name || '',
                email: worker.User?.email || '',
                photo: worker.User?.photo || '',
                phone: worker.User?.phoneNumber || '',
                address: worker.User?.address || '',
                hourlyRate,
                skills: skillsList,
                categoryName,
                CategoryID
            };
        }
        return null;
    },

    updateProfile: async (workerId, profileData) => {
        const resolvedId = await resolveWorkerId(workerId);
        const userData = {};
        if (profileData.name) userData.name = profileData.name;
        if (profileData.phone) userData.phoneNumber = profileData.phone;
        if (profileData.phoneNumber) userData.phoneNumber = profileData.phoneNumber;
        if (profileData.photo) userData.photo = profileData.photo;
        if (profileData.address) userData.address = profileData.address;
        
        if (Object.keys(userData).length > 0) {
            const getRes = await axiosInstance.get(`/worker/${resolvedId}`);
            const userId = getRes.data.data?.UserID;
            if (userId) {
                await axiosInstance.patch(`/user/update`, userData);
            }

        const workerData = {};
        if (profileData.description) workerData.description = profileData.description;
        if (profileData.bio) workerData.description = profileData.bio;
        if (profileData.status) workerData.status = profileData.status;
        if (profileData.bankNumber) workerData.bankNumber = profileData.bankNumber;
        if (profileData.bankName) workerData.bankName = profileData.bankName;
        if (profileData.bankAccount) workerData.bankAccount = profileData.bankAccount;

        if (Object.keys(workerData).length > 0) {
            await axiosInstance.patch(`/worker/${resolvedId}`, workerData);
        }

        // Sync worker skills (Max 3)
        if (Array.isArray(profileData.skills) && profileData.skills.length > 0) {
            try {
                const allSkillsRes = await axiosInstance.get('/skill').catch(() => null);
                const dbSkills = allSkillsRes?.data?.data || [];
                
                const curWsRes = await axiosInstance.get('/worker-skill', { params: { WorkerID: resolvedId } }).catch(() => null);
                const curWs = curWsRes?.data?.data || [];

                for (const ws of curWs) {
                    if (ws.WorkerSkillID) {
                        await axiosInstance.delete(`/worker-skill/${ws.WorkerSkillID}`).catch(() => {});
                    }
                }

                const selected = profileData.skills.slice(0, 3);
                for (const sk of selected) {
                    const skName = typeof sk === 'string' ? sk : (sk.name || sk.skillName);
                    let skId = typeof sk === 'object' ? (sk.SkillID || sk.id) : null;
                    if (!skId && skName && dbSkills.length > 0) {
                        const match = dbSkills.find(s => s.name.toLowerCase() === skName.toLowerCase());
                        if (match) skId = match.SkillID;
                    }
                    if (skId) {
                        await axiosInstance.post('/worker-skill', {
                            WorkerID: resolvedId,
                            SkillID: skId,
                            hourlyRate: profileData.hourlyRate || 35000
                        }).catch(() => {});
                    }
                }
            } catch (wsErr) {
                console.warn("WorkerSkill sync notice:", wsErr.message);
            }
        }

        return await realWorkerApi.getProfile(resolvedId);
    },

    getWallet: async (workerId) => {
        const resolvedId = await resolveWorkerId(workerId);
        let worker = null;
        let balance = 0;

        try {
            const res = await axiosInstance.get(`/worker/${resolvedId}`);
            worker = res.data?.data;
            balance = Number(worker?.balance || 0);
        } catch (e) {
            console.warn("getWallet worker details notice:", e.message);
        }

        const transactions = [];

        // 1. Fetch Job Incomes (Pemasukan dari Pekerjaan)
        try {
            const jRes = await axiosInstance.get('/job', { params: { WorkerID: resolvedId } });
            const dbJobs = jRes.data?.data || [];

            dbJobs.forEach(j => {
                const s = String(j.status || '').toUpperCase();
                const isCompleted = s === 'COMPLETED';
                const isEscrowOrActive = ['ESCROW_PAID', 'ACTIVE', 'WAITING_CONFIRMATION', 'WAIT_CONFIRM', 'WORKER_ACCEPTED'].includes(s);

                if (isCompleted || isEscrowOrActive) {
                    const amt = Number(j.Payment?.amount || j.price || 0);
                    const clientName = j.Client?.name || j.clientName || 'Pelanggan';
                    const serviceName = j.Worker?.Worker_skill?.[0]?.Skill?.name || j.service || 'Layanan KerjaIn';
                    const jobTitle = isCompleted ? `Pemasukan - ${serviceName}` : `Escrow (Dana Ditahan) - ${serviceName}`;

                    transactions.push({
                        id: `job-${j.JobID || j.id}`,
                        title: jobTitle,
                        description: `Pelanggan: ${clientName}`,
                        type: 'pemasukan',
                        isIncome: true,
                        amount: amt,
                        amountFormatted: `+ Rp ${amt.toLocaleString('id-ID')}`,
                        status: isCompleted ? 'SELESAI' : 'TERTUNDA',
                        date: j.finishedAt ? String(j.finishedAt).slice(0, 10) : (j.bookingDate ? String(j.bookingDate).slice(0, 10) : 'Hari ini'),
                        rawDate: new Date(j.finishedAt || j.bookingDate || j.createdAt || Date.now()).getTime()
                    });
                }
            });
        } catch (jErr) {
            console.warn("Failed to fetch jobs for wallet:", jErr.message);
        }

        // 2. Fetch Withdrawals (Pencairan Saldo)
        try {
            const wRes = await axiosInstance.get('/worker/withdraw');
            const list = wRes.data?.data || [];
            const targetWorkerId = worker?.WorkerID || resolvedId;
            let myWithdrawals = list.filter(w => 
                w.WorkerID === targetWorkerId || 
                w.Worker?.WorkerID === targetWorkerId ||
                w.WorkerID === resolvedId ||
                w.Worker?.UserID === resolvedId ||
                (worker?.UserID && (w.WorkerID === worker.UserID || w.Worker?.UserID === worker.UserID))
            );

            if (myWithdrawals.length === 0 && list.length > 0) {
                myWithdrawals = list;
            }

            myWithdrawals.forEach(w => {
                const wid = w.WithdrawalID || w.id;
                const s = String(w.status || '').toUpperCase();
                const isCompleted = s === 'COMPLETED' || s === 'SELESAI';
                const isRejected = s === 'REJECTED' || s === 'DITOLAK';
                const amt = Number(w.amount || 0);

                // Update local storage status to match DB if present
                try {
                    const localW = JSON.parse(localStorage.getItem('ki_withdrawals')) || [];
                    let updated = false;
                    localW.forEach((lw, idx) => {
                        const lwId = lw.WithdrawalID || lw.id;
                        const lwAmt = Number(lw.amount || 0);
                        if (lwId === wid || (Math.abs(lwAmt - amt) < 1 && (lw.WorkerID === targetWorkerId || lw.workerId === targetWorkerId))) {
                            localW[idx].status = w.status;
                            updated = true;
                        }
                    });
                    if (updated) {
                        localStorage.setItem('ki_withdrawals', JSON.stringify(localW));
                    }
                } catch (e) {}

                transactions.push({
                    id: `w-${wid}`,
                    rawId: wid,
                    title: 'Pencairan Saldo (Withdrawal)',
                    description: `${w.bankName || 'Bank'} ${w.bankNumber || ''}`,
                    type: 'pencairan',
                    isIncome: false,
                    amount: amt,
                    amountFormatted: `- Rp ${amt.toLocaleString('id-ID')}`,
                    status: isCompleted ? 'SELESAI' : (isRejected ? 'DITOLAK' : 'TERTUNDA'),
                    date: w.createdAt ? String(w.createdAt).slice(0, 10) : 'Hari ini',
                    rawDate: new Date(w.createdAt || Date.now()).getTime()
                });
            });
        } catch (wErr) {
            console.warn("Failed to fetch withdrawal history:", wErr.message);
        }

        // 3. Fallback / Merge from localStorage withdrawals ONLY if DB returned no withdrawal transactions
        if (transactions.filter(t => t.type === 'pencairan').length === 0) {
            try {
                const localWithdrawals = JSON.parse(localStorage.getItem('ki_withdrawals')) || [];
                const myLocalW = localWithdrawals.filter(w => w.workerId === resolvedId || w.WorkerID === resolvedId || (worker?.WorkerID && (w.workerId === worker.WorkerID || w.WorkerID === worker.WorkerID)));
                myLocalW.forEach(w => {
                    const rawId = w.WithdrawalID || w.id;
                    const idStr = `lw-${rawId}`;
                    const amt = Number(w.amount || 0);
                    const exists = transactions.some(t => 
                        t.rawId === rawId || 
                        t.id === `w-${rawId}` || 
                        t.id === idStr || 
                        t.id === rawId ||
                        (t.type === 'pencairan' && Math.abs(t.amount - amt) < 1)
                    );
                    if (!exists) {
                        const s = String(w.status || '').toUpperCase();
                        const isCompleted = s === 'COMPLETED' || s === 'SELESAI';
                        const isRejected = s === 'REJECTED' || s === 'DITOLAK';
                        transactions.push({
                            id: idStr,
                            rawId: rawId,
                            title: 'Pencairan Saldo (Withdrawal)',
                            description: `${w.bankName || 'Bank'} ${w.bankNumber || ''}`,
                            type: 'pencairan',
                            isIncome: false,
                            amount: amt,
                            amountFormatted: `- Rp ${amt.toLocaleString('id-ID')}`,
                            status: isCompleted ? 'SELESAI' : (isRejected ? 'DITOLAK' : 'TERTUNDA'),
                            date: w.date || (w.createdAt ? String(w.createdAt).slice(0, 10) : 'Hari ini'),
                            rawDate: new Date(w.createdAt || Date.now()).getTime()
                        });
                    }
                });
            } catch (e) {}
        }

        // Sort descending by rawDate
        transactions.sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0));

        // Compute monthly income from completed jobs
        const completedJobsTotal = transactions
            .filter(t => t.isIncome && t.status === 'SELESAI')
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);

        return {
            balance,
            monthlyIncome: completedJobsTotal || Math.floor(balance * 0.9),
            incomeGrowth: 15,
            trustScore: 98,
            trustLevel: 'Sangat Baik',
            bankAccount: worker?.bankAccount && worker?.bankNumber ? `${worker.bankName || 'BCA'} • ${worker.bankNumber} (a.n ${worker.bankAccount})` : 'Belum Terhubung',
            transactions
        };
    },
    withdraw: async (workerId, amount, bankData = {}) => {
        const resolvedId = await resolveWorkerId(workerId);
        let resData = null;

        try {
            const res = await axiosInstance.post('/worker/withdraw', {
                WorkerID: resolvedId,
                amount: Number(amount),
                bankName: bankData.bankName || 'Bank BCA',
                bankNumber: bankData.bankNumber || '',
                bankAccount: bankData.bankAccount || ''
            });
            resData = res.data;
        } catch (err) {
            console.error("Backend withdrawal POST error:", err);
            const msg = err.response?.data?.message || err.message;
            throw new Error(msg);
        }

        // Save local copy to ki_withdrawals if successful
        if (resData?.data) {
            const wData = resData.data;
            try {
                const localWithdrawals = JSON.parse(localStorage.getItem('ki_withdrawals')) || [];
                localWithdrawals.unshift({
                    id: wData.WithdrawalID || `w-${Date.now()}`,
                    WithdrawalID: wData.WithdrawalID || `w-${Date.now()}`,
                    workerId: resolvedId,
                    WorkerID: resolvedId,
                    amount: Number(amount),
                    bankName: bankData.bankName || 'Bank BCA',
                    bankNumber: bankData.bankNumber || '',
                    bankAccount: bankData.bankAccount || '',
                    status: wData.status || 'PENDING_APPROVAL',
                    date: new Date().toISOString().slice(0, 10),
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem('ki_withdrawals', JSON.stringify(localWithdrawals));
            } catch (e) {}
        }

        return resData || { message: 'Pengajuan penarikan berhasil dikirim' };
    },
    getActiveJobs: async (workerId) => {
        let backendJobs = [];
        try {
            const resolvedId = await resolveWorkerId(workerId);
            if (resolvedId && resolvedId !== 'me' && resolvedId !== 'worker-1') {
                const res = await axiosInstance.get(`/job`, { params: { WorkerID: resolvedId } });
                backendJobs = res.data?.data || [];
            }
        } catch (err) {
            console.warn("Backend GET /job notice:", err.message);
        }

        let localJobs = [];
        try {
            localJobs = JSON.parse(localStorage.getItem('ki_jobs')) || [];
        } catch (e) {}

        const allJobsRaw = [...backendJobs, ...localJobs];
        const uniqueJobs = [];
        const seenIds = new Set();

        for (const j of allJobsRaw) {
            const id = j.JobID || j.jobId || j.id;
            if (id && !seenIds.has(id)) {
                seenIds.add(id);
                uniqueJobs.push(j);
            }
        }

        const mapped = uniqueJobs.map(j => ({
            ...j,
            id: j.JobID || j.jobId || j.id,
            jobId: j.JobID || j.jobId || j.id,
            clientName: j.Client?.name || j.clientName || 'Pelanggan',
            clientAvatar: j.Client?.photo || j.clientAvatar || '',
            service: j.Worker?.Worker_skill?.[0]?.Skill?.name || j.service || 'Layanan KerjaIn',
            address: j.address || j.Client?.address || 'Jakarta',
            schedule: j.schedule ? (typeof j.schedule === 'string' && j.schedule.includes('T') ? j.schedule.slice(0, 10) + ' ' + j.schedule.slice(11, 16) : String(j.schedule)) : (j.bookingDate ? String(j.bookingDate).slice(0, 10) : 'Hari Ini'),
            price: Number(j.Payment?.amount || j.price || j.estimatedPrice || 50000),
            status: j.status
        }));

        return mapped.filter(j => {
            if (!j.status) return true;
            const s = String(j.status).toUpperCase();
            return !['COMPLETED', 'CANCELLED'].includes(s);
        });
    },

    getJobDetail: async (jobId) => {
        const res = await axiosInstance.get(`/job/${jobId}`);
        const j = res.data.data;
        if (j) {
            return {
                ...j,
                id: j.JobID || j.id || j.jobId,
                jobId: j.JobID || j.id || j.jobId,
                clientName: j.Client?.name || j.clientName || 'Pelanggan',
                clientAvatar: j.Client?.photo || j.clientAvatar || '',
                service: j.Worker?.Worker_skill?.[0]?.Skill?.name || j.service || 'Layanan KerjaIn',
                address: j.address || j.Client?.address || 'Jakarta',
                schedule: j.schedule ? (typeof j.schedule === 'string' && j.schedule.includes('T') ? j.schedule.slice(0, 10) + ' ' + j.schedule.slice(11, 16) : String(j.schedule)) : (j.bookingDate ? String(j.bookingDate).slice(0, 10) : 'Hari Ini'),
                price: Number(j.Payment?.amount || j.price || j.estimatedPrice || 50000),
                status: j.status
            };
        }
        return j;
    },
    acceptBooking: async (jobId) => {
        const res = await axiosInstance.patch(`/job/${jobId}`, { status: 'ACCEPTED' });
        return res.data;
    },
    rejectBooking: async (jobId) => {
        const res = await axiosInstance.patch(`/job/${jobId}`, { status: 'CANCELLED' });
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
            status: 'WAIT_CONFIRM', 
            finishedAt: new Date().toISOString() 
        });
        return res.data;
    },
    updateJobStatus: async (jobId, newStatus) => {
        const s = (newStatus || '').toUpperCase();
        if (s === 'ACCEPTED' || s === 'WORKER_ACCEPTED') {
            return await realWorkerApi.acceptBooking(jobId);
        } else if (s === 'REJECTED' || s === 'CANCELLED') {
            return await realWorkerApi.rejectBooking(jobId);
        } else if (s === 'ON_THE_WAY') {
            return await realWorkerApi.updateOnTheWay(jobId);
        } else if (s === 'IN_PROGRESS') {
            return await realWorkerApi.startJob(jobId);
        } else if (s === 'COMPLETED' || s === 'WAITING_CONFIRMATION' || s === 'WAIT_CONFIRM' || s === 'FINISHED') {
            return await realWorkerApi.finishJob(jobId);
        } else {
            const res = await axiosInstance.patch(`/job/${jobId}`, { status: newStatus });
            return res.data;
        }
    },
    getHistory: async (workerId) => {
        const resolvedId = await resolveWorkerId(workerId);
        const res = await axiosInstance.get(`/job`, { params: { WorkerID: resolvedId, status: 'COMPLETED' } });
        const jobs = res.data.data || [];
        return jobs.map(j => ({
            ...j,
            id: j.JobID || j.id || j.jobId,
            jobId: j.JobID || j.id || j.jobId,
            clientName: j.Client?.name || j.clientName || 'Pelanggan',
            clientAvatar: j.Client?.photo || j.clientAvatar || '',
            service: j.Worker?.Worker_skill?.[0]?.Skill?.name || j.service || 'Layanan KerjaIn',
            address: j.address || j.Client?.address || 'Jakarta',
            schedule: j.schedule ? (typeof j.schedule === 'string' && j.schedule.includes('T') ? j.schedule.slice(0, 10) + ' ' + j.schedule.slice(11, 16) : String(j.schedule)) : (j.bookingDate ? String(j.bookingDate).slice(0, 10) : 'Hari Ini'),
            price: Number(j.Payment?.amount || j.price || j.estimatedPrice || 50000),
            status: j.status
        }));
    },
    getNotifications: async (workerId) => {
        const res = await axiosInstance.get(`/notification`, { params: { role: 'worker' } });
        return res.data.data || [];
    },
    getVerification: async (workerId) => {
        const resolvedId = await resolveWorkerId(workerId);
        try {
            const res = await axiosInstance.get(`/verify`, { params: { WorkerID: resolvedId } });
            const list = res.data?.data || [];
            return list.length > 0 ? list[0] : null;
        } catch (e) {
            console.warn("getVerification API warning:", e.message);
            return null;
        }
    },
    submitVerification: async (workerId, payload) => {
        const resolvedId = await resolveWorkerId(workerId);
        const res = await axiosInstance.post('/verify', {
            WorkerID: resolvedId,
            ktpPhoto: payload.ktpPhoto,
            selfiePhoto: payload.selfiePhoto,
            status: 'pending'
        });
        await axiosInstance.patch(`/worker/${resolvedId}`, { status: 'pending_verification' }).catch(() => {});
        return res.data;
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

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const workerApi = USE_MOCK ? mockWorkerApi : realWorkerApi;
