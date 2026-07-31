import React, { useState, useEffect, useRef } from 'react';
import { workerApi } from '../../services/api';
import { showAlert } from '../../utils/swal';
import MobileLayout from "../../components/layout/MobileLayout";
import { useNavigate } from 'react-router-dom';
import { 
  BadgeCheck, 
  Banknote, 
  TrendingUp, 
  Star, 
  ArrowUp, 
  Building2, 
  ListFilter, 
  Briefcase, 
  Wallet, 
  Wrench,
  Loader2,
  Check
} from 'lucide-react';

export default function WorkerWallet() {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // STATE FILTER & WITHDRAW MODAL
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'SELESAI' | 'TERTUNDA'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const filterRef = useRef(null);

  const fetchWallet = () => {
    const currentWorkerId = localStorage.getItem('workerId') || 'me';
    setLoading(true);
    workerApi.getWallet(currentWorkerId)
      .then(res => {
        const responseData = res.data || res;
        setWalletData(responseData);
        setTransactions(responseData.transactions || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil data wallet:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);
    const availableBalance = Number(walletData?.balance || 0);

    if (isNaN(amountNum) || amountNum <= 0) {
      showAlert("Nominal Tidak Valid", "warning", "Masukkan nominal penarikan yang valid!");
      return;
    }

    if (amountNum > availableBalance) {
      showAlert("Saldo Tidak Cukup", "warning", `Nominal penarikan (Rp${amountNum.toLocaleString('id-ID')}) melebihi saldo yang tersedia (Rp${availableBalance.toLocaleString('id-ID')})!`);
      return;
    }

    setSubmittingWithdraw(true);
    try {
      const currentWorkerId = localStorage.getItem('workerId') || 'me';
      await workerApi.withdraw(currentWorkerId, amountNum, {
        bankName: 'BCA',
        bankNumber: walletData?.bankAccount || '1234567890',
        bankAccount: walletData?.bankAccount || 'Pekerja'
      });

      showAlert("Pengajuan Berhasil!", "success", `Pengajuan penarikan sebesar Rp${amountNum.toLocaleString('id-ID')} berhasil dikirim! Admin akan segera melakukan transfer manual ke rekening Anda.`);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      fetchWallet();
    } catch (err) {
      showAlert("Pengajuan Gagal", "error", err.message);
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  // MENUTUP DROPDOWN SAAT KLIK DI LUAR MENU
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // PROSES FILTER DATA TRANSAKSI
  const filteredTransactions = transactions.filter((item) => {
    const statusUpper = item.status?.toUpperCase() || '';
    if (filterStatus === 'SELESAI') return statusUpper === 'SELESAI' || statusUpper === 'COMPLETED';
    if (filterStatus === 'TERTUNDA') return statusUpper === 'TERTUNDA' || statusUpper === 'PENDING';
    return true; // Mode 'ALL'
  });

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'withdrawal':
      case 'penarikan':
        return { icon: Wallet, bg: 'bg-[#FEF3E2]', color: 'text-[#8B5E14]' };
      case 'repair':
      case 'perbaikan':
        return { icon: Wrench, bg: 'bg-[#E8F0FE]', color: 'text-[#1A73E8]' };
      default:
        return { icon: Briefcase, bg: 'bg-[#E6F4F1]', color: 'text-[#005B66]' };
    }
  };

  if (loading) {
    return (
      <MobileLayout topNavProps={{ variant: "location" }} bottomNavProps={{ activeTab: "wallet" }}>
        <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#007088] mb-2" />
          <p className="text-xs font-medium">Memuat dompet...</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      topNavProps={{ variant: "location", hasNotification: true }}
      bottomNavProps={{ activeTab: "wallet" }}
    >
      <div className="flex flex-col space-y-4 p-4 pb-20 w-full max-w-md mx-auto">
        
        {/* ==================== 1. KARTU SALDO UTAMA ==================== */}
        <div className="w-full rounded-3xl bg-[#007088] p-6 text-white shadow-md">
          <div className="flex flex-col space-y-5">
            <div>
              <p className="text-sm font-medium text-cyan-100/90">Saldo yang Bisa Ditarik</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-cyan-100">Rp</span>
                <span className="text-4xl font-extrabold tracking-tight text-white">
                  {walletData?.balance ? walletData.balance.toLocaleString('id-ID') : '0'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-cyan-100/90">
              <BadgeCheck className="h-4 w-4 fill-cyan-100 text-[#007088]" />
              <span>Akun Terverifikasi & Aman</span>
            </div>

            <button 
              onClick={() => setIsWithdrawModalOpen(true)}
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FFA216] py-3.5 px-4 font-bold text-[#4A2800] transition hover:bg-[#ff9500] active:scale-[0.98] cursor-pointer shadow-md"
            >
              <Banknote className="h-5 w-5 stroke-[2.5]" />
              <span className="text-base">Tarik Saldo</span>
            </button>

            <p className="text-center text-xs font-medium text-cyan-100/70 pt-0.5">
              Estimasi pencairan: 1-2 jam kerja
            </p>
          </div>
        </div>

        {/* ==================== 2. GRID METRICS ==================== */}
        <div className="grid grid-cols-2 gap-3.5 w-full">
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-[#F3F6FD] p-4 shadow-sm">
            <div className="space-y-3">
              <TrendingUp className="h-6 w-6 text-[#005B66]" />
              <p className="text-sm font-bold text-slate-700 leading-tight">Pendapatan<br />Bulan Ini</p>
              <div className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                <span className="text-xl">Rp </span>
                <span>{walletData?.monthlyIncome ? walletData.monthlyIncome.toLocaleString('id-ID') : '0'}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#005B66]">
              <ArrowUp className="h-3.5 w-3.5 stroke-3" />
              <span>{walletData?.incomeGrowth || '0'}% dari bln lalu</span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-[#F3F6FD] p-4 shadow-sm">
            <div className="space-y-3">
              <Star className="h-6 w-6 text-[#8B5E14]" />
              <p className="text-sm font-bold text-slate-700 leading-tight">Skor<br />Kepercayaan</p>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {walletData?.trustScore ?? '0'}/100
                </span>
                <span className="text-[11px] font-bold text-[#8B5E14] leading-tight">
                  {walletData?.trustLevel || 'Baik'}
                </span>
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#8B5E14] h-full rounded-full transition-all" 
                style={{ width: `${walletData?.trustScore ?? 0}%` }}
              />
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
              <h4 className="text-base font-bold leading-tight text-slate-900">Rekening Terhubung</h4>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {walletData?.bankAccount || 'Belum terhubung'}
              </p>
            </div>
          </div>
          <button 
          onClick={() => navigate(`/worker/ubahrekening`)}
          type="button" className="text-sm font-bold text-[#005B66] transition hover:underline active:opacity-80">
            Ubah
          </button>
        </div>

        {/* ==================== 4. HEADER & DROPDOWN FILTER ==================== */}
        <div className="flex w-full items-center justify-between pt-2">
          <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
            Riwayat<br />Transaksi
          </h3>
          
          {/* CONTAINER TOMBOL & MENU DROPDOWN */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${
                filterStatus !== 'ALL' 
                  ? 'bg-[#007088] text-white' 
                  : 'bg-[#E8F0FE] text-slate-700 hover:bg-[#D2E3FC]'
              }`}
            >
              <ListFilter className="h-4 w-4 stroke-[2.5]" />
              <span>
                {filterStatus === 'SELESAI' ? 'Selesai' : filterStatus === 'TERTUNDA' ? 'Belum Selesai' : 'Filter'}
              </span>
            </button>

            {/* POPUP DROPDOWN MENU */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => { setFilterStatus('ALL'); setIsFilterOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition"
                >
                  <span>Semua</span>
                  {filterStatus === 'ALL' && <Check className="w-3.5 h-3.5 text-[#007088]" />}
                </button>

                <button
                  type="button"
                  onClick={() => { setFilterStatus('SELESAI'); setIsFilterOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition"
                >
                  <span>Selesai</span>
                  {filterStatus === 'SELESAI' && <Check className="w-3.5 h-3.5 text-[#007088]" />}
                </button>

                <button
                  type="button"
                  onClick={() => { setFilterStatus('TERTUNDA'); setIsFilterOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition"
                >
                  <span>Belum Selesai</span>
                  {filterStatus === 'TERTUNDA' && <Check className="w-3.5 h-3.5 text-[#007088]" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ==================== 5. DAFTAR TRANSAKSI HASIL FILTER ==================== */}
        <div className="space-y-3 w-full">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-100">
              Tidak ada transaksi ditemukan.
            </div>
          ) : (
            filteredTransactions.map((item) => {
              const { icon: IconComp, bg, color } = getTransactionIcon(item.type);
              const statusUpper = item.status?.toUpperCase() || '';
              const isCompleted = statusUpper === 'SELESAI' || statusUpper === 'COMPLETED';
              const isRejected = statusUpper === 'DITOLAK' || statusUpper === 'REJECTED';

              return (
                <div 
                  key={item.id || item._id} 
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg} ${color}`}>
                      <IconComp className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-extrabold text-slate-800 leading-snug">
                        {item.title || item.description}
                      </h4>
                      {item.description && item.title && item.description !== item.title && (
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        {item.date || item.createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                    <span className={`text-sm font-extrabold leading-tight ${
                      item.isIncome !== false ? 'text-[#005B66]' : 'text-slate-700'
                    }`}>
                      {item.amountFormatted || `Rp ${item.amount?.toLocaleString('id-ID')}`}
                    </span>
                    
                    {isCompleted ? (
                      <span className="rounded-md bg-[#76E7B1] px-2 py-0.5 text-[10px] font-black tracking-wide text-[#004852]">
                        SELESAI
                      </span>
                    ) : isRejected ? (
                      <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-black tracking-wide text-rose-700">
                        DITOLAK
                      </span>
                    ) : (
                      <span className="rounded-md bg-[#FDE3C2] px-2 py-0.5 text-[10px] font-black tracking-wide text-[#7A4B00]">
                        TERTUNDA
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL PENARIKAN SALDO */}
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-extrabold text-base">
                  <Banknote className="w-5 h-5 text-[#007088]" />
                  <span>Pengajuan Penarikan Saldo</span>
                </div>
                <button 
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Virtual Tersedia</span>
                <span className="text-xl font-black text-[#007088]">
                  Rp {(walletData?.balance || 0).toLocaleString('id-ID')}
                </span>
                <p className="text-[11px] text-slate-500 font-medium pt-1">
                  Rekening Tujuan: <strong className="text-slate-700">{walletData?.bankAccount || 'BCA (Rekening Terdaftar)'}</strong>
                </p>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Nominal Penarikan (Rp)
                  </label>
                  <input 
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Contoh: 100000"
                    required
                    min={10000}
                    max={walletData?.balance || 0}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088]"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Penarikan akan diverifikasi dan ditransfer manual oleh Admin ke rekening Anda.
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={submittingWithdraw || !withdrawAmount}
                    className="w-1/2 py-2.5 bg-[#FFA216] hover:bg-[#ff9500] text-[#4A2800] font-extrabold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50"
                  >
                    {submittingWithdraw ? "Mengirim..." : "Kirim Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </MobileLayout>
  );
}