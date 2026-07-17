// Seed data and initial state of the application
export const INITIAL_CATEGORIES = [
  { id: 'cat-1', nama: 'Buruh Harian', icon: 'Hammer' },
  { id: 'cat-2', nama: 'Asisten Rumah Tangga', icon: 'Home' },
  { id: 'cat-3', nama: 'Montir Panggilan', icon: 'Wrench' },
  { id: 'cat-4', nama: 'Tukang Kayu/Bangunan', icon: 'Construction' },
  { id: 'cat-5', nama: 'Jasa Serabutan', icon: 'Layers' }
];

export const INITIAL_CLIENT_PROFILE = {
  photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  name: 'Budi Santoso',
  email: 'budi.santoso@client.com',
  phone: '081234567890',
  latitude: -6.2088,
  longitude: 106.8456,
  address: 'Jl. Sudirman No. 12, Jakarta Selatan'
};

export const INITIAL_WORKERS = [
  {
    id: 'worker-1',
    name: 'Joko Widodo',
    email: 'joko.widodo@worker.com',
    phone: '089876543210',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    verified: true,
    rating: 4.8,
    status: 'Available', // Available, Busy, Offline
    experienceYear: 5,
    jobsDone: 42,
    hourlyRate: 35000,
    distance: 1.2, // km
    latitude: -6.2120,
    longitude: 106.8400,
    address: 'Karet Kuningan, Jakarta Selatan',
    description: 'Ahli dalam pengerjaan pipa bocor, instalasi listrik rumah tangga, dan perbaikan dinding retak. Kerja cepat dan rapi.',
    skills: [
      { skillId: 'sk-1', skillName: 'Instalasi Listrik', experienceLevel: 'Expert' },
      { skillId: 'sk-2', skillName: 'Plumbing / Pipa Bocor', experienceLevel: 'Expert' },
      { skillId: 'sk-3', skillName: 'Pengecatan Tembok', experienceLevel: 'Intermediate' }
    ],
    reviews: [
      { id: 'rev-1', clientName: 'Siti Rahma', rating: 5, comment: 'Bagus sekali kerjanya cepat selesai!', date: '2026-07-10' },
      { id: 'rev-2', clientName: 'Ahmad Dani', rating: 4, comment: 'Sangat ramah dan tahu betul solusinya.', date: '2026-07-12' }
    ],
    availability: true,
    bio: 'Menyediakan jasa pertukangan dan perbaikan kelistrikan daerah Setiabudi dan sekitarnya.',
    bankAccount: 'BCA - 8291029302',
    ktpStatus: 'Verified', // Not_Submitted, Pending, Verified, Rejected
    ktpPhoto: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=300',
    selfiePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'worker-2',
    name: 'Siti Aminah',
    email: 'siti.aminah@worker.com',
    phone: '085512345678',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    verified: true,
    rating: 4.9,
    status: 'Available',
    experienceYear: 3,
    jobsDone: 89,
    hourlyRate: 25000,
    distance: 0.8,
    latitude: -6.2050,
    longitude: 106.8500,
    address: 'Manggarai, Jakarta Selatan',
    description: 'Spesialis asisten rumah tangga harian, menyetrika, mencuci baju, bersih-bersih rumah, dan memasak masakan rumah tangga.',
    skills: [
      { skillId: 'sk-4', skillName: 'Bersih Rumah Harian', experienceLevel: 'Expert' },
      { skillId: 'sk-5', skillName: 'Menyetrika & Mencuci', experienceLevel: 'Expert' }
    ],
    reviews: [
      { id: 'rev-3', clientName: 'Budi Santoso', rating: 5, comment: 'Sangat bersih dan jujur. Recommended!', date: '2026-07-08' }
    ],
    availability: true,
    bio: 'Siap membantu meringankan pekerjaan rumah tangga Anda dengan teliti dan bersih.',
    bankAccount: 'Mandiri - 1320092839281',
    ktpStatus: 'Verified',
    ktpPhoto: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=300',
    selfiePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'worker-3',
    name: 'Budi Sutrisno',
    email: 'budi.sutrisno@worker.com',
    phone: '081299998888',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    verified: false,
    rating: 4.2,
    status: 'Busy',
    experienceYear: 8,
    jobsDone: 120,
    hourlyRate: 40000,
    distance: 3.5,
    latitude: -6.2200,
    longitude: 106.8300,
    address: 'Kebayoran Baru, Jakarta Selatan',
    description: 'Montir mobil dan motor panggilan berpengalaman. Dapat memperbaiki mogok jalanan, ganti oli, tune-up karburator, dan injeksi.',
    skills: [
      { skillId: 'sk-6', skillName: 'Tune Up Motor & Mobil', experienceLevel: 'Expert' },
      { skillId: 'sk-7', skillName: 'Instalasi Aki & Kelistrikan Motor', experienceLevel: 'Expert' }
    ],
    reviews: [
      { id: 'rev-4', clientName: 'Andi Wijaya', rating: 4, comment: 'Datang tepat waktu dan motor kembali normal.', date: '2026-07-02' }
    ],
    availability: false,
    bio: 'Menawarkan jasa mekanik darurat panggilan 24 jam.',
    bankAccount: 'BNI - 0987654321',
    ktpStatus: 'Pending',
    ktpPhoto: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=300',
    selfiePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'worker-4',
    name: 'Rian Hidayat',
    email: 'rian.hidayat@worker.com',
    phone: '087788881111',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    verified: false,
    rating: 4.5,
    status: 'Available',
    experienceYear: 1,
    jobsDone: 5,
    hourlyRate: 30000,
    distance: 2.1,
    latitude: -6.2150,
    longitude: 106.8600,
    address: 'Tebet, Jakarta Selatan',
    description: 'Menerima segala macam pekerjaan serabutan harian seperti memotong rumput halaman, memindahkan barang, dan membersihkan selokan.',
    skills: [
      { skillId: 'sk-8', skillName: 'Potong Rumput', experienceLevel: 'Intermediate' },
      { skillId: 'sk-9', skillName: 'Angkat Barang Berat', experienceLevel: 'Intermediate' }
    ],
    reviews: [],
    availability: true,
    bio: 'Siap mengerjakan pekerjaan fisik harian apa saja daerah Tebet.',
    bankAccount: 'Mandiri - 1320092839282',
    ktpStatus: 'Not_Submitted',
    ktpPhoto: '',
    selfiePhoto: ''
  }
];

