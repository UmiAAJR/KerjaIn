import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
import { showAlert, showConfirm } from '../../utils/swal';
import { 
  ShieldCheck, 
  Search, 
  AlertCircle, 
  Check, 
  X, 
  Eye, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  CreditCard
} from 'lucide-react';

const AdminVerification = () => {
  const [verifications, setVerifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('Pending'); // 'All' | 'Pending' | 'Verified' | 'Rejected'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState(null); // URL of photo to show in lightbox

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getWorkerVerificationList();
      setVerifications(res || []);
      
      // Keep selected request refreshed
      if (selectedRequest) {
        const id = selectedRequest.VerifyID || selectedRequest.id;
        const refreshed = (res || []).find(v => (v.VerifyID === id || v.id === id));
        setSelectedRequest(refreshed || null);
      }
    } catch (err) {
      console.error("Error fetching verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleVerifyAction = async (requestId, workerId, status) => {
    const isApproved = status === 'Verified' || status === 'accepted';
    const actionText = isApproved ? 'menyetujui' : 'menolak';
    
    const confirmed = await showConfirm(
      "Konfirmasi Verifikasi", 
      `Apakah Anda yakin ingin ${actionText} verifikasi identitas worker ini?`,
      isApproved ? "Ya, Setujui" : "Ya, Tolak"
    );
    
    if (!confirmed) return;
    
    try {
      setActionLoading(true);
      // Calls API to update verification status (VerifyID in real database)
      const targetId = requestId || workerId;
      await adminApi.verifyWorker(targetId, status);
      
      showAlert("Berhasil", "success", `Verifikasi berhasil diubah menjadi: ${isApproved ? 'Diterima' : 'Ditolak'}`);
      
      // If resolving the active detail, reset or refresh
      if (selectedRequest && (selectedRequest.VerifyID === requestId || selectedRequest.id === requestId)) {
        setSelectedRequest(null);
      }
      fetchVerifications();
    } catch (err) {
      showAlert("Gagal", "error", "Gagal merubah status verifikasi: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = verifications.filter(v => {
    const workerName = v.name || '';
    const workerEmail = v.email || '';
    const matchesSearch = workerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          workerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (v.VerifyID || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusTab !== 'All') {
      const currentStatus = v.status || v.ktpStatus;
      if (statusTab === 'Pending') {
        matchesStatus = currentStatus === 'Pending';
      } else if (statusTab === 'Verified') {
        matchesStatus = currentStatus === 'Verified' || currentStatus === 'accepted';
      } else if (statusTab === 'Rejected') {
        matchesStatus = currentStatus === 'Rejected' || currentStatus === 'rejected';
      }
    }
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const st = status || 'Pending';
    if (st === 'Verified' || st === 'accepted') {
      return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">TERVERIFIKASI</span>;
    } else if (st === 'Rejected' || st === 'rejected') {
      return <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">DITOLAK</span>;
    } else {
      return <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full animate-pulse">PENDING</span>;
    }
  };

  return (
    <AdminLayout activeMenu="verification">
      <div className="space-y-6 select-none">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 rounded-2xl shadow-xs py-3 border border-slate-100 flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {['Pending', 'Verified', 'Rejected', 'All'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-200 border cursor-pointer
                  ${statusTab === tab
                    ? 'bg-teal-50 text-teal-600 border-teal-100 shadow-sm'
                    : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700'
                  }`}
              >
                {tab === 'Pending' ? 'Menunggu Review' : tab === 'Verified' ? 'Disetujui' : tab === 'Rejected' ? 'Ditolak' : 'Semua'}
              </button>
            ))}
          </div>
          
          <div className="relative max-w-xs w-full mt-2 sm:mt-0">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Cari worker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        {/* Content Pane Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Verifications Table */}
          <div className="xl:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-heading">
                Pengajuan Verifikasi
              </h3>
              <span className="bg-teal-50 text-teal-600 font-black text-[10px] px-2.5 py-1 rounded-full border border-teal-100">
                {filteredRequests.length} DATA
              </span>
            </div>

            <div className="overflow-x-auto min-w-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                  <AlertCircle size={32} className="stroke-1.5 text-slate-300" />
                  <p className="text-xs font-bold uppercase tracking-wider">Tidak ada pengajuan verifikasi</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-4 font-bold">Worker</th>
                      <th className="pb-4 font-bold text-center">Status</th>
                      <th className="pb-4 font-bold text-right">Tanggal Kirim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => {
                      const id = req.VerifyID || req.id;
                      const isSelected = selectedRequest && (selectedRequest.VerifyID === req.VerifyID || selectedRequest.id === req.id);
                      return (
                        <tr 
                          key={id} 
                          onClick={() => setSelectedRequest(req)}
                          className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors cursor-pointer
                            ${isSelected ? 'bg-teal-50/20' : ''}`}
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={req.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                                alt={req.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-extrabold text-slate-800 text-xs truncate leading-snug">{req.name}</div>
                                <div className="text-[9px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">ID: {req.WorkerID || req.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            {getStatusBadge(req.status || req.ktpStatus)}
                          </td>
                          <td className="py-4 text-right font-semibold text-slate-500 text-[10px]">
                            {req.submittedAt || '16 Juli 2026'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Details Pane */}
          <div className="xl:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 min-h-[400px]">
            {!selectedRequest ? (
              <div className="flex-grow flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <ShieldCheck size={26} />
                </div>
                <p className="text-xs font-black uppercase tracking-wider">Pilih salah satu pengajuan untuk ditinjau</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Details Header */}
                <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedRequest.status || selectedRequest.ktpStatus)}
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar size={11} />
                        <span>Kirim: {selectedRequest.submittedAt || '2026-07-16'}</span>
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-800 font-heading">
                      Review Identitas: {selectedRequest.name}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      Verify ID: {selectedRequest.VerifyID || selectedRequest.id}
                    </p>
                  </div>
                </div>

                {/* Worker Profile Overview */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedRequest.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                      alt={selectedRequest.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 leading-snug">{selectedRequest.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-0.5 mt-0.5 text-slate-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Mail size={11} />
                          <span>{selectedRequest.email}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={11} />
                          <span>{selectedRequest.phone || '089876543210'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/50 flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rekening Bank</span>
                      <div className="flex items-center gap-1.5 text-slate-700 font-extrabold">
                        <CreditCard size={13} className="text-slate-400" />
                        <span>{selectedRequest.bankAccount || selectedRequest.bankNumber || 'BCA - 8291029302'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Verification Side-by-Side */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-400" />
                    <span>Dokumen Verifikasi</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* KTP Photo */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Foto KTP</span>
                      {selectedRequest.ktpPhoto ? (
                        <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-100 h-36 flex items-center justify-center">
                          <img
                            src={selectedRequest.ktpPhoto}
                            alt="Foto KTP"
                            className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button
                              onClick={() => setActivePhotoModal(selectedRequest.ktpPhoto)}
                              className="p-2 bg-white/90 backdrop-blur-xs text-slate-800 rounded-lg hover:bg-white transition-colors cursor-pointer shadow"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 h-36 flex flex-col items-center justify-center text-slate-400 text-xs">
                          <AlertCircle size={20} className="stroke-1.5 text-slate-350" />
                          <span className="font-bold text-[10px] uppercase mt-1">Tanpa Foto KTP</span>
                        </div>
                      )}
                    </div>

                    {/* Selfie Photo */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Foto Selfie</span>
                      {selectedRequest.selfiePhoto ? (
                        <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-100 h-36 flex items-center justify-center">
                          <img
                            src={selectedRequest.selfiePhoto}
                            alt="Foto Selfie"
                            className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button
                              onClick={() => setActivePhotoModal(selectedRequest.selfiePhoto)}
                              className="p-2 bg-white/90 backdrop-blur-xs text-slate-800 rounded-lg hover:bg-white transition-colors cursor-pointer shadow"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 h-36 flex flex-col items-center justify-center text-slate-400 text-xs">
                          <AlertCircle size={20} className="stroke-1.5 text-slate-355" />
                          <span className="font-bold text-[10px] uppercase mt-1">Tanpa Foto Selfie</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Review Operations Drawer (Approve/Reject) */}
                {(selectedRequest.status === 'Pending' || selectedRequest.ktpStatus === 'Pending') && (
                  <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleVerifyAction(selectedRequest.VerifyID || selectedRequest.id, selectedRequest.WorkerID, 'Verified')}
                      disabled={actionLoading}
                      className="flex-grow bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs py-3 px-4 rounded-xl border border-emerald-400/20 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-md shadow-emerald-500/5 active:scale-[0.98]"
                    >
                      <Check size={15} className="stroke-[2.5]" />
                      <span>Setujui Verifikasi</span>
                    </button>
                    
                    <button
                      onClick={() => handleVerifyAction(selectedRequest.VerifyID || selectedRequest.id, selectedRequest.WorkerID, 'Rejected')}
                      disabled={actionLoading}
                      className="flex-grow bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs py-3 px-4 rounded-xl border border-rose-400/20 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-md shadow-rose-500/5 active:scale-[0.98]"
                    >
                      <X size={15} className="stroke-[2.5]" />
                      <span>Tolak Dokumen KTP</span>
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>

      {/* Lightbox Photo Preview Modal */}
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

export default AdminVerification;
