import React, { useEffect, useState } from 'react'
import { workerApi } from '../../services/api';
import MobileLayout from "../../components/layout/MobileLayout";
import { Link, useNavigate } from 'react-router-dom';
import { useMap } from 'react-leaflet/hooks'
import {
  TrendingUp, History, Zap, ClipboardCheck, Clock, Timer, Star, Calendar, MapPin

} from 'lucide-react';
import { Marker, Popup, MapContainer, TileLayer } from 'react-leaflet';

export default function WorkerDashboard() {

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
      <div className="px-5 pt-5 pb-8 space-y-6 relative">
        {/* Heading */}
        <div>
          <h2 className="text-2xl font-black text-primary-600 font-heading tracking-tight leading-tight">
            Halo, AAJR
          </h2>
          <h3 className="text-sm text-gray-500">
            siap untuk menyelesaikan pekerjaan hari ini ?
          </h3>
        </div>

        {/* Box Saldo dan Riwayat */}
        <div className="relative w-full max-w-sm rounded-2xl bg-[#0e7490] p-5 text-white shadow-md">
          <div className="relative z-10">
            <p className="text-md font-medium text-cyan-100/80">Saldo Anda</p>
            <h2 className="mt-2 mb-4 text-3xl font-bold tracking-tight leading-tight text-white">
              Rp 2.500.000
            </h2>

            {/* Tombol Tarik Dana & Riwayat */}
            <div className="flex gap-3">
              <Link to={"/worker/wallet"} className="flex-1 rounded-xl bg-[#dbeefd] py-3 text-center font-semibold text-[#0e7490] transition hover:bg-white active:scale-[0.98]">
                Tarik Dana
              </Link>

              <button
                className="flex items-center justify-center rounded-xl border border-white/40 p-3 text-white transition hover:bg-white/10 active:scale-95"
                aria-label="Riwayat Transaksi"
              >
                <History className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* RINGKASAN PENDAPATAN */}
        <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-[#F3F6FD] p-5 shadow-sm">
          {/* Header Ringkasan */}
          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              RINGKASAN PENDAPATAN
            </span>
            <TrendingUp className="h-5 w-5 text-[#005B66]" />
          </div>

          {/* Grid 3 Kolom */}
          <div className="grid grid-cols-3 divide-x divide-slate-300">
            {/* Hari Ini */}
            <div className="flex flex-col items-center justify-center px-1">
              <p className="text-xs font-medium text-slate-600">Hari Ini</p>
              <div className="mt-1 text-center">
                <p className="text-xl font-extrabold leading-tight text-gray-900">
                  Rp
                </p>
                <p className="text-xl font-extrabold leading-tight text-gray-900">
                  350k
                </p>
              </div>
            </div>

            {/* Minggu Ini */}
            <div className="flex flex-col items-center justify-center px-1">
              <p className="text-xs font-medium text-slate-600">Minggu Ini</p>
              <div className="mt-1 text-center">
                <p className="text-xl font-extrabold leading-tight text-gray-900">
                  Rp
                </p>
                <p className="text-xl font-extrabold leading-tight text-gray-900">
                  1.8M
                </p>
              </div>
            </div>

            {/* Bulan Ini */}
            <div className="flex flex-col items-center justify-center px-1">
              <p className="text-xs font-medium text-slate-600">Bulan Ini</p>
              <div className="mt-1 text-center">
                <p className="text-xl font-extrabold leading-tight text-[#005B66]">
                  Rp
                </p>
                <p className="text-xl font-extrabold leading-tight text-[#005B66]">
                  5.2M
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Container Scroll Horizontal */}

        <div className="no-scrollbar overflow-x-auto flex items-center gap-3.5 ">
          <div className="flex flex-row shrink-0 w-48 rounded-2xl bg-[#f9e8d1] border border-[#fbcd87] p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fea619]">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold leading-tight pl-4">2</span>
              <p className="text-xs font-medium text-black-100/80 pl-4">Order Aktif</p>
            </div>
          </div>

          <div className="flex flex-row shrink-0 w-48 rounded-2xl bg-[#f9e8d1] border border-[#fbcd87] p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fea619]">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold leading-tight pl-4">2</span>
              <p className="text-xs font-medium text-black-100/80 pl-4">Order Aktif</p>
            </div>
          </div>

          <div className="flex flex-row shrink-0 w-48 rounded-2xl bg-[#f9e8d1] border border-[#fbcd87] p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fea619]">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold leading-tight pl-4">2</span>
              <p className="text-xs font-medium text-black-100/80 pl-4">Order Aktif</p>
            </div>
          </div>
        </div>

        {/* PEKERJAAN SELANJUTNYA */}
        <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">

          {/* 1. BADGE JAM */}
          <div className="absolute top-0 right-0 rounded-bl-xl bg-[#F9A825] px-3 py-1">
            <span className="text-xs font-bold text-[#5D3A00]">
              Mulai 14:00
            </span>
          </div>

          {/* 2. ROW 1: HEADER PROFIL */}
          <div className="flex items-center gap-3 pt-1">
            {/* Col 1: Foto Profil */}
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&auto=format&fit=crop&q=60"
              alt="Pak Hermawan"
              className="h-16 w-16 rounded-xl object-cover"
            />

            {/* Col 2: Info Pekerja */}
            <div className="flex flex-col justify-center">
              <span className="text-xs font-bold text-[#005B66]">
                Cleaning Service Pro
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                Pak Hermawan
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-600 font-medium mt-0.5">
                <Star className="h-3.5 w-3.5 fill-slate-800 text-slate-800" />
                <span>4.9 (Top Client)</span>
              </div>
            </div>
          </div>

          {/* 3. GARIS PEMISAH */}
          <div className="border-b border-slate-200/80 my-1" />

          {/* 4. ROW 2: TANGGAL */}
          <div className="flex items-center gap-3 text-slate-700">
            <Calendar className="h-5 w-5 text-slate-500 shrink-0" />
            <span className="text-sm font-semibold">Selasa, 24 Okt 2023</span>
          </div>

          {/* 5. ROW 3: LOKASI */}
          <div className="flex items-center gap-3 text-slate-700">
            <MapPin className="h-5 w-5 text-slate-500 shrink-0" />
            <span className="text-sm font-semibold">Pondok Indah, Jakarta Selatan</span>
          </div>

          {/* 6. ROW 4: TOMBOL AKSI */}
          <button className="mt-2 w-full rounded-xl bg-[#005B66] py-3 text-center text-sm font-bold text-white transition hover:bg-[#004852] active:scale-[0.98]">
            Lihat Detail Pekerjaan
          </button>


        </div>
        <MapContainer attributionControl className='w-full h-60' center={[-7.2575, 112.7521]} zoom={13} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker  position={[ -7.2575, 112.7521]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>





      </div>
    </MobileLayout>
  );
}