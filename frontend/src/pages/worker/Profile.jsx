import React from 'react';
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
    Globe,
    HelpCircle,
    LogOut,
    ChevronRight
} from 'lucide-react';

export default function WorkerProfile() {
    return (
        <MobileLayout
            topNavProps={{
                variant: "location",
                hasNotification: true,
            }}
            bottomNavProps={{
                activeTab: "home",
            }}
        >
            <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 pb-20">

                {/* 1. BAGIAN HEADER BIRU */}
                <div className="w-full bg-[#007088] pt-6 pb-16 px-6 text-white text-center shadow-md">
                    {/* Profile Picture */}
                    <div className="flex justify-center mb-3">
                        <img
                            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&auto=format&fit=crop&q=60"
                            alt="Marcel Maba"
                            className="h-20 w-20 rounded-full object-cover border-2 border-white/20"
                        />
                    </div>

                    {/* Nama Akun */}
                    <h1 className="text-2xl font-bold mb-3">Marcel Maba</h1>

                    {/* Contact Badges & Edit Button */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs">
                            <Mail className="w-3.5 h-3.5" />
                            <span>andi.pratama@email.com</span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs">
                            <Phone className="w-3.5 h-3.5" />
                            <span>081238383838</span>
                        </div>

                        <button className="mt-2 flex items-center gap-2 px-5 py-2 bg-[#fea619] hover:bg-[#e59516] transition-colors rounded-full text-white text-xs font-semibold shadow-sm">
                            <Pen className="w-3.5 h-3.5" />
                            <span>Edit Profil</span>
                        </button>
                    </div>
                </div>

                {/* CONTAINER KARTU UTAMA */}
                <div className="px-5 -mt-10 flex flex-col gap-4">

                    {/* 2. KARTU STATISTIK CLIENT */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-[#007088]" />
                            <h2 className="text-lg font-bold text-gray-800">Statistik Client</h2>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl">
                                <span className="text-gray-600 font-medium text-xs">Total Project</span>
                                <span className="text-lg font-bold text-[#007088]">24</span>
                            </div>

                            <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl">
                                <span className="text-gray-600 font-medium text-xs">Rating Pemberi Kerja</span>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span className="text-lg font-bold text-gray-800">4.9</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 bg-slate-50 p-3.5 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium text-xs">Trust Score</span>
                                    <span className="text-xs font-bold text-[#007088]">98%</span>
                                </div>
                                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                    <div className="bg-[#007088] h-full rounded-full w-[98%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. KARTU VERIFIKASI AKUN */}
                    <div className="relative overflow-hidden bg-[#007088] rounded-2xl p-6 text-white shadow-lg">
                        <Shield className="absolute -bottom-6 -right-6 w-36 h-36 text-white/10 pointer-events-none stroke-[1.5]" />

                        <div className="relative z-10 mb-4">
                            <h2 className="text-xl font-bold mb-1">Verifikasi Akun</h2>
                            <p className="text-xs text-cyan-100/80">
                                Lengkapi verifikasi untuk akses fitur premium.
                            </p>
                        </div>

                        <div className="relative z-10 flex flex-col gap-3 text-sm">
                            <div className="flex items-center gap-2.5 font-medium">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                                <span>Identitas KTP</span>
                            </div>

                            <div className="flex items-center gap-2.5 font-medium">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                                <span>Email & Telepon</span>
                            </div>

                            <div className="flex items-center gap-2.5 font-medium text-white/60">
                                <CircleEllipsis className="w-5 h-5 text-white/60" />
                                <span>Legalitas Bisnis</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. KARTU PENGATURAN AKUN */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

                        {/* Header Pengaturan */}
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-[#001d28]">Pengaturan Akun</h2>
                        </div>

                        {/* List Menu (Menggunakan divide-y untuk garis pembatas) */}
                        <div className="divide-y divide-gray-100">

                            {/* Item 1: Metode Pembayaran */}
                            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-full bg-cyan-50 flex items-center justify-center text-[#007088]">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800">Metode Pembayaran</h3>
                                        <p className="text-xs text-gray-500">Atur kartu debit/kredit dan e-wallet</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>

                            {/* Item 2: Keamanan & Password */}
                            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-full bg-cyan-50 flex items-center justify-center text-[#007088]">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800">Keamanan & Password</h3>
                                        <p className="text-xs text-gray-500">Ganti password dan aktifkan 2FA</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>

                            {/* Item 3: Notifikasi */}
                            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-full bg-cyan-50 flex items-center justify-center text-[#007088]">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800">Notifikasi</h3>
                                        <p className="text-xs text-gray-500">Atur pemberitahuan project dan pesan</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>

                            {/* Item 4: Bahasa & Wilayah */}
                            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-full bg-cyan-50 flex items-center justify-center text-[#007088]">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800">Bahasa & Wilayah</h3>
                                        <p className="text-xs text-gray-500">Indonesia (IDR)</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>

                            {/* Item 5: Pusat Bantuan */}
                            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-full bg-cyan-50 flex items-center justify-center text-[#007088]">
                                        <HelpCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800">Pusat Bantuan</h3>
                                        <p className="text-xs text-gray-500">FAQ dan hubungi support KerjaDekat</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>

                            {/* Item 6: Keluar Akun (Warna Merah / Danger Action) */}
                            <button className="w-full p-4 flex items-center justify-between hover:bg-red-50/50 transition-colors text-left">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                        <LogOut className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-red-600">Keluar Akun</h3>
                                        <p className="text-xs text-red-500/80">Keluar dari sesi saat ini</p>
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