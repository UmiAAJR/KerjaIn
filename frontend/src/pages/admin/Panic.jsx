import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { ShieldAlert, Compass, MapPin, Phone, CheckCircle2 } from 'lucide-react';

const AdminPanic = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPanic, setSelectedPanic] = useState(null);

  const fetchAlerts = async () => {
    try {
      const res = await adminApi.getPanicAlerts();
      setAlerts(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 4000); // Polling alerts
    return () => clearInterval(interval);
  }, []);

  const handleOpenPanic = async (alertItem) => {
    try {
      const res = await adminApi.getPanicDetail(alertItem.jobId);
      setSelectedPanic(res);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResolve = async (jobId) => {
    try {
      await adminApi.resolvePanic(jobId);
      alert('Sinyal panik berhasil ditandai selesai/kondisi kondusif.');
      setSelectedPanic(null);
      fetchAlerts();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Monitoring Panic Button">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Monitoring Panic Button">
      {alerts.length === 0 ? (
        <Card className="border border-slate-100 p-8 text-center space-y-2">
          <CheckCircle2 size={32} className="text-success-500 mx-auto" />
          <p className="text-sm font-bold text-slate-500">Semua Kondisi Aman Terkendali</p>
          <p className="text-xs text-slate-400">Tidak ada mitra worker yang mengaktifkan tombol darurat panic saat ini.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map((alertItem) => (
            <Card key={alertItem.panicId} className="border border-accent-200 bg-accent-50/50 p-5 flex flex-col justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-accent-600 text-white shadow-lg shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">ALERT DARI: {alertItem.workerName}</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Waktu: {alertItem.createdAt}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] bg-accent-600 text-white font-black px-2.5 py-0.5 rounded-full">
                  AKTIF (SOS)
                </span>
                <Button variant="danger" size="sm" onClick={() => handleOpenPanic(alertItem)}>
                  Buka Detail Lokasi
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Panic Detail Modal */}
      {selectedPanic && (
        <Modal
          isOpen={!!selectedPanic}
          onClose={() => setSelectedPanic(null)}
          title="SOS DETAIL DARURAT MITRA"
          className="border-t-4 border-accent-600"
        >
          <div className="space-y-6 text-sm">
            {/* Worker contact card */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <img 
                src={selectedPanic.worker.photo} 
                alt={selectedPanic.worker.name} 
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-bold text-slate-800">{selectedPanic.worker.name} (Mitra)</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                  <Phone size={12} /> {selectedPanic.phone}
                </p>
              </div>
            </div>

            {/* Coordinates & Location */}
            <div className="space-y-3 bg-accent-50/50 p-4 border border-accent-100 rounded-xl">
              <span className="text-[10px] text-accent-700 font-bold uppercase tracking-wider block">Koordinat Koordinat (Hyperlocal matching)</span>
              
              <div className="flex items-start gap-2 text-xs">
                <MapPin size={16} className="text-accent-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Alamat Pengerjaan:</p>
                  <p className="text-slate-600 text-xs font-semibold leading-relaxed mt-0.5">{selectedPanic.job.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs pt-2 border-t border-accent-100/50">
                <Compass size={14} className="text-accent-600" />
                <span className="font-bold text-slate-700">Latitude: {selectedPanic.latitude}, Longitude: {selectedPanic.longitude}</span>
              </div>
            </div>

            {/* Job Summary */}
            <div className="p-3 bg-slate-50 rounded-xl border text-xs">
              <p className="font-bold text-slate-700">Detail Pemesanan Pekerjaan:</p>
              <p className="text-slate-500 mt-1 font-semibold">Layanan: {selectedPanic.job.service}</p>
              <p className="text-slate-500 font-semibold">Nama Klien: {selectedPanic.job.clientName}</p>
            </div>

            {/* Emergency Action */}
            <div className="flex gap-3">
              <a 
                href={`tel:${selectedPanic.phone}`}
                className="flex-1 inline-flex items-center justify-center font-bold px-4 py-2.5 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-xs"
              >
                 Hubungi Polisi / 112
              </a>
              <Button
                variant="success"
                className="flex-1 py-2.5 font-bold text-xs"
                onClick={() => handleResolve(selectedPanic.job.jobId)}
              >
                Kondisi Aman (Selesai)
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default AdminPanic;
