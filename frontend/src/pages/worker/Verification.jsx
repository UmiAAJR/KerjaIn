import React, { useState, useEffect } from 'react';
import { workerApi } from '../../services/api';
import MobileLayout from "../../components/layout/MobileLayout";
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Camera, 
  CreditCard, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2,
  ChevronLeft,
  AlertTriangle
} from 'lucide-react';

export default function WorkerVerification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form Upload State (Base64 data URLs)
  const [ktpPhoto, setKtpPhoto] = useState(null);
  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetched Verification Status Data
  const [verificationData, setVerificationData] = useState({
    status: 'unverified', // 'pending' | 'accepted' | 'Approved' | 'rejected' | 'unverified'
    submittedAt: '',
    ktpPhotoUrl: '',
    selfiePhotoUrl: '',
  });

  const currentWorkerId = localStorage.getItem('workerId') || 'me';

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      setLoading(true);
      try {
        const [verifRes, profileRes] = await Promise.allSettled([
          workerApi.getVerification(currentWorkerId),
          workerApi.getProfile(currentWorkerId)
        ]);

        if (verifRes.status === 'fulfilled' && verifRes.value) {
          const verif = verifRes.value;
          setIsSubmitted(true);
          setVerificationData({
            status: verif.status || 'pending',
            submittedAt: verif.createdAt ? String(verif.createdAt).slice(0, 16).replace('T', ' ') : 'Baru Saja',
            ktpPhotoUrl: verif.ktpPhoto || '',
            selfiePhotoUrl: verif.selfiePhoto || '',
          });
          if (verif.selfiePhoto) {
            setSelfiePhoto(verif.selfiePhoto);
          }
          if (verif.ktpPhoto) {
            setKtpPhoto(verif.ktpPhoto);
          }
        }

        // Auto pre-fill selfie photo from worker's profile photo if selfiePhoto is not set yet
        if (profileRes.status === 'fulfilled' && profileRes.value) {
          const profilePhoto = profileRes.value.photo || profileRes.value.avatar || profileRes.value.User?.photo;
          if (profilePhoto && !selfiePhoto) {
            setSelfiePhoto(profilePhoto);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data verifikasi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, []);

  // Handler FileReader untuk konversi gambar ke Base64 Data URL
  const handleImageChange = (e, setPhotoState) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showAlert("Ukuran File Terlalu Besar", "warning", "Ukuran file maksimal 8MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoState(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler Submit Form Verifikasi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ktpPhoto || !selfiePhoto) {
      showAlert("Data Tidak Lengkap", "warning", "Harap unggah kedua foto (KTP & Selfie dengan KTP) terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);
    try {
      await workerApi.submitVerification(currentWorkerId, {
        ktpPhoto: ktpPhoto,
        selfiePhoto: selfiePhoto
      });

      setIsSubmitted(true);
      setVerificationData({
        status: 'pending',
        submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        ktpPhotoUrl: ktpPhoto,
        selfiePhotoUrl: selfiePhoto,
      });
      showAlert("Berhasil", "success", "Dokumen verifikasi berhasil dikirim! Tim kami akan meninjau dokumen Anda.");
    } catch (err) {
      showAlert("Gagal", "error", 'Gagal mengirimkan dokumen verifikasi: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout topNavProps={{ variant: "brand", brandName: "Verifikasi Identitas" }}>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#007088] mb-2" />
          <p className="text-xs font-semibold text-slate-500">Memuat status verifikasi...</p>
        </div>
      </MobileLayout>
    );
  }

  const isApproved = ['accepted', 'approved', 'verified'].includes((verificationData.status || '').toLowerCase());
  const isRejected = (verificationData.status || '').toLowerCase() === 'rejected';

  return (
    <MobileLayout
      topNavProps={{
        variant: "brand",
        brandName: "Verifikasi Identitas",
        hasNotification: false,
      }}
      bottomNavProps={{
        activeTab: "profile",
      }}
    >
      <div className="flex flex-col space-y-4 p-4 pb-24 w-full max-w-md mx-auto text-left">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate('/worker/dashboard')}
          className="flex items-center gap-1 text-xs font-extrabold text-[#007088] hover:underline cursor-pointer"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          <span>Kembali ke Dasbor Pekerja</span>
        </button>

        {/* HEADER INFORMATION CARD */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-cyan-50 p-4 border border-cyan-100">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#007088] text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
              Verifikasi Akun Pekerja
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Verifikasi KTP dan Foto Selfie diperlukan agar kamu dapat menerima tawaran pekerjaan dan melakukan penarikan saldo.
            </p>
          </div>
        </div>

        {/* ==================== FORM UPLOAD (BELUM SUBMIT / REJECTED) ==================== */}
        {!isSubmitted || isRejected ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {isRejected && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-800 font-medium">
                  <span className="font-extrabold block">Pengajuan Verifikasi Sebelumnya Ditolak</span>
                  Silakan unggah ulang Foto KTP dan Selfie dengan jelas sesuai petunjuk.
                </div>
              </div>
            )}

            {/* UPLOAD FOTO KTP */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#007088]" />
                <span>Foto KTP / Kartu Identitas</span>
              </label>

              <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:bg-slate-100">
                {ktpPhoto ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={ktpPhoto} 
                      alt="Preview KTP" 
                      className="w-full h-full object-cover" 
                    />
                    <label 
                      htmlFor="ktpInput"
                      className="absolute bottom-2 right-2 rounded-lg bg-black/75 px-3 py-1.5 text-xs font-bold text-white cursor-pointer hover:bg-black"
                    >
                      Ganti Foto
                    </label>
                  </div>
                ) : (
                  <label htmlFor="ktpInput" className="flex flex-col items-center cursor-pointer py-4 text-center">
                    <UploadCloud className="h-10 w-10 text-[#007088] mb-2" />
                    <span className="text-xs font-bold text-slate-700">Klik untuk unggah Foto KTP</span>
                    <span className="text-[11px] text-slate-400 mt-1">Format: JPG, PNG (Teks KTP harus terbaca jelas)</span>
                  </label>
                )}
                <input 
                  id="ktpInput"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setKtpPhoto)}
                  className="hidden" 
                />
              </div>
            </div>

            {/* UPLOAD FOTO SELFIE */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-[#007088]" />
                  <span>Foto Selfie Pegang KTP</span>
                </label>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  Terisi otomatis dari foto profil
                </span>
              </div>

              <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:bg-slate-100">
                {selfiePhoto ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={selfiePhoto} 
                      alt="Preview Selfie" 
                      className="w-full h-full object-cover" 
                    />
                    <label 
                      htmlFor="selfieInput"
                      className="absolute bottom-2 right-2 rounded-lg bg-black/75 px-3 py-1.5 text-xs font-bold text-white cursor-pointer hover:bg-black"
                    >
                      Ganti Foto
                    </label>
                  </div>
                ) : (
                  <label htmlFor="selfieInput" className="flex flex-col items-center cursor-pointer py-4 text-center">
                    <UploadCloud className="h-10 w-10 text-[#007088] mb-2" />
                    <span className="text-xs font-bold text-slate-700">Klik untuk unggah Foto Selfie</span>
                    <span className="text-[11px] text-slate-400 mt-1">Wajah & KTP harus terlihat jelas secara bersamaan</span>
                  </label>
                )}
                <input 
                  id="selfieInput"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setSelfiePhoto)}
                  className="hidden" 
                />
              </div>
            </div>

            {/* TOMBOL SUBMIT VERIFIKASI */}
            <button
              type="submit"
              disabled={isSubmitting || !ktpPhoto || !selfiePhoto}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#007088] hover:bg-[#005c70] py-3.5 px-4 font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Mengirimkan Dokumen...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Kirim Dokumen Verifikasi</span>
                </>
              )}
            </button>

          </form>

        /* ==================== STATUS VERIFIKASI (SUDAH SUBMIT) ==================== */
        ) : (
          <div className="space-y-4">
            
            {/* BADGE STATUS DARI DATABASE */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-center">
              
              {/* Status Pending */}
              {!isApproved && (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-3">
                    <Clock className="h-8 w-8 animate-pulse" />
                  </div>
                  <span className="rounded-md bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 tracking-wider uppercase mb-1">
                    Sedang Diproses
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-1">Verifikasi Dalam Tinjauan Admin</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-xs leading-relaxed">
                    Dokumen identitas Anda sedang ditinjau oleh tim verifikator KerjaIn. Proses ini membutuhkan waktu maksimal 1x24 jam.
                  </p>
                </>
              )}

              {/* Status Approved */}
              {isApproved && (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 tracking-wider uppercase mb-1">
                    Terverifikasi
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-1">Identitas Berhasil Diverifikasi</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-xs leading-relaxed">
                    Selamat! Akun pekerja Anda telah aktif sepenuhnya. Anda sudah dapat menerima orderan pekerjaan dan melakukan penarikan saldo.
                  </p>
                </>
              )}

              {verificationData.submittedAt && (
                <div className="mt-4 border-t border-slate-100 pt-3 w-full text-[11px] text-slate-400">
                  Diajukan pada: <span className="font-semibold text-slate-600">{verificationData.submittedAt}</span>
                </div>
              )}
            </div>

            {/* PREVIEW DOKUMEN YANG DIUNGGAH */}
            {(verificationData.ktpPhotoUrl || verificationData.selfiePhotoUrl) && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                  Dokumen Terlampir
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {/* Foto KTP */}
                  {verificationData.ktpPhotoUrl && (
                    <div className="flex flex-col space-y-1">
                      <span className="text-[11px] font-bold text-slate-600">Foto KTP</span>
                      <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img 
                          src={verificationData.ktpPhotoUrl} 
                          alt="KTP" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                  )}

                  {/* Foto Selfie */}
                  {verificationData.selfiePhotoUrl && (
                    <div className="flex flex-col space-y-1">
                      <span className="text-[11px] font-bold text-slate-700">Foto Selfie</span>
                      <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img 
                          src={verificationData.selfiePhotoUrl} 
                          alt="Selfie" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </MobileLayout>
  );
}