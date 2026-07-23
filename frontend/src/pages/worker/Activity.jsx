import React from 'react'
import { workerApi } from '../../services/api';
import MobileLayout from "../../components/layout/MobileLayout";
import { Link, useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  Calendar, 
  Banknote, 
  MapPin, 
  Clock, 
  MessageSquare,
  Sparkles,
  Zap
} from 'lucide-react';

export default function WorkerActivity() {
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
            <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 p-4 pb-20">

                {/* 1. HEADER */}
                <div className="mb-4">
                    <h1 className="text-xl font-bold text-[#001d28]">Aktivitas Saya</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Kelola pekerjaan yang sedang berjalan dan permintaan baru.
                    </p>
                </div>

                {/* 2. TAB NAVIGASI (UNDERLINE STYLE) */}
                <div className="flex border-b border-gray-200 mb-4 text-sm font-medium overflow-x-auto no-scrollbar">
                    <button className="pb-2 px-1 mr-6 text-[#007088] border-b-2 border-[#007088] font-semibold whitespace-nowrap">
                        Semua Pekerjaan
                    </button>
                    <button className="pb-2 px-1 mr-6 text-gray-500 hover:text-gray-700 whitespace-nowrap">
                        Berlangsung
                    </button>
                    <button className="pb-2 px-1 text-gray-500 hover:text-gray-700 whitespace-nowrap">
                        Menunggu
                    </button>
                </div>

                {/* 3. DAFTAR KARTU PEKERJAAN */}
                <div className="flex flex-col gap-4">

                    {/* KARTU 1: PERMINTAAN BARU */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                        {/* Badge Permintaan Baru */}
                        <div className="absolute top-0 right-0 bg-[#fea619] text-white text-[11px] font-semibold px-3 py-1 rounded-bl-xl">
                            Permintaan Baru
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-3 mb-3 pr-28">
                            <img
                                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
                                alt="Sari Wijaya"
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm">Sari Wijaya</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Sparkles className="w-3 h-3 text-gray-400" /> Pembersihan Rumah
                                </p>
                            </div>
                        </div>

                        <hr className="border-gray-100 my-2" />

                        {/* Details */}
                        <div className="flex flex-col gap-1.5 text-xs text-gray-500 my-3">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                    <Navigation className="w-3.5 h-3.5" /> Jarak
                                </span>
                                <span className="font-medium text-gray-700">1.2 km</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Waktu
                                </span>
                                <span className="font-medium text-gray-700">Besok, 09:00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                    <Banknote className="w-3.5 h-3.5" /> Harga
                                </span>
                                <span className="font-bold text-[#007088] text-sm">Rp 150.000</span>
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-3" />

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="w-full py-2 bg-[#007088] hover:bg-[#005c70] text-white text-xs font-semibold rounded-xl transition-colors">
                                Terima
                            </button>
                            <button className="w-full py-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors">
                                Tolak
                            </button>
                        </div>
                    </div>

                    {/* KARTU 2: SEDANG BERJALAN */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                        {/* Badge Sedang Berjalan */}
                        <div className="absolute top-0 right-0 bg-[#008953] text-white text-[11px] font-semibold px-3 py-1 rounded-bl-xl">
                            Sedang Berjalan
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-3 mb-3 pr-28">
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                                alt="Andi Pratama"
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm">Andi Pratama</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Zap className="w-3 h-3 text-gray-400" /> Perbaikan Listrik
                                </p>
                            </div>
                        </div>

                        <hr className="border-gray-100 my-2" />

                        {/* Details */}
                        <div className="flex flex-col gap-1.5 text-xs text-gray-500 my-3">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" /> Lokasi
                                </span>
                                <span className="font-medium text-gray-700">Jl. Melati No. 45</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> Mulai
                                </span>
                                <span className="font-medium text-gray-700">Hari ini, 13:00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                    <Banknote className="w-3.5 h-3.5" /> Harga
                                </span>
                                <span className="font-bold text-[#007088] text-sm">Rp 275.000</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden mb-3">
                            <div className="bg-[#008953] h-full rounded-full w-[60%]" />
                        </div>

                        {/* Action Button */}
                        <button className="w-full py-2.5 bg-[#e0edff] hover:bg-[#d0e3ff] text-[#007088] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            <span>Hubungi Client</span>
                        </button>
                    </div>

                    {/* KARTU 3: PERMINTAAN BARU 2 */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                        {/* Badge Permintaan Baru */}
                        <div className="absolute top-0 right-0 bg-[#fea619] text-white text-[11px] font-semibold px-3 py-1 rounded-bl-xl">
                            Permintaan Baru
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-3 mb-3 pr-28">
                            <img
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
                                alt="Bpk. Darmanto"
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm">Bpk. Darmanto</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Sparkles className="w-3 h-3 text-gray-400" /> Potong Rumput
                                </p>
                            </div>
                        </div>

                        <hr className="border-gray-100 my-2" />

                        {/* Details */}
                        <div className="flex flex-col gap-1.5 text-xs text-gray-500 my-3">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                    <Navigation className="w-3.5 h-3.5" /> Jarak
                                </span>
                                <span className="font-medium text-gray-700">0.8 km</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Waktu
                                </span>
                                <span className="font-medium text-gray-700">Sabtu, 08:00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                    <Banknote className="w-3.5 h-3.5" /> Harga
                                </span>
                                <span className="font-bold text-[#007088] text-sm">Rp 80.000</span>
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-3" />

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="w-full py-2 bg-[#007088] hover:bg-[#005c70] text-white text-xs font-semibold rounded-xl transition-colors">
                                Terima
                            </button>
                            <button className="w-full py-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors">
                                Tolak
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </MobileLayout>
    )
}



