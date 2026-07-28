import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
import { 
  AlertTriangle, 
  Search, 
  AlertCircle, 
  Check, 
  Calendar, 
  Eye, 
  FileText,
  User,
  Clock,
  Briefcase,
  X
} from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending'); // 'All' | 'Pending' | 'Resolved'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState(null); // URL of photo to show in lightbox

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReports();
      setReports(res || []);
      
      // Keep selected report details refreshed
      if (selectedReport) {
        const details = await adminApi.getReportDetail(selectedReport.reportId);
        setSelectedDetails(details);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSelectReport = async (report) => {
    try {
      setSelectedReport(report);
      setSelectedDetails(null);
      const details = await adminApi.getReportDetail(report.reportId);
      setSelectedDetails(details);
    } catch (err) {
      alert("Gagal memuat detail laporan: " + err.message);
    }
  };

  const handleResolveReport = async (reportId) => {
    if (!window.confirm("Apakah Anda yakin ingin menandai laporan keluhan ini telah selesai ditangani?")) return;
    try {
      setActionLoading(true);
      await adminApi.resolveReport(reportId);
      alert("Laporan berhasil diselesaikan!");
      
      // Refresh current details
      const details = await adminApi.getReportDetail(reportId);
      setSelectedDetails(details);
      
      fetchReports();
    } catch (err) {
      alert("Gagal memproses laporan: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const reporter = r.reporterName || '';
    const reported = r.reportedWorkerName || '';
    const matchesSearch = reporter.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          reported.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.reportId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || 
                          r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === 'Resolved') {
      return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">SELESAI</span>;
    } else {
      return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse">MENUNGU REVIEW</span>;
    }
  };

  return (
    <AdminLayout activeMenu="reports">
      <div className="space-y-6 select-none">
        
        {/* Reports Controls Pane */}
        <div className="flex border-b border-slate-200 bg-white px-6 rounded-2xl shadow-xs py-3 border border-slate-100 flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {['Pending', 'Resolved', 'All'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-200 border cursor-pointer
                  ${statusFilter === status
                    ? 'bg-teal-50 text-teal-600 border-teal-100 shadow-sm'
                    : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700'
                  }`}
              >
                {status === 'Pending' ? 'Menunggu Penanganan' : status === 'Resolved' ? 'Telah Selesai' : 'Semua Laporan'}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full mt-2 sm:mt-0">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Cari pelapor, terlapor, kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        {/* Content Layout Split */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Reports List Pane */}
          <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-heading">
                Keluhan Pengguna (Reports)
              </h3>
              <span className="bg-rose-50 text-rose-600 font-black text-[10px] px-2.5 py-1 rounded-full border border-rose-100">
                {filteredReports.length} LAPORAN
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                  <AlertCircle size={32} className="stroke-1.5 text-slate-350" />
                  <p className="text-xs font-bold uppercase tracking-wider">Aman. Tidak ada laporan kendala.</p>
                </div>
              ) : (
                filteredReports.map((r) => {
                  const isSelected = selectedReport && selectedReport.reportId === r.reportId;
                  return (
                    <div
                      key={r.reportId}
                      onClick={() => handleSelectReport(r)}
                      className={`p-4 rounded-2xl border transition-all duration-250 cursor-pointer flex flex-col gap-2 relative overflow-hidden group
                        ${isSelected 
                          ? 'border-teal-300 bg-teal-50/20 shadow-sm' 
                          : 'border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50/60'}`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-extrabold text-slate-800 text-xs truncate max-w-[150px]">
                          {r.category}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {r.createdAt ? r.createdAt.split(' ')[0] : ''}
                        </span>
                      </div>

                      <p className="text-[10px] font-semibold text-slate-400 leading-none">
                        Pelapor: {r.reporterName} • Terlapor: {r.reportedWorkerName}
                      </p>

                      <p className="text-[11px] font-medium text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {r.description}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/50">
                        <span className="text-[9px] font-semibold text-slate-400">ID: {r.reportId}</span>
                        {getStatusBadge(r.status)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Details & Resolution Pane */}
          <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 min-h-[400px]">
            {!selectedReport ? (
              <div className="flex-grow flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <AlertTriangle size={26} />
                </div>
                <p className="text-xs font-black uppercase tracking-wider">Pilih salah satu keluhan untuk meninjau detail</p>
              </div>
            ) : !selectedDetails ? (
              <div className="flex-grow flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Details Header */}
                <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedDetails.report?.status)}
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar size={11} />
                        <span>Kirim: {selectedDetails.report?.createdAt}</span>
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-800 font-heading">
                      Komplain Kategori: {selectedDetails.report?.category}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      Report ID: {selectedDetails.report?.reportId}
                    </p>
                  </div>

                  {selectedDetails.report?.status === 'Pending' && (
                    <button
                      onClick={() => handleResolveReport(selectedDetails.report?.reportId)}
                      disabled={actionLoading}
                      className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl border border-teal-400/20 shadow-xs hover:shadow-sm cursor-pointer flex items-center gap-1.5 transition-all active:scale-[0.98]"
                    >
                      <Check size={14} className="stroke-[2.5]" />
                      <span>Selesaikan Laporan</span>
                    </button>
                  )}
                </div>

                {/* Dispute Parties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Reporter Client */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5 text-xs">
                    <div className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Pelapor (Client)</div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                        <User size={16} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 leading-snug">{selectedDetails.client?.name || selectedDetails.report?.reporterName}</h4>
                        <span className="text-[10px] font-semibold text-slate-400">{selectedDetails.client?.email || 'Pelapor Terdaftar'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reported Worker */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5 text-xs">
                    <div className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Terlapor (Worker)</div>
                    <div className="flex items-center gap-2.5">
                      <img
                        src={selectedDetails.worker?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                        alt={selectedDetails.worker?.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-800 leading-snug">{selectedDetails.worker?.name || selectedDetails.report?.reportedWorkerName}</h4>
                        <span className="text-[10px] font-semibold text-slate-400">ID: {selectedDetails.worker?.id || selectedDetails.report?.reportedWorkerId}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Complaint Body */}
                <div className="p-4 bg-slate-50/50 border border-slate-150 rounded-2xl space-y-3 text-xs leading-relaxed">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Detail Keluhan Pengguna</div>
                  <p className="font-medium text-slate-700">{selectedDetails.description || selectedDetails.report?.description}</p>
                </div>

                {/* Attachments / Evidence */}
                {selectedDetails.attachment && (
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gambar Lampiran Bukti</span>
                    <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 max-w-sm h-48 flex items-center justify-center">
                      <img
                        src={selectedDetails.attachment}
                        alt="Bukti Lampiran"
                        className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button
                          onClick={() => setActivePhotoModal(selectedDetails.attachment)}
                          className="p-2 bg-white/90 backdrop-blur-xs text-slate-800 rounded-lg hover:bg-white transition-colors cursor-pointer shadow"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Handling Timeline */}
                {selectedDetails.report?.timeline && selectedDetails.report.timeline.length > 0 && (
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      <span>Timeline Penanganan Kasus</span>
                    </h4>

                    <div className="relative pl-5 border-l-2 border-slate-100 space-y-4">
                      {selectedDetails.report.timeline.map((item, idx) => (
                        <div key={idx} className="relative">
                          {/* Dot indicator */}
                          <div className="absolute -left-[26px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-slate-400"></div>
                          
                          <div className="text-[10px] font-semibold text-slate-400 leading-none">{item.time}</div>
                          <div className="text-xs font-extrabold text-slate-700 mt-1 leading-snug">{item.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>

      {/* Lightbox Zoom modal */}
      {activePhotoModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setActivePhotoModal(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl border border-slate-800 bg-slate-900 flex items-center justify-center">
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute right-4 top-4 p-2 bg-slate-950/70 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer border border-slate-800"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>
            <img
              src={activePhotoModal}
              alt="Preview Zoom"
              className="object-contain max-w-full max-h-[80vh] p-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReports;
