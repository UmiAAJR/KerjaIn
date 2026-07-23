import React from 'react'
import { workerApi } from '../../services/api';
import MobileLayout from "../../components/layout/MobileLayout";
import { Link, useNavigate } from 'react-router-dom';


export default function WorkerHistory() {
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
      <div className="p-4 max-w-md mx-auto bg-slate-50 min-h-screen">
        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Riwayat Pekerjaan</h1>

        {/* Filter Chips (Horizontal Scrollable) */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar mb-6 pb-2">
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
          {/* CARD 1: SELESAI */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
                <span>🧹</span>
                <span>Kebersihan Rumah</span>
              </div>
              <span className="text-xs font-extrabold tracking-wide text-emerald-700">
                SELESAI
              </span>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
                alt="Siti Rahma"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Siti Rahma</h3>
                <p className="text-xs text-slate-500 font-medium">12 Okt 2023 • 09:00 WIB</p>
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

          {/* CARD 2: DIBATALKAN */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-1.5 bg-sky-50 text-sky-800 px-3 py-1 rounded-full text-xs font-semibold">
                <span>🔧</span>
                <span>Perbaikan Listrik</span>
              </div>
              <span className="text-xs font-extrabold tracking-wide text-red-600">
                DIBATALKAN
              </span>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"
                alt="Andi Saputra"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Andi Saputra</h3>
                <p className="text-xs text-slate-500 font-medium">10 Okt 2023 • 14:30 WIB</p>
              </div>
            </div>

            <hr className="border-slate-100 mb-3" />

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-red-500 font-medium">Oleh Pekerja</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-500 font-medium">Estimasi Harga</p>
                <p className="font-bold text-base text-slate-400 line-through">Rp 220.000</p>
              </div>
            </div>
          </div>

          {/* CARD 3: SELESAI */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
                <span>🪛</span>
                <span>Servis Pompa Air</span>
              </div>
              <span className="text-xs font-extrabold tracking-wide text-emerald-700">
                SELESAI
              </span>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                alt="Budi Utomo"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Budi Utomo</h3>
                <p className="text-xs text-slate-500 font-medium">05 Okt 2023 • 11:15 WIB</p>
              </div>
            </div>

            <hr className="border-slate-100 mb-3" />

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[11px] text-slate-500 font-medium mb-0.5">Rating Diberikan</p>
                <div className="flex text-amber-400 text-sm space-x-0.5">
                  ★ ★ ★ ★ <span className="text-slate-300">★</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-500 font-medium">Total Bayar</p>
                <p className="font-bold text-base text-teal-800">Rp 300.000</p>
              </div>
            </div>
          </div>

          {/* CARD 4: SELESAI */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
                <span>🪴</span>
                <span>Taman & Lanskap</span>
              </div>
              <span className="text-xs font-extrabold tracking-wide text-emerald-700">
                SELESAI
              </span>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                alt="Eko Wahyudi"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Eko Wahyudi</h3>
                <p className="text-xs text-slate-500 font-medium">01 Okt 2023 • 08:00 WIB</p>
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
                <p className="font-bold text-base text-teal-800">Rp 450.000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
