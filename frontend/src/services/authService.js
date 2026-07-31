import axiosInstance from './axiosInstance';

const getData = (key) => JSON.parse(localStorage.getItem(key));
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const mockAuthApi = {
    login: async (email, password) => {
        if (!password) {
            console.warn("Password is required in mock login");
        }
        if (email === 'admin@kerjain.com') {
            return { token: 'admin-token', role: 'admin', user: { name: 'Admin KerjaIn', email } };
        }

        const workers = getData('ki_workers') || [];
        const worker = workers.find(w => w.email === email);
        if (worker) {
            return { token: `worker-token-${worker.id}`, role: 'worker', user: worker };
        }

        const clientProfile = getData('ki_client_profile');
        if (clientProfile && clientProfile.email === email) {
            return { token: 'client-token', role: 'client', user: clientProfile };
        }

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

        return { token: 'client-token', role: 'client', user: clientProfile };
    },

    register: async (name, email, password, role, phoneNumber) => {
        if (role === 'worker') {
            const workers = getData('ki_workers') || [];
            const newWorker = {
                id: `worker-${Date.now()}`,
                name,
                email,
                phone: phoneNumber || '081299998888',
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
                phone: phoneNumber || '081234567890',
                latitude: -6.2088,
                longitude: 106.8456,
                address: 'Jakarta Selatan'
            };
            setData('ki_client_profile', newClient);
            return { token: 'client-token', role: 'client', user: newClient };
        }
    },

    loginWithGoogle: async (idToken, role) => {
        if (!idToken) {
            throw new Error('Token Google tidak valid');
        }
        let name = "Google User";
        let email = "google.user@gmail.com";
        let photo = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150";

        try {
            const parts = idToken.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                if (payload.name) name = payload.name;
                if (payload.email) email = payload.email;
                if (payload.picture) photo = payload.picture;
            }
        } catch (e) {
            console.warn("Failed decoding mock google id token, using defaults", e);
        }

        if (role === 'worker') {
            const workers = getData('ki_workers') || [];
            let worker = workers.find(w => w.email === email);
            if (!worker) {
                worker = {
                    id: `worker-${Date.now()}`,
                    name,
                    email,
                    phone: '081299998888',
                    photo,
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
                    description: 'Worker terdaftar lewat Google.',
                    skills: [],
                    reviews: [],
                    availability: true,
                    bio: 'Halo saya ' + name,
                    bankAccount: 'BCA - 1234567890',
                    ktpStatus: 'Not_Submitted',
                    ktpPhoto: '',
                    selfiePhoto: ''
                };
                workers.push(worker);
                setData('ki_workers', workers);
            }
            return { token: `worker-token-${worker.id}`, role: 'worker', user: worker };
        } else {
            let clientProfile = {
                photo,
                name,
                email,
                phone: '081234567890',
                latitude: -6.2088,
                longitude: 106.8456,
                address: 'Jakarta Selatan'
            };
            setData('ki_client_profile', clientProfile);
            return { token: 'client-token', role: 'client', user: clientProfile };
        }
    }
};

const realAuthApi = {
    login: async (email, password) => {
        const res = await axiosInstance.post('/user/login', { email, password });
        const { token } = res.data;
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const { id, role } = payload;
            localStorage.setItem('ki_token', token);
            const profileRes = await axiosInstance.get(`/user/${id}`);
            const user = profileRes.data.data;
            
            if (role === 'worker' && user) {
                try {
                    const workerRes = await axiosInstance.get('/worker', { params: { UserID: id } });
                    const workerData = workerRes.data.data?.[0];
                    if (workerData) {
                        const workerId = workerData.WorkerID;
                        localStorage.setItem('workerId', workerId);
                        user.WorkerID = workerId;
                    }
                } catch (err) {
                    console.error("Failed to fetch worker ID on login:", err);
                }
            }
            
            return { token, role, user };
        }
        return res.data;
    },
    register: async (name, email, password, role, phoneNumber) => {
        const res = await axiosInstance.post('/user/register', { name, email, password, role, phoneNumber });
        if (res.status === 201 || res.data?.message === "Berhasil membuat akun" || res.status === 200) {
            const loginRes = await realAuthApi.login(email, password);
            if (role === 'worker' && loginRes?.token) {
                try {
                    await axiosInstance.post('/worker', {
                        UserID: loginRes.user.UserID,
                        balance: 0,
                        status: 'Available',
                        description: 'Worker baru terdaftar.'
                    }, {
                        headers: {
                            Authorization: `Bearer ${loginRes.token}`
                        }
                    });
                    
                    const workerRes = await axiosInstance.get('/worker', { params: { UserID: loginRes.user.UserID } });
                    const workerData = workerRes.data.data?.[0];
                    if (workerData) {
                        const workerId = workerData.WorkerID;
                        localStorage.setItem('workerId', workerId);
                        loginRes.user.WorkerID = workerId;
                    }
                } catch (err) {
                    console.error("Auto worker profile initialization failed:", err);
                }
            }
            return loginRes;
        }
        return res.data;
    },
    loginWithGoogle: async (idToken, role) => {
        const res = await axiosInstance.post('/user/google-login', { idToken, role });
        const { token } = res.data;
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const { id, role: decodedRole } = payload;
            localStorage.setItem('ki_token', token);
            const profileRes = await axiosInstance.get(`/user/${id}`);
            const user = profileRes.data.data;
            
            if (decodedRole === 'worker' && user) {
                try {
                    const workerRes = await axiosInstance.get('/worker', { params: { UserID: id } });
                    const workerData = workerRes.data.data?.[0];
                    if (workerData) {
                        const workerId = workerData.WorkerID;
                        localStorage.setItem('workerId', workerId);
                        user.WorkerID = workerId;
                    }
                } catch (err) {
                    console.error("Failed to fetch worker ID on login:", err);
                }
            }
            
            return { token, role: decodedRole, user };
        }
        return res.data;
    }
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const authApi = USE_MOCK ? mockAuthApi : realAuthApi;
