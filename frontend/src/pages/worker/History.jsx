import React, { useState } from 'react'
import { workerApi } from '../../services/api';
import MobileLayout from "../../components/layout/MobileLayout";
import { useAuth } from "../../context/AuthContext";
import { workerApi } from "../../services/api";
import { Calendar, Star, AlertCircle, Sparkles } from 'lucide-react';

export default function WorkerHistory() {
  const [historyTab, setHistoryTab] = useState('Semua')

  const HistoryData = [{
    HistoryID: 1,
    name: 'Dio',
    startedAt: '09:00',
    rating: 5,
    status: 'Selesai',
    bookingDate: '12 Okt 2023',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    job: 'Kebersihan Rumah',
 
  },
  {
    HistoryID: 1,
    name: 'Dio',
    startedAt: '09:00',
    rating: 5,
    status: 'Selesai',
    bookingDate: '12 Okt 2023',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    job: 'Kebersihan Rumah',
  }]

  const historytabs = ['Semua', 'Dalam Proses', 'Selesai', 'Dibatalkan']

  const filteredHistory = HistoryData.filter((h) => {
    if (historyTab === 'Semua') return true;
    return h.status === historyTab;
  })

  return (
    <MobileLayout
      topNavProps={{
        variant: "brand",
        brandName: "Riwayat Selesai",
        hasNotification: true,
      }}
      bottomNavProps={{
        activeTab: "activity",
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 p-4 pb-20 text-left">
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Riwayat Pekerjaan</h1>

        {/* Filter Chips (Horizontal Scrollable) */}
        <div className="flex space-x-2 overflow-x-auto mb-6 pb-2">

          <button className="px-4 py-2 rounded-full text-sm font-semibold bg-teal-800 text-white whitespace-nowrap shadow-xs">
            Semua
          </button>
          <button className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-50/70 text-slate-600 hover:bg-indigo-100 whitespace-nowrap">
            Dalam Proses
          </button>
          <button className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-50/70 text-slate-600 hover:bg-indigo-100 whitespace-nowrap">
            Selesai
          </button>
          <button className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-50/70 text-slate-600 hover:bg-indigo-100 whitespace-nowrap">
            Dibatalkan
          </button>
        </div>

        {/* Card List */}
        <div className="space-y-4">

          {filteredHistory.map((h) => (

            <div
              key={h.HistoryID}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
                  <span>🧹</span>
                  <span>{h.job}</span>
                </div>
                <span className="text-xs font-extrabold tracking-wide text-emerald-700">
                  {h.status}
                </span>
              </div>

              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={h.avatar}
                  alt={h.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{h.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{h.bookingDate} • {h.startedAt}</p>
                </div>
              </div>

              <hr className="border-slate-100 mb-3" />

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-0.5">Rating Diberikan</p>
                  <div className="flex text-amber-400 text-sm space-x-0.5">
                    ★ ★ ★ ★ ★
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500 font-medium">Total Bayar</p>
                  <p className="font-bold text-base text-teal-800">Rp 150.000</p>
                </div>
              </div>
            </div>
          ))
          }
        </div>

      </div>
    </MobileLayout>
  );
}
