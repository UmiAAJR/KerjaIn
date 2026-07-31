import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
import { showAlert, showConfirm } from '../../utils/swal';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  RefreshCw,
  User,
  Wrench,
  X,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReports().catch(() => []);
      setReports(res || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (reportId) => {
    const isConfirmed = await showConfirm("Konfirmasi Penyelesaian", "Tandai laporan ini sebagai selesai/teratasi?", "Ya, Selesaikan");
    if (!isConfirmed) return;
    try {
      await adminApi.resolveReport(reportId);
      showAlert("Berhasil!", "success", "Laporan berhasil diselesaikan!");
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      showAlert("Gagal", "error", "Gagal memperbarui status laporan: " + err.message);
    }
  };


  const filteredReports = reports.filter(r => {
    const matchesSearch = (r.reporterName || r.Reporter?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.reportedWorkerName || r.ReportedWorker?.User?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (r.status || '').toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const pendingCount = reports.filter(r => (r.status || '').toLowerCase() === 'pending').length;
  const resolvedCount = reports.filter(r => (r.status || '').toLowerCase() === 'resolved').length;

  return (
    <AdminLayout activeMenu="reports">
      <div className="space-y-6">
        
        {/* Notice Banner Dalam Pengembangan */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl font-bold shrink-0">
              <Wrench size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm text-amber-900 font-heading uppercase tracking-wider">MODUL DALAM PENGEMBANGAN</span>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Development Preview</span>
              </div>
              <p className="text-xs font-semibold text-amber-800/90 mt-0.5 leading-relaxed">
                Fitur Laporan Kendala & Penanganan Sengketa ini sedang disiapkan untuk rilis versi berikutnya. Seluruh antarmuka, statistik, dan tabel laporan di bawah diperlihatkan sebagai pratinjau aktif.
              </p>
            </div>
          </div>
        </div>

        {/* Header Title & Quick Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading flex items-center gap-2.5">
              <span>Laporan Kendala & Sengketa</span>
            </h1>

            <p className="text-sm font-medium text-slate-500 mt-1">
              Audit dan selesaikan aduan kendala pekerjaan antar pengguna secara responsif.
            </p>
          </div>

          <button 
            onClick={fetchReports}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold shadow-xs hover:bg-slate-50 transition-colors w-fit"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Laporan</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{reports.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menunggu Penanganan</p>
              <h3 className="text-2xl font-black text-amber-600 mt-0.5">{pendingCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selesai / Ditangani</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{resolvedCount}</h3>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari pelapor, worker, kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {['all', 'pending', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'Semua Status' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
              <p className="text-xs font-semibold text-slate-500">Memuat laporan kendala...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <FileText size={32} />
              </div>
              <p className="text-sm font-bold text-slate-700">Tidak ada laporan ditemukan</p>
              <p className="text-xs text-slate-400">Belum ada aduan kendala yang dikirim oleh pengguna saat ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">ID Laporan</th>
                    <th className="py-3.5 px-5">Pelapor</th>
                    <th className="py-3.5 px-5">Worker Terlaporkan</th>
                    <th className="py-3.5 px-5">Kategori Kendala</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {filteredReports.map((r) => {
                    const isPending = (r.status || '').toLowerCase() === 'pending';
                    const reporterName = r.reporterName || r.Reporter?.name || 'Pelanggan';
                    const workerName = r.reportedWorkerName || r.ReportedWorker?.User?.name || 'Worker';
                    const reportId = r.reportId || r.ReportID || 'REP-001';

                    return (
                      <tr key={reportId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5 font-mono text-xs font-bold text-slate-900">
                          #{String(reportId).slice(0, 8)}
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900">{reporterName}</div>
                          <div className="text-xs text-slate-400">{r.createdAt ? String(r.createdAt).slice(0, 10) : 'Hari ini'}</div>
                        </td>
                        <td className="py-4 px-5 font-semibold text-slate-800">
                          {workerName}
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                            <AlertTriangle size={12} className="text-amber-500" />
                            {r.category || 'Layanan Umum'}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            isPending 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200/60'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200/60'
                          }`}>
                            {isPending ? <Clock size={12} /> : <CheckCircle size={12} />}
                            {r.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedReport(r)}
                            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            title="Detail Laporan"
                          >
                            <Eye size={16} />
                          </button>
                          {isPending && (
                            <button
                              onClick={() => handleResolve(reportId)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs transition-all"
                            >
                              Tandai Selesai
                            </button>
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
      </div>

      {/* Modal Detail Laporan */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-heading">
                  Detail Laporan Kendala
                </h3>
                <p className="text-xs font-semibold text-slate-400">
                  ID: #{String(selectedReport.reportId || selectedReport.ReportID).slice(0, 12)}
                </p>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pelapor</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedReport.reporterName || selectedReport.Reporter?.name || 'Pelanggan'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Worker Terlaporkan</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedReport.reportedWorkerName || selectedReport.ReportedWorker?.User?.name || 'Worker'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Kategori Masalah</span>
                <span className="inline-block px-3 py-1 rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-200/50">
                  {selectedReport.category || 'Keluhan Layanan'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Deskripsi Aduan</span>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 leading-relaxed text-slate-800">
                  {selectedReport.description || 'Tidak ada deskripsi tambahan yang dilampirkan.'}
                </div>
              </div>

              {selectedReport.attachment && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Bukti Lampiran</span>
                  <img 
                    src={selectedReport.attachment} 
                    alt="Bukti Laporan" 
                    className="w-full max-h-48 object-cover rounded-2xl border border-slate-200 shadow-xs"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Tutup
              </button>
              {(selectedReport.status || '').toLowerCase() === 'pending' && (
                <button
                  onClick={() => handleResolve(selectedReport.reportId || selectedReport.ReportID)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs"
                >
                  Selesaikan Laporan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReports;

