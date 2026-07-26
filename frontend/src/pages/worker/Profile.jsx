import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { workerApi } from '../../services/api';
import MobileLayout from "../../components/layout/MobileLayout";
import {
    Mail,
    Phone,
    Pen,
    BarChart3,
    Star,
    CheckCircle2,
    CircleEllipsis,
    Shield,
    CreditCard,
    ShieldCheck,
    Bell,
    LogOut,
    ChevronRight,
    History
} from 'lucide-react';

export default function WorkerProfile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!user || !user.id) return;
            try {
                const data = await workerApi.getDashboard(user.id);
                setStats(data);
            } catch (err) {
                console.error("Gagal memuat statistik profil worker:", err);
            }
        };
        fetchDashboard();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <MobileLayout
            topNavProps={{
                variant: "brand",
                brandName: "Profil Saya",
                hasNotification: true,
            }}
            bottomNavProps={{
                activeTab: "profile",
            }}
        >
            <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 pb-20 text-left">

                {/* 1. BAGIAN HEADER */}
                <div className="w-full bg-[#007088] pt-6 pb-16 px-6 text-white text-center shadow-md">
                    {/* Profile Picture */}
                    <div className="flex justify-center mb-3">
                        <img
                            src={user?.photo || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150"}
                            alt={user?.name || "Pekerja"}
                            className="h-20 w-20 rounded-full object-cover border-2 border-white/20 shadow-md"
                        />
                    </div>

                    {/* Nama Akun */}
                    <h1 className="text-2xl font-black font-heading tracking-tight mb-3">
                        {user?.name || "Marcel Maba"}
                    </h1>

                    {/* Contact Badges & Edit Button */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-semibold">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{user?.email || "andi.pratama@email.com"}</span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-semibold">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{user?.phoneNumber || "081238383838"}</span>
                        </div>

                        <button className="mt-2 flex items-center gap-2 px-5 py-2 bg-[#fea619] hover:bg-[#e59516] transition-all rounded-full text-white text-xs font-black shadow-xs cursor-pointer active:scale-95">
                            <Pen className="w-3.5 h-3.5" />
                            <span>Edit Profil</span>
                        </button>
                    </div>
                </div>

                {/* CONTAINER KARTU UTAMA */}
                <div className="px-5 -mt-10 flex flex-col gap-4">

                    {/* 2. KARTU STATISTIK PEKERJAAN */}
                    <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-[#007088]" />
                            <h2 className="text-base font-black text-slate-800 tracking-tight">Statistik Pekerjaan</h2>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                <span className="text-slate-500 font-bold text-xs">Total Pekerjaan Selesai</span>
                                <span className="text-base font-black text-[#007088]">
                                    {stats?.order?.completeOrder || 0} Order
                                </span>
                            </div>

                            <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                <span className="text-slate-500 font-bold text-xs">Rating Rata-rata</span>
                                <div className="flex items-center gap-1 text-slate-800 font-black text-sm">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span>{user?.rating?.toFixed(1) || "5.0"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. KARTU VERIFIKASI AKUN */}
                    <div className="relative overflow-hidden bg-[#007088] rounded-2xl p-5 text-white shadow-md">
                        <Shield className="absolute -bottom-6 -right-6 w-36 h-36 text-white/10 pointer-events-none stroke-[1.5]" />

                        <div className="relative z-10 mb-4">
                            <h2 className="text-lg font-black tracking-tight mb-1">Verifikasi Akun</h2>
                            <p className="text-xs text-cyan-100/80 font-semibold">
                                Lengkapi verifikasi untuk menjaga kredibilitas profil jasa Anda.
                            </p>
                        </div>

                        <div className="relative z-10 flex flex-col gap-3 text-xs font-semibold">
                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4.5 h-4.5 text-cyan-200" />
                                <span>Identitas KTP & Wajah</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4.5 h-4.5 text-cyan-200" />
                                <span>Email & Nomor Telepon Aktif</span>
                            </div>

                            <div className="flex items-center gap-2.5 text-white/60">
                                <CircleEllipsis className="w-4.5 h-4.5 text-white/40" />
                                <span>Sertifikasi Keahlian Khusus</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. KARTU PENGATURAN AKUN */}
                    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">

                        {/* Header Pengaturan */}
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-base font-black text-slate-800 tracking-tight">Pengaturan & Riwayat</h2>
                        </div>

                        {/* List Menu */}
                        <div className="divide-y divide-slate-100 font-semibold">

                            {/* Menu Baru: Riwayat Pekerjaan */}
                            <button
                                onClick={() => navigate('/worker/history')}
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-[#007088]">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-extrabold text-slate-800">Riwayat Pekerjaan</h3>
                                        <p className="text-[10px] text-slate-400">Lihat semua daftar pekerjaan yang telah selesai</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>

                            {/* Metode Pembayaran */}
                            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-[#007088]">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-extrabold text-slate-800">Rekening & Pembayaran</h3>
                                        <p className="text-[10px] text-slate-400">Atur kartu debit/kredit dan e-wallet payout</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>

                            {/* Keamanan & Password */}
                            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-[#007088]">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-extrabold text-slate-800">Keamanan Akun</h3>
                                        <p className="text-[10px] text-slate-400">Ganti password dan konfigurasi 2FA</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>

                            {/* Notifikasi */}
                            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-[#007088]">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-extrabold text-slate-800">Notifikasi</h3>
                                        <p className="text-[10px] text-slate-400">Atur suara dan in-app notification</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>

                            {/* Keluar Akun */}
                            <button
                                onClick={handleLogout}
                                className="w-full p-4 flex items-center justify-between hover:bg-red-50/50 transition-colors text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                                        <LogOut className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-extrabold text-rose-600">Keluar Akun</h3>
                                        <p className="text-[10px] text-rose-400">Keluar dari sesi saat ini</p>
                                    </div>
                                </div>
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        </MobileLayout>
    );
}