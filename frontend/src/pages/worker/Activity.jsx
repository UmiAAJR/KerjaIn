import { useState, useEffect, useCallback } from 'react';
import React, { useState } from 'react'; // 1. Tambahkan useState di sini
import { workerApi } from '../../services/api';
import MobileLayout from "../../components/layout/MobileLayout";
import { useAuth } from "../../context/AuthContext";
import { workerApi } from "../../services/api";
import { 
  Calendar, 
  Banknote, 
  MapPin, 
  Clock, 
  Sparkles,
  AlertCircle,
  Phone
} from 'lucide-react';

export default function WorkerActivity() {
  const [activeTab, setActiveTab] = useState('Semua Pekerjaan');

  const jobsData = [
    {
      id: 1,
      name: 'Sari Wijaya',
      service: 'Pembersihan Rumah',
      distance: '1.2 km',
      time: 'Besok, 09:00',
      price: 'Rp 150.000',
      status: 'Menunggu',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      name: 'Andi Pratama',
      service: 'Perbaikan Listrik',
      location: 'Jl. Melati No. 45',
      time: 'Hari ini, 13:00',
      price: 'Rp 275.000',
      status: 'Berlangsung',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      name: 'Bpk. Darmanto',
      service: 'Potong Rumput',
      distance: '0.8 km',
      time: 'Sabtu, 08:00',
      price: 'Rp 80.000',
      status: 'Menunggu',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const tabs = ['Semua Pekerjaan', 'Berlangsung', 'Menunggu'];

  // Filter data berdasarkan tab yang dipilih
  const filteredJobs = jobsData.filter((job) => {
    if (activeTab === 'Semua Pekerjaan') return true;
    return job.status === activeTab;
  });

  return (
    <MobileLayout
      topNavProps={{
        variant: "location",
        hasNotification: true,
      }}
      bottomNavProps={{
        activeTab: "activity",
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

        {/* 2. TAB NAVIGASI (DINAMIS DENGAN useState) */}
        <div className="flex border-b border-gray-200 mb-4 text-sm font-medium overflow-x-auto no-scrollbar gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? 'border-[#007088] text-[#007088] font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* 3. DAFTAR KARTU PEKERJAAN (RENDER DINAMIS) */}
        <div className="flex flex-col gap-4">
          {filteredJobs.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-10">
              Tidak ada pekerjaan di kategori ini.
            </p>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden"
              >
                {/* BADGE STATUS */}
                <div
                  className={`absolute top-0 right-0 text-white text-[11px] font-semibold px-3 py-1 rounded-bl-xl ${
                    job.status === 'Menunggu' ? 'bg-[#fea619]' : 'bg-[#008953]'
                  }`}
                >
                  {job.status === 'Menunggu' ? 'Permintaan Baru' : 'Sedang Berjalan'}
                </div>

                {/* USER INFO */}
                <div className="flex items-center gap-3 mb-3 pr-28">
                  <img
                    src={job.avatar}
                    alt={job.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{job.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      {job.status === 'Berlangsung' ? (
                        <Zap className="w-3 h-3 text-gray-400" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-gray-400" />
                      )}
                      {job.service}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-100 my-2" />

                {/* DETAILS */}
                <div className="flex flex-col gap-1.5 text-xs text-gray-500 my-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      {job.status === 'Berlangsung' ? (
                        <>
                          <MapPin className="w-3.5 h-3.5" /> Lokasi
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5" /> Jarak
                        </>
                      )}
                    </span>
                    <span className="font-medium text-gray-700">
                      {job.location || job.distance}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      {job.status === 'Berlangsung' ? (
                        <>
                          <Clock className="w-3.5 h-3.5" /> Mulai
                        </>
                      ) : (
                        <>
                          <Calendar className="w-3.5 h-3.5" /> Waktu
                        </>
                      )}
                    </span>
                    <span className="font-medium text-gray-700">{job.time}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5" /> Harga
                    </span>
                    <span className="font-bold text-[#007088] text-sm">{job.price}</span>
                  </div>
                </div>

                {/* KHUSUS PEKERJAAN BERLANGSUNG: PROGRESS BAR */}
                {job.status === 'Berlangsung' && (
                  <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden mb-3">
                    <div className="bg-[#008953] h-full rounded-full w-[60%]" />
                  </div>
                )}

                <hr className="border-gray-100 mb-3" />

                {/* ACTION BUTTONS */}
                {job.status === 'Menunggu' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button className="w-full py-2 bg-[#007088] hover:bg-[#005c70] text-white text-xs font-semibold rounded-xl transition-colors">
                      Terima
                    </button>
                    <button className="w-full py-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors">
                      Tolak
                    </button>
                  </div>
                ) : (
                  <button className="w-full py-2.5 bg-[#e0edff] hover:bg-[#d0e3ff] text-[#007088] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>Hubungi Client</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </MobileLayout>
  );
}