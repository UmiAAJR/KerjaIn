import argon2 from 'argon2';
import db from './db/db.js';
import models from './model/models.js';

const {
  Category,
  Job,
  Notification,
  Panic,
  Payment,
  Skill,
  User,
  Verify,
  Worker,
  WorkerSkill,
  Withdrawal,
  Report
} = models;

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200"
];

const KTP_SAMPLE = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400";
const SELFIE_SAMPLE = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400";

async function seed() {
  console.log("🌱 Starting Database Seeding process...");

  try {
    await db.authenticate();
    console.log("✅ Database connection established.");

    // 1. Truncate all tables in clean dependency order
    console.log("🧹 Cleaning existing table data...");
    await Panic.destroy({ truncate: true, cascade: true });
    await Report.destroy({ truncate: true, cascade: true });
    await Withdrawal.destroy({ truncate: true, cascade: true });
    await Verify.destroy({ truncate: true, cascade: true });
    await WorkerSkill.destroy({ truncate: true, cascade: true });
    await Job.destroy({ truncate: true, cascade: true });
    await Payment.destroy({ truncate: true, cascade: true });
    await Worker.destroy({ truncate: true, cascade: true });
    await Notification.destroy({ truncate: true, cascade: true });
    await Skill.destroy({ truncate: true, cascade: true });
    await Category.destroy({ truncate: true, cascade: true });
    await User.destroy({ truncate: true, cascade: true });

    // Hashed default passwords
    const adminPassword = await argon2.hash("admin123");
    const userPassword = await argon2.hash("password123");

    // 2. Create Users
    console.log("👤 Creating Users (Admin, Clients, Workers)...");
    
    // Admin
    const adminUser = await User.create({
      email: "admin@gmail.com",
      password: adminPassword,
      name: "Ageng Administrator",
      role: "admin",
      address: "Jl. Pemuda No. 1, Surabaya",
      phoneNumber: "08123123213",
      latitude: -7.2654,
      longitude: 112.7481,
      photo: DEFAULT_AVATARS[0]
    });

    // Clients
    const client1 = await User.create({
      email: "client@gmail.com",
      password: userPassword,
      name: "Budi Santoso",
      role: "client",
      address: "Jl. Sudirman No. 12, Surabaya",
      phoneNumber: "081234567890",
      latitude: -7.250445,
      longitude: 112.768845,
      photo: DEFAULT_AVATARS[1]
    });

    const client2 = await User.create({
      email: "client2@mail.com",
      password: userPassword,
      name: "Siti Rahma",
      role: "client",
      address: "Jl. Pahlawan No. 45, Sidoarjo",
      phoneNumber: "081111111112",
      latitude: -7.447800,
      longitude: 112.718300,
      photo: DEFAULT_AVATARS[2]
    });

    const client3 = await User.create({
      email: "axel.mardiyo1006@gmail.com",
      password: userPassword,
      name: "Axell Mardiyo",
      role: "client",
      address: "Jl. Frontage Gedangan, Sidoarjo",
      phoneNumber: "089437505349",
      latitude: -7.388985,
      longitude: 112.728591,
      photo: DEFAULT_AVATARS[3]
    });

    const client4 = await User.create({
      email: "maulana@boby.com",
      password: userPassword,
      name: "Maulana Boby",
      role: "client",
      address: "Jl. Raya Darmo No. 88, Surabaya",
      phoneNumber: "081937897249",
      latitude: -7.285000,
      longitude: 112.738000,
      photo: DEFAULT_AVATARS[4]
    });

    const client5 = await User.create({
      email: "rina.client@gmail.com",
      password: userPassword,
      name: "Rina Wijaya",
      role: "client",
      address: "Jl. Mayjend Sungkono No. 10, Surabaya",
      phoneNumber: "081299887766",
      latitude: -7.291200,
      longitude: 112.718000,
      photo: DEFAULT_AVATARS[5]
    });

    // Workers Users
    const uWorker1 = await User.create({
      email: "worker@gmail.com",
      password: userPassword,
      name: "Andi Tukang",
      role: "worker",
      address: "Jl. Merdeka No. 2, Surabaya",
      phoneNumber: "089876543210",
      latitude: -7.251000,
      longitude: 112.770000,
      photo: DEFAULT_AVATARS[0]
    });

    const uWorker2 = await User.create({
      email: "worker1@mail.com",
      password: userPassword,
      name: "Ahmad Fauzi",
      role: "worker",
      address: "Jl. Gubeng Jaya No. 15, Surabaya",
      phoneNumber: "081111111113",
      latitude: -7.280000,
      longitude: 112.740000,
      photo: DEFAULT_AVATARS[1]
    });

    const uWorker3 = await User.create({
      email: "worker2@mail.com",
      password: userPassword,
      name: "Dewi Lestari",
      role: "worker",
      address: "Jl. Ketabang No. 8, Surabaya",
      phoneNumber: "081111111114",
      latitude: -7.260000,
      longitude: 112.730000,
      photo: DEFAULT_AVATARS[2]
    });

    const uWorker4 = await User.create({
      email: "worker3@mail.com",
      password: userPassword,
      name: "Rizky Hidayat",
      role: "worker",
      address: "Jl. Gajah Mada No. 22, Sidoarjo",
      phoneNumber: "081111111115",
      latitude: -7.450000,
      longitude: 112.710000,
      photo: DEFAULT_AVATARS[3]
    });

    const uWorker5 = await User.create({
      email: "testworker_curl@test.com",
      password: userPassword,
      name: "Bambang Setiawan",
      role: "worker",
      address: "Jl. Dharmawangsa No. 50, Surabaya",
      phoneNumber: "08999998888",
      latitude: -7.275000,
      longitude: 112.755000,
      photo: DEFAULT_AVATARS[4]
    });

    const uWorker6 = await User.create({
      email: "mantap@jiwa.com",
      password: userPassword,
      name: "Eko Teknisi Mantap",
      role: "worker",
      address: "Jl. Ahmad Yani No. 120, Surabaya",
      phoneNumber: "088392641234",
      latitude: -7.320000,
      longitude: 112.735000,
      photo: DEFAULT_AVATARS[5]
    });

    const uWorker7 = await User.create({
      email: "adjiamadio06@gmail.com",
      password: userPassword,
      name: "Adji Amadio",
      role: "worker",
      address: "Jl. Raya Diponegoro No. 4, Surabaya",
      phoneNumber: "081234562323",
      latitude: -7.288000,
      longitude: 112.732000,
      photo: DEFAULT_AVATARS[0]
    });

    const uWorker8 = await User.create({
      email: "ayanokoji@gmail.com",
      password: userPassword,
      name: "Ayanokoji Teknik",
      role: "worker",
      address: "Jl. Jemursari No. 60, Surabaya",
      phoneNumber: "089234343232",
      latitude: -7.315000,
      longitude: 112.745000,
      photo: DEFAULT_AVATARS[1]
    });

    // 3. Create Worker profiles
    console.log("🛠️ Creating Worker profiles & Virtual Wallets...");
    const worker1 = await Worker.create({
      UserID: uWorker1.UserID,
      description: "Ahli perbaikan AC, sekering listrik rumah, dan instalasi alat elektronik profesional berpengalaman 5+ tahun.",
      status: "verified",
      balance: 750000,
      bankName: "BCA",
      bankNumber: "1234567890",
      bankAccount: "Andi Tukang"
    });

    const worker2 = await Worker.create({
      UserID: uWorker2.UserID,
      description: "Spesialis pertukangan kayu, renovasi atap bocor, dan pemasangan keramik rapi cepat dan terpercaya.",
      status: "verified",
      balance: 1200000,
      bankName: "Mandiri",
      bankNumber: "1420009876543",
      bankAccount: "Ahmad Fauzi"
    });

    const worker3 = await Worker.create({
      UserID: uWorker3.UserID,
      description: "Layanan kebersihan rumah profesional, cuci sofa, karpet, dan pembersihan kamar mandi kinclong.",
      status: "verified",
      balance: 450000,
      bankName: "BRI",
      bankNumber: "001201098765501",
      bankAccount: "Dewi Lestari"
    });

    const worker4 = await Worker.create({
      UserID: uWorker4.UserID,
      description: "Teknisi instalasi pipa air, cuci tandon, perbaikan kran bocor dan masalah selokan tumpat.",
      status: "verified",
      balance: 950000,
      bankName: "BNI",
      bankNumber: "0987654321",
      bankAccount: "Rizky Hidayat"
    });

    const worker5 = await Worker.create({
      UserID: uWorker5.UserID,
      description: "Jasa pemotongan rumput, penataan taman, dan perawatan tanaman hias indoor maupun outdoor.",
      status: "pending_verification",
      balance: 300000,
      bankName: "BCA",
      bankNumber: "8877665544",
      bankAccount: "Bambang Setiawan"
    });

    const worker6 = await Worker.create({
      UserID: uWorker6.UserID,
      description: "Teknisi perbaikan mesin cuci, kulkas, dan pompa air mati siap panggil 24 jam.",
      status: "verified",
      balance: 1500000,
      bankName: "Mandiri",
      bankNumber: "1400011223344",
      bankAccount: "Eko Teknisi Mantap"
    });

    const worker7 = await Worker.create({
      UserID: uWorker7.UserID,
      description: "Tukang cat dinding interior dan eksterior rumah dengan cat bermutu tinggi dan garansi rapi.",
      status: "pending_verification",
      balance: 0,
      bankName: "BCA",
      bankNumber: "0112233445",
      bankAccount: "Adji Amadio"
    });

    const worker8 = await Worker.create({
      UserID: uWorker8.UserID,
      description: "Servis kelistrikan umum, pemasangan stop kontak baru, dan instalasi lampu hias gantung.",
      status: "unverified",
      balance: 0,
      bankName: "BRI",
      bankNumber: "0055010998877",
      bankAccount: "Ayanokoji Teknik"
    });

    // 4. Create Categories & Skills
    console.log("🏷️ Creating Categories & Skills...");
    const catKelistrikan = await Category.create({ name: "Kelistrikan", icon: "zap" });
    const catPertukangan = await Category.create({ name: "Pertukangan", icon: "hammer" });
    const catPlumbing = await Category.create({ name: "Plumbing & Pipa", icon: "droplet" });
    const catKebersihan = await Category.create({ name: "Kebersihan", icon: "sparkles" });
    const catElektronik = await Category.create({ name: "Elektronik & AC", icon: "tv" });
    const catPerkebunan = await Category.create({ name: "Perkebunan", icon: "sun" });
    const catPengecatan = await Category.create({ name: "Pengecatan", icon: "paint-bucket" });

    // Skills (Max 30 chars name)
    const skillAC = await Skill.create({ name: "Servis & Cuci AC", CategoryID: catElektronik.CategoryID });
    const skillListrik = await Skill.create({ name: "Instalasi Listrik", CategoryID: catKelistrikan.CategoryID });
    const skillKayu = await Skill.create({ name: "Pertukangan Kayu", CategoryID: catPertukangan.CategoryID });
    const skillAtap = await Skill.create({ name: "Perbaikan Atap Bocor", CategoryID: catPertukangan.CategoryID });
    const skillKeramik = await Skill.create({ name: "Pasang Keramik", CategoryID: catPertukangan.CategoryID });
    const skillPompa = await Skill.create({ name: "Servis Pompa Air", CategoryID: catPlumbing.CategoryID });
    const skillCleaning = await Skill.create({ name: "Deep Cleaning & Sofa", CategoryID: catKebersihan.CategoryID });
    const skillTaman = await Skill.create({ name: "Perawatan Taman", CategoryID: catPerkebunan.CategoryID });
    const skillPengecatan = await Skill.create({ name: "Pengecatan Tembok", CategoryID: catPengecatan.CategoryID });
    const skillMesinCuci = await Skill.create({ name: "Servis Mesin Cuci", CategoryID: catElektronik.CategoryID });

    // 5. Create WorkerSkills
    console.log("🔗 Linking Worker Skills & Hourly Rates...");
    await WorkerSkill.create({ WorkerID: worker1.WorkerID, SkillID: skillAC.SkillID, hourlyRate: 75000 });
    await WorkerSkill.create({ WorkerID: worker1.WorkerID, SkillID: skillListrik.SkillID, hourlyRate: 65000 });
    
    await WorkerSkill.create({ WorkerID: worker2.WorkerID, SkillID: skillKayu.SkillID, hourlyRate: 85000 });
    await WorkerSkill.create({ WorkerID: worker2.WorkerID, SkillID: skillAtap.SkillID, hourlyRate: 90000 });
    await WorkerSkill.create({ WorkerID: worker2.WorkerID, SkillID: skillKeramik.SkillID, hourlyRate: 80000 });
    
    await WorkerSkill.create({ WorkerID: worker3.WorkerID, SkillID: skillCleaning.SkillID, hourlyRate: 60000 });
    
    await WorkerSkill.create({ WorkerID: worker4.WorkerID, SkillID: skillPompa.SkillID, hourlyRate: 70000 });
    
    await WorkerSkill.create({ WorkerID: worker5.WorkerID, SkillID: skillTaman.SkillID, hourlyRate: 55000 });
    
    await WorkerSkill.create({ WorkerID: worker6.WorkerID, SkillID: skillMesinCuci.SkillID, hourlyRate: 95000 });
    await WorkerSkill.create({ WorkerID: worker6.WorkerID, SkillID: skillAC.SkillID, hourlyRate: 80000 });
    
    await WorkerSkill.create({ WorkerID: worker7.WorkerID, SkillID: skillPengecatan.SkillID, hourlyRate: 70000 });

    // 6. Create KTP Verifications
    console.log("📜 Creating Worker KTP Verification records...");
    await Verify.create({
      WorkerID: worker1.WorkerID,
      ktpPhoto: KTP_SAMPLE,
      selfiePhoto: SELFIE_SAMPLE,
      status: "accepted",
      submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    });

    await Verify.create({
      WorkerID: worker2.WorkerID,
      ktpPhoto: KTP_SAMPLE,
      selfiePhoto: SELFIE_SAMPLE,
      status: "accepted",
      submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    });

    await Verify.create({
      WorkerID: worker3.WorkerID,
      ktpPhoto: KTP_SAMPLE,
      selfiePhoto: SELFIE_SAMPLE,
      status: "accepted",
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    await Verify.create({
      WorkerID: worker5.WorkerID,
      ktpPhoto: KTP_SAMPLE,
      selfiePhoto: SELFIE_SAMPLE,
      status: "pending",
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    await Verify.create({
      WorkerID: worker7.WorkerID,
      ktpPhoto: KTP_SAMPLE,
      selfiePhoto: SELFIE_SAMPLE,
      status: "pending",
      submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    });

    // 7. Create Payments & Jobs (Escrow Flow)
    console.log("💰 Creating Payments & Escrow Jobs...");

    // Job 1: Completed Escrow Released
    const pay1 = await Payment.create({
      amount: 150000,
      status: "released",
      platformFee: 15000,
      workerAmount: 135000,
      snapToken: "SNAP-TOKEN-001-COMPLETED",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      releasedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    });

    const job1 = await Job.create({
      WorkerID: worker1.WorkerID,
      ClientID: client1.UserID,
      PaymentID: pay1.PaymentID,
      service: "Servis & Cuci AC Split 1 PK",
      comment: "AC berisik dan tidak dingin, tolong dicuci dan isi freon.",
      address: "Jl. Sudirman No. 12, Surabaya",
      description: "Pekerjaan cuci AC 1 PK kamar utama.",
      bookingDate: "2026-07-26",
      schedule: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      status: "COMPLETED",
      rating: 5
    });

    // Job 2: Completed Escrow Released
    const pay2 = await Payment.create({
      amount: 250000,
      status: "released",
      platformFee: 25000,
      workerAmount: 225000,
      snapToken: "SNAP-TOKEN-002-COMPLETED",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      releasedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    const job2 = await Job.create({
      WorkerID: worker2.WorkerID,
      ClientID: client2.UserID,
      PaymentID: pay2.PaymentID,
      service: "Perbaikan Atap Bocor Garasi",
      comment: "Genteng geser dan talang air bocor saat hujan deras.",
      address: "Jl. Pahlawan No. 45, Sidoarjo",
      description: "Perbaikan konstruksi genteng dan semen talang.",
      bookingDate: "2026-07-28",
      schedule: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "COMPLETED",
      rating: 5
    });

    // Job 3: In Progress (Escrow Holding)
    const pay3 = await Payment.create({
      amount: 200000,
      status: "holding",
      platformFee: 20000,
      workerAmount: 180000,
      snapToken: "SNAP-TOKEN-003-HOLDING",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    const job3 = await Job.create({
      WorkerID: worker4.WorkerID,
      ClientID: client3.UserID,
      PaymentID: pay3.PaymentID,
      service: "Servis Pompa Air Shimge Mati Total",
      comment: "Pompa air rumah tidak menyala sama sekali.",
      address: "Jl. Frontage Gedangan, Sidoarjo",
      description: "Pengecekan dinamo dan penggantian kapasitor pompa.",
      bookingDate: "2026-07-30",
      schedule: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: "IN_PROGRESS"
    });

    // Job 4: Waiting Client Confirmation (Escrow Holding)
    const pay4 = await Payment.create({
      amount: 180000,
      status: "holding",
      platformFee: 18000,
      workerAmount: 162000,
      snapToken: "SNAP-TOKEN-004-HOLDING",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    const job4 = await Job.create({
      WorkerID: worker6.WorkerID,
      ClientID: client4.UserID,
      PaymentID: pay4.PaymentID,
      service: "Perbaikan Mesin Cuci 2 Tabung",
      comment: "Pengering mesin cuci macet tidak mau berputar.",
      address: "Jl. Raya Darmo No. 88, Surabaya",
      description: "Penggantian tali rem pengering dan pembersihan komponen.",
      bookingDate: "2026-07-29",
      schedule: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: "WAITING_CONFIRMATION"
    });

    // Job 5: Pending Booking
    const pay5 = await Payment.create({
      amount: 120000,
      status: "pending",
      platformFee: 12000,
      workerAmount: 108000,
      snapToken: "SNAP-TOKEN-005-PENDING",
      createdAt: new Date()
    });

    const job5 = await Job.create({
      WorkerID: worker3.WorkerID,
      ClientID: client5.UserID,
      PaymentID: pay5.PaymentID,
      service: "Deep Cleaning Sofa L 3 Seater",
      comment: "Cuci dan penyedotan debu kotoran sofa tamu.",
      address: "Jl. Mayjend Sungkono No. 10, Surabaya",
      description: "Layanan pembersihan cuci basah dan pengeringan sofa.",
      bookingDate: "2026-07-31",
      schedule: new Date(),
      status: "PENDING"
    });

    // 8. Create Withdrawals
    console.log("🏧 Creating Bank Withdrawal requests...");
    await Withdrawal.create({
      WithdrawalID: "b101a572-0977-4370-b693-29e90f28c501",
      WorkerID: worker1.WorkerID,
      amount: 300000,
      bankName: "BCA",
      bankNumber: "1234567890",
      bankAccount: "Andi Tukang",
      status: "APPROVED",
      approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    await Withdrawal.create({
      WithdrawalID: "b101a572-0977-4370-b693-29e90f28c502",
      WorkerID: worker2.WorkerID,
      amount: 500000,
      bankName: "Mandiri",
      bankNumber: "1420009876543",
      bankAccount: "Ahmad Fauzi",
      status: "PENDING_APPROVAL",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    });

    await Withdrawal.create({
      WithdrawalID: "b101a572-0977-4370-b693-29e90f28c503",
      WorkerID: worker4.WorkerID,
      amount: 400000,
      bankName: "BNI",
      bankNumber: "0987654321",
      bankAccount: "Rizky Hidayat",
      status: "PENDING_APPROVAL",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    });

    // 9. Create Broadcast & System Notifications
    console.log("🔔 Creating System & Broadcast Notifications...");
    await Notification.create({
      title: "Selamat Datang di KerjaIn!",
      description: "Platform penyedia jasa dan pekerja harian lokal terpercaya di Indonesia.",
      type: "info",
      role: "all",
      isRead: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    await Notification.create({
      title: "Pembayaran Escrow Diverifikasi",
      description: "Pembayaran pekerjaan jasa perbaikan AC telah dikonfirmasi dan dana aman di Escrow KerjaIn.",
      type: "payment",
      role: "client",
      UserID: client1.UserID,
      isRead: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    await Notification.create({
      title: "Pencairan Saldo Berhasil",
      description: "Pengajuan penarikan dana sebesar Rp 300.000 ke rekening BCA telah disetujui Admin.",
      type: "payment",
      role: "worker",
      UserID: uWorker1.UserID,
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    // 10. Create Reports
    console.log("📝 Creating Dispute & Trouble Reports...");
    await Report.create({
      ReportID: "c101a572-0977-4370-b693-29e90f28c601",
      reporterID: client1.UserID,
      reportedWorkerID: worker1.WorkerID,
      JobID: job1.JobID,
      category: "Keterlambatan",
      description: "Pekerja terlambat datang 45 menit dari waktu janji lokasi.",
      status: "Resolved",
      timeline: "Diskusi diselesaikan dengan permintaan maaf pekerja dan pekerjaan selesai sangat baik.",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    });

    await Report.create({
      ReportID: "c101a572-0977-4370-b693-29e90f28c602",
      reporterID: client3.UserID,
      reportedWorkerID: worker4.WorkerID,
      JobID: job3.JobID,
      category: "Pekerjaan Kurang Sesuai",
      description: "Pompa air masih berisik setelah penggantian saklar otomatis.",
      status: "Pending",
      timeline: "Menunggu peninjauan kembali oleh pekerja.",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    });

    // 11. Create Panic SOS Alerts
    console.log("🚨 Creating Emergency Panic SOS Alerts...");
    await Panic.create({
      JobID: job3.JobID,
      status: "Resolved",
      latitude: -7.388985,
      longitude: 112.728591,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    console.log("\n🎉 Database Seeding Completed Successfully!");
    console.log("---------------------------------------------------------");
    console.log("🔑 LOGIN CREDENTIALS FOR TESTING:");
    console.log("   • Admin  : admin@gmail.com / admin123");
    console.log("   • Client : client@gmail.com / password123");
    console.log("   • Worker : worker@gmail.com / password123");
    console.log("---------------------------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seed();
