import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
import { showAlert, showConfirm } from '../../utils/swal';
import { 
  Search, 
  AlertCircle, 
  Check, 
  X, 
  DollarSign, 
  Lock, 
  Unlock, 
  Eye, 
  RefreshCw,
  FileText,
  TrendingDown,
  TrendingUp,
  HelpCircle,
  Building2,
  Send,
  ArrowUpRight,
  ShieldCheck,
  Wallet,
  UserCheck,
  Users
} from 'lucide-react';

const AdminEscrow = () => {
  const [escrows, setEscrows] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [workerSearchQuery, setWorkerSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [escrowRes, withdrawRes, workerRes] = await Promise.all([
        adminApi.getEscrowList().catch(() => []),
        adminApi.getWithdrawalRequests().catch(() => []),
        adminApi.getWorkers().catch(() => [])
      ]);

      setEscrows(escrowRes || []);
      setWithdrawals(withdrawRes || []);
      setWorkers(workerRes || []);
    } catch (err) {
      console.error("Error fetching financial data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleApprovePayment = async (paymentId) => {
    const isConfirmed = await showConfirm("Konfirmasi Verifikasi", "Setujui verifikasi pembayaran ini? Pekerjaan akan masuk ke status pembayaran escrow.", "Ya, Setujui");
    if (!isConfirmed) return;
    try {
      await adminApi.approvePayment(paymentId);
      showAlert("Berhasil!", "success", "Pembayaran berhasil diverifikasi!");
      setSelectedProof(null);
      fetchInitialData();
    } catch (err) {
      showAlert("Gagal", "error", "Gagal memproses persetujuan: " + err.message);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const isConfirmed = await showConfirm("Konfirmasi Penolakan", "Tolak pembayaran pekerjaan ini?", "Ya, Tolak", "warning");
    if (!isConfirmed) return;
    try {
      await adminApi.rejectPayment(paymentId);
      showAlert("Ditolak", "info", "Pembayaran telah ditolak.");
      setSelectedProof(null);
      fetchInitialData();
    } catch (err) {
      showAlert("Gagal", "error", "Gagal memproses penolakan: " + err.message);
    }
  };

  const handleRelease = async (paymentId) => {
    const isConfirmed = await showConfirm("Konfirmasi Pelepasan", "Apakah Anda yakin ingin merilis dana escrow ini ke saldo virtual pekerja?", "Ya, Rilis Dana");
    if (!isConfirmed) return;
    try {
      await adminApi.releaseEscrow(paymentId);
      showAlert("Berhasil!", "success", "Dana escrow berhasil dirilis ke dompet pekerja!");
      fetchInitialData();
    } catch (err) {
      showAlert("Gagal", "error", "Gagal merilis dana: " + err.message);
    }
  };

  const handleRefund = async (paymentId) => {
    const isConfirmed = await showConfirm("Konfirmasi Refund", "Kembalikan dana escrow ini (Refund) ke klien?", "Ya, Refund");
    if (!isConfirmed) return;
    try {
      await adminApi.refundEscrow(paymentId);
      showAlert("Berhasil!", "success", "Dana escrow berhasil direfund ke klien!");
      fetchInitialData();
    } catch (err) {
      showAlert("Gagal", "error", "Gagal memproses refund: " + err.message);
    }
  };

  const handleApproveWithdrawal = async (withdrawId, workerName, amount, bankNumber) => {
    const isConfirmed = await showConfirm(
      "Konfirmasi Transfer Manual",
      `Apakah Anda SUDAH melakukan transfer Rp${amount.toLocaleString('id-ID')} ke rekening ${bankNumber} a.n ${workerName}?`,
      "Ya, Konfirmasi Transfer"
    );
    if (!isConfirmed) return;
    try {
      await adminApi.approveWithdrawal(withdrawId);
      showAlert("Pencairan Disetujui", "success", "Pencairan berhasil dikonfirmasi! Saldo virtual pekerja dan saldo platform telah diperbarui.");
      fetchInitialData();
    } catch (err) {
      showAlert("Gagal", "error", "Gagal mengonfirmasi penarikan: " + err.message);
    }
  };

  const handleRejectWithdrawal = async (withdrawId) => {
    const isConfirmed = await showConfirm("Konfirmasi Penolakan", "Tolak pengajuan penarikan saldo ini?", "Ya, Tolak Penarikan", "warning");
    if (!isConfirmed) return;
    try {
      await adminApi.rejectWithdrawal(withdrawId);
      showAlert("Ditolak", "info", "Pengajuan penarikan telah ditolak.");
      fetchInitialData();
    } catch (err) {
      showAlert("Gagal", "error", "Gagal menolak pengajuan: " + err.message);
    }
  };

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  // Financial Calculations
  const totalHolding = escrows
    .filter(e => e.escrowStatus === 'Holding' || e.status === 'holding')
    .reduce((sum, current) => sum + (current.price || current.amount || 0), 0);

  const totalReleased = escrows
    .filter(e => e.escrowStatus === 'Released' || e.status === 'released')
    .reduce((sum, current) => sum + (current.price || current.amount || 0), 0);

  // Platform Admin Revenue (10% Commission of Released Escrows)
  const adminRevenue = escrows
    .filter(e => e.escrowStatus === 'Released' || e.status === 'released')
    .reduce((sum, e) => sum + (e.platformFee || Math.round((e.amount || 0) * 0.10)), 0);

  // Total Virtual Balances owned by all Workers in database
  const totalWorkerVirtualBalance = workers.reduce((sum, w) => sum + Number(w.balance || 0), 0);

  // Total Real Money in Platform Central Bank Account = Escrow Holding + Admin Revenue + Total Worker Virtual Balances
  const totalPlatformAccount = totalHolding + adminRevenue + totalWorkerVirtualBalance;

  // Search filter for Escrows
  const filteredEscrows = escrows.filter(e => {
    const jobTitle = e.title || e.service || '';
    return jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.clientName && e.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.workerName && e.workerName.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Search filter for Workers
  const filteredWorkers = workers.filter(w => {
    const name = w.name || w.User?.name || '';
    const email = w.email || w.User?.email || '';
    const bank = w.bankName || '';
    const bankNum = w.bankNumber || '';
    const query = workerSearchQuery.toLowerCase();
    return name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      bank.toLowerCase().includes(query) ||
      bankNum.toLowerCase().includes(query);
  });

  return (
    <AdminLayout activeTab="escrow">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-[#007088]" />
              Manajemen Escrow & Keuangan Platform
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pusat kendali 1 Rekening Utama Platform, Dana Escrow/Holding, Saldo Komisi Admin, dan Pengajuan Transfer Manual Pekerja.
            </p>
          </div>
          <button 
            onClick={fetchInitialData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#007088] hover:bg-[#005a6e] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin-hover" />
            Refresh Data Keuangan
          </button>
        </div>

        {/* 1. RINGKASAN KEUANGAN 4 KARTU UTAMA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CARD 1: TOTAL REKENING UTAMA PLATFORM */}
          <div className="bg-gradient-to-br from-[#007088] to-[#005a6e] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
            <Building2 className="absolute -bottom-4 -right-4 w-28 h-28 text-white/10 pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-100 uppercase tracking-wider">Rekening Utama Platform</span>
              <span className="p-1.5 bg-white/10 rounded-lg text-amber-300">
                <Building2 className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black mb-1">{formatIDR(totalPlatformAccount)}</div>
            <p className="text-[11px] text-cyan-100/80">Total riil di Rekening BCA Platform</p>
          </div>

          {/* CARD 2: ESCROW / HOLDING */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Escrow / Holding</span>
              <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Lock className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-800">{formatIDR(totalHolding)}</div>
            <p className="text-[11px] text-amber-600 font-medium">Tertahan untuk pekerjaan aktif</p>
          </div>

          {/* CARD 3: SALDO KOMISI ADMIN (10%) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pendapatan Admin (10%)</span>
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-600">{formatIDR(adminRevenue)}</div>
            <p className="text-[11px] text-slate-500">Komisi platform dari job selesai</p>
          </div>

          {/* CARD 4: SALDO DOMPET VIRTUAL WORKER */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Virtual Workers</span>
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Wallet className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-indigo-600">{formatIDR(totalWorkerVirtualBalance)}</div>
            <p className="text-[11px] text-slate-500">Kumulatif saldo dompet pekerja</p>
          </div>

        </div>

        {/* 2. TABEL PENGAJUAN PENARIKAN SALDO WORKER (WITHDRAWAL REQUESTS) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#007088]" />
                Pengajuan Pencairan Saldo Pekerja (Manual Transfer)
              </h2>
              <p className="text-xs text-slate-500">
                Pekerja mengajukan penarikan saldo virtual. Lakukan transfer manual dari Rekening Utama Platform via M-Banking, lalu konfirmasi di sini.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
              {withdrawals.filter(w => w.status === 'PENDING_APPROVAL').length} Pengajuan Menunggu
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">Memuat pengajuan penarikan...</div>
          ) : withdrawals.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl">
              Belum ada pengajuan pencairan saldo dari pekerja.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-extrabold uppercase bg-slate-50/50">
                    <th className="p-3">Nama Worker</th>
                    <th className="p-3">Bank Tujuan</th>
                    <th className="p-3">No. Rekening & Pemilik</th>
                    <th className="p-3">Nominal Transfer</th>
                    <th className="p-3">Tanggal Pengajuan</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawals.map((w) => {
                    const wid = w.WithdrawalID || w.id;
                    const statusUpper = String(w.status || '').toUpperCase();
                    const isPending = statusUpper === 'PENDING_APPROVAL' || statusUpper === 'PENDING';
                    const isCompleted = statusUpper === 'COMPLETED' || statusUpper === 'SELESAI';
                    const workerName = w.Worker?.User?.name || w.workerName || 'Pekerja';
                    return (
                      <tr key={wid} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-bold text-slate-800">
                          {workerName}
                        </td>
                        <td className="p-3 font-bold text-indigo-600">
                          {w.bankName || 'BCA'}
                        </td>
                        <td className="p-3 text-slate-700 font-semibold">
                          <div>{w.bankNumber || '-'}</div>
                          <div className="text-[10px] text-slate-400">a.n {w.bankAccount || workerName}</div>
                        </td>
                        <td className="p-3 font-extrabold text-slate-900 text-sm">
                          {formatIDR(w.amount)}
                        </td>
                        <td className="p-3 text-slate-500">
                          {w.createdAt || w.date ? new Date(w.createdAt || w.date).toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="p-3">
                          {isPending && (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[10px]">
                              Menunggu Transfer
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px]">
                              Selesai Ditransfer
                            </span>
                          )}
                          {statusUpper === 'REJECTED' && (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[10px]">
                              Ditolak
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleApproveWithdrawal(wid, workerName, Number(w.amount), w.bankNumber)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Konfirmasi Transfer
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(wid)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-[11px] rounded-lg transition-all cursor-pointer"
                              >
                                Tolak
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium italic">Tindakan Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. TABEL DAFTAR TRANSAKSI ESCROW PEKERJAAN */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#007088]" />
                Daftar Pembayaran Escrow Pekerjaan
              </h2>
              <p className="text-xs text-slate-500">Monitoring status dana escrow per pekerjaan dari klien hingga rilis ke pekerja.</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Cari transaksi / nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#007088]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-extrabold uppercase bg-slate-50/50">
                  <th className="p-3">ID Pembayaran & Job</th>
                  <th className="p-3">Client (Klien)</th>
                  <th className="p-3">Worker (Pekerja)</th>
                  <th className="p-3">Total Nominal</th>
                  <th className="p-3">Status Escrow</th>
                  <th className="p-3">Tanggal Dibuat</th>
                  <th className="p-3 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEscrows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">Tidak ada transaksi escrow ditemukan.</td>
                  </tr>
                ) : (
                  filteredEscrows.map((item) => (
                    <tr key={item.PaymentID} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-bold text-slate-800">
                        <div>#{item.PaymentID.slice(0, 8)}</div>
                        <div className="text-[10px] text-slate-400 font-normal">Job: {item.jobId !== '-' ? `#${item.jobId.slice(0, 8)}` : '-'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{item.clientName || 'Client'}</div>
                        <div className="text-[10px] text-[#007088] font-semibold">ID: {item.clientId !== '-' ? item.clientId.slice(0, 8) : '-'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{item.workerName || 'Worker'}</div>
                        <div className="text-[10px] text-indigo-600 font-semibold">ID: {item.workerId !== '-' ? item.workerId.slice(0, 8) : '-'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900">{formatIDR(item.price || item.amount)}</div>
                        {item.escrowStatus === 'Released' && (
                          <div className="text-[10px] font-semibold text-emerald-600">
                            Fee 10%: {formatIDR(item.platformFee)} | Worker: {formatIDR(item.workerAmount)}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          item.escrowStatus === 'Released' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          item.escrowStatus === 'Refunded' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.escrowStatus || item.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '-'}</td>
                      <td className="p-3 text-right space-x-1.5">
                        {item.escrowStatus === 'Holding' && (
                          <button
                            onClick={() => handleRelease(item.PaymentID)}
                            className="px-3 py-1.5 bg-[#007088] hover:bg-[#005a6e] text-white font-bold text-[11px] rounded-lg shadow-xs cursor-pointer"
                          >
                            Rilis ke Worker
                          </button>
                        )}
                        {item.escrowStatus === 'Released' && (
                          <span className="text-[11px] text-emerald-600 font-bold">Rilis Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. TABEL INFORMASI SALDO VIRTUAL SETIAP PEKERJA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#007088]" />
                Informasi Saldo Virtual Setiap Pekerja
              </h2>
              <p className="text-xs text-slate-500">
                Rincian saldo dompet virtual dan rekening bank terdaftar milik seluruh pekerja.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-full hidden sm:inline-block">
                Total Saldo Workers: {formatIDR(totalWorkerVirtualBalance)}
              </span>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Cari worker / rekening..."
                  value={workerSearchQuery}
                  onChange={(e) => setWorkerSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#007088]"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">Memuat data saldo pekerja...</div>
          ) : filteredWorkers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl">
              Tidak ada data pekerja ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-extrabold uppercase bg-slate-50/50">
                    <th className="p-3">Pekerja</th>
                    <th className="p-3">Kontak</th>
                    <th className="p-3">Rekening Bank Terdaftar</th>
                    <th className="p-3">Status Verifikasi</th>
                    <th className="p-3 text-right">Saldo Virtual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWorkers.map((w) => {
                    const workerId = w.WorkerID || w.id;
                    const workerName = w.name || w.User?.name || 'Pekerja';
                    const email = w.email || w.User?.email || '-';
                    const phone = w.phone || w.User?.phoneNumber || '-';
                    const photo = w.photo || w.User?.photo;
                    const balance = Number(w.balance || 0);
                    const isVerified = w.verified || w.status === 'verified' || w.ktpStatus === 'Verified';

                    return (
                      <tr key={workerId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(workerName)}&background=007088&color=fff`} 
                              alt={workerName} 
                              className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(workerName)}&background=007088&color=fff`;
                              }}
                            />
                            <div>
                              <div className="font-bold text-slate-800">{workerName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {String(workerId).slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">
                          <div>{email}</div>
                          <div className="text-[10px] text-slate-400">{phone}</div>
                        </td>
                        <td className="p-3">
                          {w.bankNumber ? (
                            <div>
                              <span className="font-bold text-indigo-600">{w.bankName || 'Bank'}</span>
                              <span className="text-slate-700 font-semibold ml-1.5">{w.bankNumber}</span>
                              <div className="text-[10px] text-slate-400">a.n {w.bankAccount || workerName}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Belum diatur</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isVerified ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full font-bold text-[10px]">
                              Belum Verifikasi
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`font-extrabold text-sm ${balance > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {formatIDR(balance)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminEscrow;
