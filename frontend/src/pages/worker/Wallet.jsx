import React from 'react';
import { workerApi } from '../../services/api';
import MobileLayout from "../../components/layout/MobileLayout";
import { Link, useNavigate } from 'react-router-dom';
import { 
  BadgeCheck, 
  Banknote, 
  TrendingUp, 
  Star, 
  ArrowUp, 
  Building2, 
  ListFilter, 
  Download, 
  Briefcase, 
  Wallet, 
  Wrench 
} from 'lucide-react';

export default function WorkerWallet() {
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
      {/* WRAPPER UTAMA DENGAN PADDING KONSISTEN */}
      <div className="flex flex-col space-y-4 p-4 pb-20 w-full max-w-md mx-auto">
        
        {/* ==================== 1. KARTU SALDO UTAMA ==================== */}
        <div className="w-full rounded-3xl bg-[#007088] p-6 text-white shadow-md">
          <div className="flex flex-col space-y-5">
            {/* Info Saldo */}
            <div>
              <p className="text-sm font-medium text-cyan-100/90">
                Saldo yang Bisa Ditarik
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-cyan-100">
                  Rp
                </span>
                <span className="text-4xl font-extrabold tracking-tight text-white">
                  2.450.000
                </span>
              </div>
            </div>

            {/* Badge Verifikasi */}
            <div className="flex items-center gap-2 text-xs font-medium text-cyan-100/90">
              <BadgeCheck className="h-4 w-4 fill-cyan-100 text-[#007088]" />
              <span>Akun Terverifikasi & Aman</span>
            </div>

            {/* Tombol Tarik Saldo */}
            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FFA216] py-3.5 px-4 font-bold text-[#4A2800] transition hover:bg-[#ff9500] active:scale-[0.98]">
              <Banknote className="h-5 w-5 stroke-[2.5]" />
              <span className="text-base">Tarik Saldo</span>
            </button>

            {/* Estimasi Pencairan */}
            <p className="text-center text-xs font-medium text-cyan-100/70 pt-0.5">
              Estimasi pencairan: 1-2 jam kerja
            </p>
          </div>
        </div>


        {/* ==================== 2. GRID METRICS (2 KOLOM) ==================== */}
        <div className="grid grid-cols-2 gap-3.5 w-full">
          
          {/* Kartu Pendapatan */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-[#F3F6FD] p-4 shadow-sm">
            <div className="space-y-3">
              <TrendingUp className="h-6 w-6 text-[#005B66]" />
              <p className="text-sm font-bold text-slate-700 leading-tight">
                Pendapatan<br />Bulan Ini
              </p>
              <div className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                <span className="text-xl">Rp </span>
                <span>8.200.</span>
                <br />
                <span>000</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#005B66]">
              <ArrowUp className="h-3.5 w-3.5 stroke-3" />
              <span>12% dari bln lalu</span>
            </div>
          </div>

          {/* Kartu Skor Kepercayaan */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-[#F3F6FD] p-4 shadow-sm">
            <div className="space-y-3">
              <Star className="h-6 w-6 text-[#8B5E14]" />
              <p className="text-sm font-bold text-slate-700 leading-tight">
                Skor<br />Kepercayaan
              </p>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  98/100
                </span>
                <span className="text-[11px] font-bold text-[#8B5E14] leading-tight">
                  Sangat<br />Baik
                </span>
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
              <div className="bg-[#8B5E14] h-full rounded-full w-[98%]" />
            </div>
          </div>

        </div>


        {/* ==================== 3. REKENING TERHUBUNG ==================== */}
        <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-[#E8F0FE] p-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#005B66] text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-base font-bold leading-tight text-slate-900">
                Rekening Terhubung
              </h4>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                Bank Central Asia • **** 9012
              </p>
            </div>
          </div>
          <button
            type="button"
            className="text-sm font-bold text-[#005B66] transition hover:underline active:opacity-80"
          >
            Ubah
          </button>
        </div>


        {/* ==================== 4. HEADER RIWAYAT TRANSAKSI ==================== */}
        <div className="flex w-full items-center justify-between pt-2">
          <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
            Riwayat<br />Transaksi
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-[#D2E3FC] active:scale-95"
            >
              <ListFilter className="h-4 w-4 stroke-[2.5]" />
              <span>Filter</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-[#D2E3FC] active:scale-95"
            >
              <Download className="h-4 w-4 stroke-[2.5]" />
              <span>Laporan</span>
            </button>
          </div>
        </div>


        {/* ==================== 5. DAFTAR TRANSAKSI (HARDCODED) ==================== */}
        <div className="space-y-3 w-full">
          
          {/* Item 1: Pembersihan Taman */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F1] text-[#005B66]">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-extrabold text-gray leading-snug">
                  Pembersihan Taman Rumah
                </h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  12 Okt 2023 • 14:20
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
              <span className="text-sm font-extrabold leading-tight text-[#005B66]">
                + Rp 350.000
              </span>
              <span className="rounded-md bg-[#76E7B1] px-2 py-0.5 text-[10px] font-black tracking-wide text-[#004852]">
                SELESAI
              </span>
            </div>
          </div>

          {/* Item 2: Penarikan Saldo */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FEF3E2] text-[#8B5E14]">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-extrabold text-gray leading-snug">
                  Penarikan Saldo ke BCA
                </h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  10 Okt 2023 • 09:15
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
              <span className="text-sm font-extrabold leading-tight text-gray">
                - Rp 1.200.000
              </span>
              <span className="rounded-md bg-[#76E7B1] px-2 py-0.5 text-[10px] font-black tracking-wide text-[#004852]">
                SELESAI
              </span>
            </div>
          </div>

          {/* Item 3: Reparasi Kran */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                <Wrench className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-extrabold text-gray leading-snug">
                  Reparasi Kran Bocor (2 Titik)
                </h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  09 Okt 2023 • 17:45
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
              <span className="text-sm font-extrabold leading-tight text-[#005B66]">
                + Rp 150.000
              </span>
              <span className="rounded-md bg-[#FDE3C2] px-2 py-0.5 text-[10px] font-black tracking-wide text-[#7A4B00]">
                TERTUNDA
              </span>
            </div>
          </div>

        </div>

      </div>
    </MobileLayout>
  );
}