export const INITIAL_JOBS = [
  {
    jobId: 'job-101',
    workerId: 'worker-1',
    workerName: 'Joko Widodo',
    workerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    clientId: 'client-1',
    clientName: 'Budi Santoso',
    clientPhone: '081234567890',
    clientPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    service: 'Perbaikan Pipa Bocor',
    jobCategory: 'Buruh Harian',
    date: '2026-07-16',
    schedule: '2026-07-16 10:00',
    startedAt: '2026-07-16 10:15',
    finishedAt: '2026-07-16 11:45',
    price: 52500, // 1.5 jam * 35000
    status: 'Finished', // Booking, Escrow Paid, Worker Accepted, On The Way, In Progress, Waiting Confirmation, Finished, Rejected
    escrowStatus: 'Released', // Holding, Released, Refunded
    address: 'Jl. Sudirman No. 12, Jakarta Selatan',
    description: 'Pipa air di kamar mandi utama bocor dan air merembes ke tembok.',
    rating: 5,
    comment: 'Pekerjaan sangat rapi dan pipa bocor langsung teratasi dengan baik.',
    eta: '0 mins',
    currentLatitude: -6.2088,
    currentLongtitude: 106.8456,
    emergencyPhone: '112',
    panicEnabled: false
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    notificationId: 'notif-1',
    userId: 'client-1',
    title: 'Pembayaran Escrow Berhasil',
    description: 'Dana Rp52.500 telah ditahan dengan aman di Escrow KerjaIn.',
    type: 'payment', // payment, system, booking, panic
    createdAt: '2026-07-16 09:35',
    isRead: true,
    actionLink: '/client/tracking/job-101'
  },
  {
    notificationId: 'notif-2',
    userId: 'worker-1',
    title: 'Pekerjaan Baru Tersedia',
    description: 'Anda mendapatkan pesanan baru dari Budi Santoso untuk "Perbaikan Pipa Bocor".',
    type: 'booking',
    createdAt: '2026-07-16 09:30',
    isRead: false,
    actionLink: '/worker/activity/job-101'
  }
];

export const INITIAL_REPORTS = [
  {
    reportId: 'rep-1',
    reporterName: 'Budi Santoso',
    reportedWorkerName: 'Rian Hidayat',
    reportedWorkerId: 'worker-4',
    category: 'Ketidakhadiran',
    status: 'Pending', // Pending, Resolved
    createdAt: '2026-07-17 14:00',
    description: 'Worker tidak datang setelah ditunggu selama 2 jam tanpa memberikan kabar.',
    attachment: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=400',
    timeline: [
      { time: '2026-07-17 14:00', title: 'Laporan Diajukan oleh Client' },
      { time: '2026-07-17 14:30', title: 'Admin Meninjau Laporan' }
    ]
  }
];
