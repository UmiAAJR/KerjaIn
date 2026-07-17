import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { AlertTriangle, Clock, ShieldCheck, CheckSquare } from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [timeline, setTimeline] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await adminApi.getReports();
      setReports(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenDetail = async (report) => {
    try {
      const res = await adminApi.getReportDetail(report.reportId);
      setSelectedReport(res);
      setTimeline(res.timeline || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResolve = async (id) => {
    try {
      await adminApi.resolveReport(id);
      alert('Laporan aduan ditandai selesai.');
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Manajemen Laporan Aduan">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manajemen Laporan Aduan">
      {reports.length === 0 ? (
        <Card className="border border-slate-100 p-8 text-center">
          <p className="text-sm font-bold text-slate-400">Tidak ada laporan aduan masuk</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <Card key={rep.reportId} className="border border-slate-100 p-5 flex items-center justify-between gap-4">
              <div className="flex gap-4">
                <div className="p-3 rounded-2xl bg-accent-50 text-accent-600 shrink-0 self-start">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Pelapor: {rep.reporterName}</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Dilaporkan: {rep.reportedWorkerName}</p>
                  <p className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full inline-block mt-2 font-bold">
                    Kategori: {rep.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase
                  ${rep.status === 'Resolved' ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'}`}>
                  {rep.status}
                </span>
                <Button size="sm" onClick={() => handleOpenDetail(rep)}>
                  Detail
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Detail Aduan ID: ${selectedReport.report.reportId}`}
        >
          <div className="space-y-6 text-sm">
            {/* Parties Info */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Pelapor (Client)</p>
                <p className="font-bold text-slate-700">{selectedReport.client?.name}</p>
                <p className="text-xs text-slate-400 font-semibold">{selectedReport.client?.phone}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Terlapor (Worker)</p>
                <p className="font-bold text-slate-700">{selectedReport.worker?.name}</p>
                <p className="text-xs text-slate-400 font-semibold">{selectedReport.worker?.phone}</p>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Deskripsi Kejadian</span>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50 p-4 rounded-xl border border-slate-100">
                {selectedReport.description}
              </p>
            </div>

            {/* Photo Attachment */}
            {selectedReport.attachment && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Bukti Lampiran</span>
                <img 
                  src={selectedReport.attachment} 
                  alt="Bukti Lampiran" 
                  className="w-full h-36 rounded-xl object-cover border"
                />
              </div>
            )}

            {/* Timeline Tracking */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Log Aktivitas</span>
              <div className="space-y-2.5 pl-3 border-l border-slate-200 ml-1">
                {timeline.map((step, idx) => (
                  <div key={idx} className="relative flex items-center gap-2">
                    <div className="absolute -left-[16px] w-2.5 h-2.5 rounded-full bg-primary-600 border border-white" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-700">{step.title}</p>
                      <span className="text-[9px] text-slate-400 font-medium">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {selectedReport.report.status === 'Pending' && (
              <div className="pt-4 border-t border-slate-100">
                <Button
                  className="w-full text-center flex justify-center py-2.5"
                  onClick={() => handleResolve(selectedReport.report.reportId)}
                >
                  <CheckSquare size={16} className="mr-2" /> Tandai Masalah Selesai (Resolve)
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default AdminReports;
