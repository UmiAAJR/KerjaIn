import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
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
  HelpCircle
} from 'lucide-react';

const AdminEscrow = () => {
  const [escrows, setEscrows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState(null); // stores job for proof modal

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getEscrowList();
      setEscrows(res || []);
    } catch (err) {
      console.error("Error fetching escrow list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, []);

  const handleApprovePayment = async (jobId) => {
    if (!window.confirm("Setujui verifikasi pembayaran untuk pekerjaan ini?")) return;
    try {
      await adminApi.approvePayment(jobId);
      alert("Pembayaran berhasil diverifikasi! Pekerjaan dialihkan ke status aktif.");
      setSelectedProof(null);
      fetchEscrows();
    } catch (err) {
      alert("Gagal memproses persetujuan: " + err.message);
    }
  };

  const handleRejectPayment = async (jobId) => {
    if (!window.confirm("Tolak bukti pembayaran pekerjaan ini?")) return;
    try {
      await adminApi.rejectPayment(jobId);
      alert("Pembayaran ditolak. Klien akan diminta mengunggah kembali bukti transfer.");
      setSelectedProof(null);
      fetchEscrows();
    } catch (err) {
      alert("Gagal memproses penolakan: " + err.message);
    }
  };

  const handleRelease = async (jobId) => {
    if (!window.confirm("Apakah Anda yakin ingin merilis dana escrow ini ke dompet pekerja?")) return;
    try {
      await adminApi.releaseEscrow(jobId);
      alert("Dana escrow berhasil dirilis ke pekerja!");
      fetchEscrows();
    } catch (err) {
      alert("Gagal merilis dana: " + err.message);
    }
  };

  const handleRefund = async (jobId) => {
    if (!window.confirm("Kembalikan dana escrow ini (Refund) ke saldo klien?")) return;
    try {
      await adminApi.refundEscrow(jobId);
      alert("Dana escrow berhasil direfund ke klien!");
      fetchEscrows();
    } catch (err) {
      alert("Gagal memproses refund: " + err.message);
    }
  };

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  // Financial Calculations
  const totalPending = escrows
    .filter(e => e.escrowStatus === 'Pending')
    .reduce((sum, current) => sum + (current.price || 0), 0);

  const totalHolding = escrows
    .filter(e => e.escrowStatus === 'Holding')
    .reduce((sum, current) => sum + (current.price || 0), 0);

  const totalReleased = escrows
    .filter(e => e.escrowStatus === 'Released')
    .reduce((sum, current) => sum + (current.price || 0), 0);

  const totalRefunded = escrows
    .filter(e => e.escrowStatus === 'Refunded')
    .reduce((sum, current) => sum + (current.price || 0), 0);

  // Platform bank balance is total money currently held in our account (Holding + Pending)
  const bankBalance = totalHolding + totalPending;

  // Search filter
  const filteredEscrows = escrows.filter(e => {
    const jobTitle = e.title || e.service || '';
    return jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.clientName && e.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.workerName && e.workerName.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Dynamic Ledger Generation
  const generateLedger = () => {
    const ledger = [];
    escrows.forEach(e => {
      // Incoming Payment (Created when payment proof is approved / or is Holding/Released/Refunded)
      if (e.escrowStatus !== 'Pending') {
        ledger.push({
          date: e.createdAt || '2026-07-27',
          type: 'Incoming',
          amount: e.price,
          description: `Terima Escrow Job #${e.jobId} (${e.title})`,
          client: e.clientName
        });
      }
      
      // Outgoing Released to Worker
      if (e.escrowStatus === 'Released') {
        ledger.push({
          date: e.releasedAt || e.createdAt || '2026-07-27',
          type: 'Outgoing',
          amount: -e.price,
          description: `Rilis Dana ke Pekerja (Job #${e.jobId})`,
          worker: e.workerName
        });
      }

      // Outgoing Refunded to Client
      if (e.escrowStatus === 'Refunded') {
        ledger.push({
          date: e.createdAt || '2026-07-27',
          type: 'Refund',
          amount: -e.price,
          description: `Refund Dana ke Klien (Job #${e.jobId})`,
          client: e.clientName
        });
      }
    });

    // Sort by date descending
    return ledger.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const ledgerList = generateLedger();

  return (
    <AdminLayout activeMenu="escrow">
      <div className="space-y-8 select-none">
        
        {/* Finance Dashboard Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Platform Bank Account Balance */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Rekening Platform</span>
              <h3 className="text-xl font-black text-slate-800 leading-none">{formatIDR(bankBalance)}</h3>
              <p className="text-[9px] font-bold text-slate-400 mt-1 block leading-none">BCA a.n PT KerjaIn Indonesia</p>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center border text-teal-600 bg-teal-50 border-teal-100 shrink-0">
              <DollarSign size={20} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Holding Escrow */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Holding Escrow</span>
              <h3 className="text-xl font-black text-slate-800 leading-none">{formatIDR(totalHolding)}</h3>
              <p className="text-[9px] font-bold text-slate-400 mt-1 block leading-none">Dana diamankan (sedang berjalan)</p>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center border text-amber-600 bg-amber-50 border-amber-100 shrink-0">
              <Lock size={20} />
            </div>
          </div>

          {/* Sudah Dicairkan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sudah Dicairkan</span>
              <h3 className="text-xl font-black text-slate-800 leading-none">{formatIDR(totalReleased)}</h3>
              <p className="text-[9px] font-bold text-slate-400 mt-1 block leading-none">Telah dirilis ke dompet pekerja</p>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center border text-emerald-600 bg-emerald-50 border-emerald-100 shrink-0">
              <Unlock size={20} />
            </div>
          </div>

          {/* Menunggu Verifikasi */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menunggu Verifikasi</span>
              <h3 className="text-xl font-black text-slate-800 leading-none">{formatIDR(totalPending)}</h3>
              <p className="text-[9px] font-bold text-slate-400 mt-1 block leading-none">Membutuhkan aksi ulasan admin</p>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center border text-blue-600 bg-blue-50 border-blue-100 shrink-0">
              <RefreshCw size={20} className="animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Escrow Management Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wider font-heading">
                Manajemen Escrow Pekerjaan
              </h3>
            </div>
            
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Cari pekerjaan, klien, pekerja..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto min-w-0">
            {filteredEscrows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                <AlertCircle size={32} className="stroke-1.5 text-slate-300" />
                <p className="text-xs font-bold uppercase tracking-wider">Tidak ada transaksi escrow</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-4 font-bold">Pekerjaan</th>
                    <th className="pb-4 font-bold">Client / Worker</th>
                    <th className="pb-4 font-bold text-center">Status Job</th>
                    <th className="pb-4 font-bold text-right">Nilai Jasa</th>
                    <th className="pb-4 font-bold text-center">Status Escrow</th>
                    <th className="pb-4 font-bold text-right">Aksi Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEscrows.map((escrow) => {
                    const statusColors = {
                      'Pending': 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse',
                      'Holding': 'bg-amber-50 text-amber-700 border-amber-100',
                      'Released': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      'Refunded': 'bg-rose-50 text-rose-700 border-rose-100'
                    };

                    const statusLabels = {
                      'Pending': 'Perlu Verifikasi',
                      'Holding': 'Ditahan (Holding)',
                      'Released': 'Dirilis (Released)',
                      'Refunded': 'Refund'
                    };

                      return (
                        <tr key={escrow.jobId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                          
                          {/* Title */}
                          <td className="py-4">
                            <div className="font-extrabold text-slate-800 text-sm leading-tight">
                              {escrow.title || escrow.service || 'Pekerjaan Jasa'}
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                              Payment ID: {escrow.PaymentID || escrow.Payment?.PaymentID || `pay-${escrow.jobId}`}
                            </div>
                            <div className="text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">
                              Job ID: {escrow.jobId || escrow.JobID}
                            </div>
                          </td>

                        {/* Client/Worker */}
                        <td className="py-4 space-y-1">
                          <div className="font-semibold text-slate-600">C: {escrow.clientName}</div>
                          <div className="font-semibold text-slate-500">W: {escrow.workerName || '-'}</div>
                        </td>

                        {/* Status Job */}
                        <td className="py-4 text-center">
                          <span className="bg-slate-100 text-slate-600 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200/65">
                            {escrow.status}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 text-right font-extrabold text-slate-800 text-sm">
                          {formatIDR(escrow.price)}
                        </td>

                        {/* Escrow Status */}
                        <td className="py-4 text-center">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[escrow.escrowStatus]}`}>
                            {statusLabels[escrow.escrowStatus]}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {escrow.escrowStatus === 'Pending' ? (
                              <>
                                {escrow.paymentProof && (
                                  <button
                                    onClick={() => setSelectedProof(escrow)}
                                    className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-600 border border-teal-100 rounded-lg transition-colors cursor-pointer"
                                    title="Lihat Bukti Transfer"
                                  >
                                    <Eye size={13} className="stroke-[2.5]" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleApprovePayment(escrow.jobId)}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-lg transition-colors cursor-pointer"
                                  title="Approve Pembayaran"
                                >
                                  <Check size={13} className="stroke-[2.5]" />
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(escrow.jobId)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition-colors cursor-pointer"
                                  title="Reject Pembayaran"
                                >
                                  <X size={13} className="stroke-[2.5]" />
                                </button>
                              </>
                            ) : escrow.escrowStatus === 'Holding' ? (
                              <>
                                <button
                                  onClick={() => handleRelease(escrow.jobId)}
                                  disabled={escrow.status !== 'COMPLETED'}
                                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 transition-all cursor-pointer
                                    ${escrow.status === 'COMPLETED'
                                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100 active:scale-95'
                                      : 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-50'
                                    }`}
                                  title={escrow.status === 'COMPLETED' ? "Rilis Dana ke Dompet Pekerja" : "Pekerjaan belum diselesaikan oleh Klien & Pekerja"}
                                >
                                  <Unlock size={11} className="stroke-[2.5]" />
                                  <span>Rilis</span>
                                </button>
                                <button
                                  onClick={() => handleRefund(escrow.jobId)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition-colors cursor-pointer"
                                  title="Refund ke Klien"
                                >
                                  <X size={13} className="stroke-[2.5]" />
                                </button>
                              </>
                            ) : escrow.escrowStatus === 'Released' ? (
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none flex items-center justify-end gap-1">
                                <Unlock size={12} className="stroke-[2.5]" />
                                <span>Cair</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none flex items-center justify-end gap-1">
                                <X size={12} className="stroke-[2.5]" />
                                <span>Refunded</span>
                              </span>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Financial Log (Mutasi Rekening Ledger) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-2">
              <FileText size={16} className="text-teal-600 stroke-[2.5]" />
              <span>Log Mutasi Keuangan (Ledger)</span>
            </h3>
          </div>

          <div className="overflow-x-auto min-w-0">
            {ledgerList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                <AlertCircle size={32} className="stroke-1.5 text-slate-300" />
                <p className="text-xs font-bold uppercase tracking-wider">Belum ada mutasi keuangan tercatat</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-4 font-bold">Tanggal</th>
                    <th className="pb-4 font-bold text-center">Jenis</th>
                    <th className="pb-4 font-bold text-right">Nominal</th>
                    <th className="pb-4 font-bold">Keterangan Transaksi</th>
                    <th className="pb-4 font-bold">Akun Terkait</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerList.map((tx, idx) => {
                    const isIncoming = tx.type === 'Incoming';
                    const isRefund = tx.type === 'Refund';

                    return (
                      <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                        
                        {/* Date */}
                        <td className="py-4 font-bold text-slate-500">
                          {tx.date}
                        </td>

                        {/* Transaction Type */}
                        <td className="py-4 text-center">
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border
                            ${isIncoming 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : isRefund
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}
                          >
                            {isIncoming ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            <span>{isIncoming ? 'Incoming' : isRefund ? 'Refund' : 'Outgoing'}</span>
                          </span>
                        </td>

                        {/* Nominal */}
                        <td className={`py-4 text-right font-black text-sm
                          ${isIncoming 
                            ? 'text-emerald-600' 
                            : isRefund
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {isIncoming ? '+' : ''}{formatIDR(tx.amount)}
                        </td>

                        {/* Description */}
                        <td className="py-4 font-semibold text-slate-700">
                          {tx.description}
                        </td>

                        {/* Account Entity */}
                        <td className="py-4 font-medium text-slate-500">
                          {tx.client ? `Client: ${tx.client}` : `Worker: ${tx.worker}`}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Payment Proof Preview Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProof(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={18} className="stroke-[2.5]" />
            </button>

            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider font-heading">
                  Verifikasi Pembayaran
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Job ID: {selectedProof.jobId}
                </p>
              </div>

              {/* Proof Image */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden aspect-[3/4] bg-slate-50 relative">
                <img
                  src={selectedProof.paymentProof}
                  alt="Bukti Transfer Klien"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pembayaran</span>
                <span className="block font-black text-teal-600 text-base">{formatIDR(selectedProof.price)}</span>
              </div>

              {/* Action buttons inside Modal */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleRejectPayment(selectedProof.jobId)}
                  className="py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <X size={14} className="stroke-[2.5]" />
                  <span>Tolak</span>
                </button>
                <button
                  onClick={() => handleApprovePayment(selectedProof.jobId)}
                  className="py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check size={14} className="stroke-[2.5]" />
                  <span>Verifikasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminEscrow;
