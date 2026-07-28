import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workerApi } from '../../services/api'; // Sesuaikan lokasi api service kamu
import MobileLayout from "../../components/layout/MobileLayout";
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Wrench, 
  FileText, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Navigation
} from 'lucide-react';

export default function WorkerDetailPekerjaan() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobDetail, setJobDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // FETCH DATA DETAIL PEKERJAAN DARI API
  useEffect(() => {
    setLoading(true);
    const targetJobId = jobId || 'JOB-12345'; // Fallback ID jika tidak ada di URL param

    workerApi.getJobDetail(targetJobId)
      .then((res) => {
        const data = res.data || res;
        setJobDetail(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil detail pekerjaan:", err);
        setLoading(false);
      });
  }, [jobId]);

  // HANDLER UNTUK MERUBAH STATUS PEKERJAAN (TERIMA / TOLAK / SELESAI)
  const handleUpdateStatus = (newStatus) => {
    setActionLoading(true);
    workerApi.updateJobStatus(jobDetail?.id || jobId, newStatus)
      .then(() => {
        setJobDetail((prev) => ({ ...prev, status: newStatus }));
        setActionLoading(false);
      })
      .catch((err) => {
        console.error(`Gagal mengubah status ke ${newStatus}:`, err);
        setActionLoading(false);
      });
  };

  if (loading) {
    return (
      <MobileLayout topNavProps={{ variant: "location" }} bottomNavProps={{ activeTab: "activity" }}>
        <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#007088] mb-2" />
          <p className="text-xs font-medium">Memuat detail pekerjaan...</p>
        </div>
      </MobileLayout>
    );
  }

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
      <div className="flex flex-col space-y-4 p-4 pb-24 w-full max-w-md mx-auto">
        
        {/* TOP BAR / NAVIGASI KEMBALI */}
        <div className="flex items-center gap-3 pt-1">
          <button 
            type="button" 
            onClick={() => navigate(`/worker/activity`)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-extrabold text-slate-900">Detail Pesanan Masuk</h2>
        </div>

        {/* ==================== 1. INFORMASI CLIENT (PEMESAN) ==================== */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E6F4F1] text-[#005B66] font-bold text-lg">
              {jobDetail?.clientName ? jobDetail.clientName.charAt(0) : <User className="h-6 w-6" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-wide uppercase text-slate-400">Pemesan Jasa</span>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {jobDetail?.clientName || "Pelanggan"}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {jobDetail?.clientPhone || "0812-xxxx-xxxx"}
              </p>
            </div>
          </div>

          {/* Akses Cepat Hubungi Client */}
          <div className="flex items-center gap-2">
            <a 
              href={`tel:${jobDetail?.clientPhone}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8] hover:bg-[#D2E3FC] transition"
            >
              <Phone className="h-4 w-4" />
            </a>
            <a 
              href={`https://wa.me/${jobDetail?.clientPhone}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E6F4F1] text-[#005B66] hover:bg-[#cbebe5] transition"
            >
              <MessageSquare className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* ==================== 2. KARTU DETAIL PEKERJAAN ==================== */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-base font-extrabold text-slate-900">Rincian Tugas</h4>
            <span className={`rounded-md px-2.5 py-1 text-[10px] font-black tracking-wide ${
              jobDetail?.status === 'ACCEPTED' ? 'bg-[#76E7B1] text-[#004852]' :
              jobDetail?.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
              'bg-[#FDE3C2] text-[#7A4B00]'
            }`}>
              {jobDetail?.status || 'MENUNGGU KONFIRMASI'}
            </span>
          </div>

          {/* Layanan / Skill */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#E6F4F1] text-[#005B66] mt-0.5">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Layanan / Skill Jasa</p>
              <p className="text-sm font-extrabold text-slate-800">{jobDetail?.serviceName || "Instalasi Listrik"}</p>
            </div>
          </div>

          {/* Tanggal & Jam Mulai */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#E8F0FE] text-[#1A73E8] mt-0.5">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Tanggal Kerja</p>
                <p className="text-xs font-bold text-slate-800">{jobDetail?.date || "12 Okt 2026"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#FEF3E2] text-[#8B5E14] mt-0.5">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Jam Mulai</p>
                <p className="text-xs font-bold text-slate-800">{jobDetail?.startTime || "09:00 WIB"}</p>
              </div>
            </div>
          </div>

          {/* Estimasi Durasi */}
          <div className="pt-1">
            <p className="text-xs font-semibold text-slate-400 mb-1">Estimasi Durasi Kerja</p>
            <div className="inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
              {jobDetail?.duration || "2 Jam Kerja"}
            </div>
          </div>

          {/* Alamat Lengkap */}
          <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
            <div className="p-2 rounded-xl bg-[#E6F4F1] text-[#005B66] mt-0.5">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400">Alamat Pengerjaan</p>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(jobDetail?.address || "")}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-bold text-[#007088] hover:underline"
                >
                  <Navigation className="h-3 w-3" /> Petunjuk Arah
                </a>
              </div>
              <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-relaxed">
                {jobDetail?.address || "Jl. Sudirman No. 12, Jakarta Selatan"}
              </p>
            </div>
          </div>

          {/* Deskripsi Masalah */}
          <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600 mt-0.5">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Deskripsi Masalah / Tugas</p>
              <p className="text-xs font-medium text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {jobDetail?.description || "Tidak ada deskripsi tambahan dari pelanggan."}
              </p>
            </div>
          </div>

        </div>

        {/* ==================== 3. RINCIAN PENDAPATAN WORKER ==================== */}
        <div className="rounded-2xl border border-slate-200/80 bg-[#E6F4F1]/60 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#005B66]">Estimasi Pendapatan</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Tarif Jasa: Rp {jobDetail?.hourlyRate?.toLocaleString('id-ID') || "35.000"}/Jam</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-[#005B66]">
              Rp {jobDetail?.totalFee ? jobDetail.totalFee.toLocaleString('id-ID') : "70.000"}
            </span>
          </div>
        </div>

        {/* ==================== 4. TOMBOL AKSI WORKER ==================== */}
        <div className="pt-2">
          {actionLoading ? (
            <div className="flex justify-center p-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#007088]" />
            </div>
          ) : jobDetail?.status === 'ACCEPTED' ? (
            <button
              type="button"
              onClick={() => handleUpdateStatus('COMPLETED')}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#007088] py-3.5 font-bold text-white shadow-md hover:bg-[#005B66] active:scale-[0.98] transition"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Selesaikan Pekerjaan</span>
            </button>
          ) : jobDetail?.status === 'COMPLETED' ? (
            <div className="p-3 text-center text-xs font-bold text-[#005B66] bg-[#E6F4F1] rounded-full">
              Pekerjaan Ini telah Selesai
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleUpdateStatus('REJECTED')}
                className="flex items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50 py-3 font-bold text-red-600 hover:bg-red-100 active:scale-[0.98] transition"
              >
                <XCircle className="h-4 w-4" />
                <span>Tolak</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('ACCEPTED')}
                className="flex items-center justify-center gap-1.5 rounded-full bg-[#007088] py-3 font-bold text-white shadow-md hover:bg-[#005B66] active:scale-[0.98] transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Terima Pekerjaan</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </MobileLayout>
  );
}