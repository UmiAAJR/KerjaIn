import React, { useState } from 'react'; // 1. Tambahkan useState di sini
import { workerApi } from '../../services/api';
import MobileLayout from "../../components/layout/MobileLayout";
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Camera, 
  CreditCard, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText,
  ChevronRight
} from 'lucide-react';

export default function WorkerVerification() {
  // Simulasi state apakah user sudah submit data verifikasi sebelumnya
  const [isSubmitted, setIsSubmitted] = useState(false);

  // State Form Upload
  const [ktpPreview, setKtpPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dummy Status Data (Sesuaikan dengan field DB: status, submittedAt, dll)
  const verificationData = {
    status: 'Pending', // Pilihan: 'Pending', 'Approved', 'Rejected'
    submittedAt: '24 Okt 2023 • 10:30',
    ktpPhotoUrl: ktpPreview || 'https://via.placeholder.com/300x180',
    selfiePhotoUrl: selfiePreview || 'https://via.placeholder.com/300x300',
  };

  // Handler Preview Gambar
  const handleImageChange = (e, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handler Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ktpPreview || !selfiePreview) {
      alert('Harap unggah kedua foto (KTP & Selfie) terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    // Simulasikan Request API ke Backend (misal workerApi.submitVerification)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <MobileLayout
      topNavProps={{
        title: "Verifikasi Identitas",
        showBackButton: true,
      }}
      bottomNavProps={{
        activeTab: "profile",
      }}
    >
      <div className="flex flex-col space-y-5 p-4 pb-20 w-full max-w-md mx-auto">

        {/* HEADER INFORMATION CARD */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-[#E8F0FE] p-4 border border-blue-100">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#007088] text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
              Verifikasi Akun Pekerja
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Verifikasi KTP dan Selfie diperlukan agar kamu dapat menerima tawaran pekerjaan dan menarik saldo.
            </p>
          </div>
        </div>


        {/* ==================== KONDISI 1: FORM UPLOAD (BELUM SUBMIT) ==================== */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* UPLOAD FOTO KTP */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#005B66]" />
                <span>Foto KTP / Identitas</span>
              </label>

              <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:bg-slate-100">
                {ktpPreview ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={ktpPreview} 
                      alt="Preview KTP" 
                      className="w-full h-full object-cover" 
                    />
                    <label 
                      htmlFor="ktpInput"
                      className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-semibold text-white cursor-pointer hover:bg-black/80"
                    >
                      Ganti Foto
                    </label>
                  </div>
                ) : (
                  <label htmlFor="ktpInput" className="flex flex-col items-center cursor-pointer py-4">
                    <UploadCloud className="h-10 w-10 text-[#007088] mb-2" />
                    <span className="text-xs font-bold text-slate-700">Klik untuk unggah Foto KTP</span>
                    <span className="text-[11px] text-slate-400 mt-1">Format: JPG, PNG (Maks 5MB)</span>
                  </label>
                )}
                <input 
                  id="ktpInput"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setKtpPreview)}
                  className="hidden" 
                />
              </div>
            </div>


            {/* UPLOAD FOTO SELFIE */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Camera className="h-4 w-4 text-[#005B66]" />
                <span>Foto Selfie dengan KTP</span>
              </label>

              <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:bg-slate-100">
                {selfiePreview ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={selfiePreview} 
                      alt="Preview Selfie" 
                      className="w-full h-full object-cover" 
                    />
                    <label 
                      htmlFor="selfieInput"
                      className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-semibold text-white cursor-pointer hover:bg-black/80"
                    >
                      Ganti Foto
                    </label>
                  </div>
                ) : (
                  <label htmlFor="selfieInput" className="flex flex-col items-center cursor-pointer py-4">
                    <UploadCloud className="h-10 w-10 text-[#007088] mb-2" />
                    <span className="text-xs font-bold text-slate-700">Klik untuk unggah Foto Selfie</span>
                    <span className="text-[11px] text-slate-400 mt-1">Wajah & KTP harus terlihat jelas</span>
                  </label>
                )}
                <input 
                  id="selfieInput"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setSelfiePreview)}
                  className="hidden" 
                />
              </div>
            </div>


            {/* TOMBOL SUBMIT */}
            <button
              type="submit"
              disabled={isSubmitting || !ktpPreview || !selfiePreview}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#007088] py-3.5 px-4 font-bold text-white shadow-md transition hover:bg-[#005B66] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Mengirim...</span>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Kirim Dokumen Verifikasi</span>
                </>
              )}
            </button>

          </form>


        /* ==================== KONDISI 2: STATUS VERIFIKASI (SUDAH SUBMIT) ==================== */
        ) : (
          <div className="space-y-4">
            
            {/* BADGE STATUS DARI DATABASE */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
              
              {/* Status Pending */}
              {verificationData.status === 'Pending' && (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-3">
                    <Clock className="h-8 w-8" />
                  </div>
                  <span className="rounded-md bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 tracking-wider uppercase mb-1">
                    Sedang Diproses
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mt-1">Verifikasi Dalam Tinjauan</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Dokumen kamu sedang ditinjau oleh tim kami. Proses ini membutuhkan waktu maksimal 1x24 jam.
                  </p>
                </>
              )}

              {/* Status Approved */}
              {verificationData.status === 'Approved' && (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 tracking-wider uppercase mb-1">
                    Terverifikasi
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mt-1">Identitas Berhasil Diverifikasi</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Selamat! Akun kamu telah aktif sepenuhnya untuk menerima orderan dan penarikan saldo.
                  </p>
                </>
              )}

              {/* Status Rejected */}
              {verificationData.status === 'Rejected' && (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
                    <XCircle className="h-8 w-8" />
                  </div>
                  <span className="rounded-md bg-rose-100 px-3 py-1 text-xs font-black text-rose-800 tracking-wider uppercase mb-1">
                    Ditolak
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mt-1">Verifikasi Gagal</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Foto KTP kurang jelas/buram. Silakan lakukan pengunggahan ulang dokumen kamu.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4 text-xs font-bold text-[#007088] underline"
                  >
                    Unggah Ulang Dokumen
                  </button>
                </>
              )}

              <div className="mt-4 border-t border-slate-100 pt-3 w-full text-xs text-slate-400">
                Diajukan pada: <span className="font-semibold text-slate-600">{verificationData.submittedAt}</span>
              </div>
            </div>

            {/* PREVIEW DOKUMEN YANG DIUNGGAH */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Dokumen Terlampir
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* Foto KTP */}
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold text-slate-700">Foto KTP</span>
                  <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img 
                      src={verificationData.ktpPhotoUrl} 
                      alt="KTP" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>

                {/* Foto Selfie */}
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold text-slate-700">Foto Selfie</span>
                  <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img 
                      src={verificationData.selfiePhotoUrl} 
                      alt="Selfie" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </MobileLayout>
  );
}