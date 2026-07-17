import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import { workerApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  Check, 
  X, 
  Play, 
  Flag, 
  DollarSign,
  AlertOctagon
} from 'lucide-react';

const WorkerActivity = () => {
  const { user } = useAuth();
  const { acceptBooking, rejectBooking, startJob, finishJob, togglePanic } = useJobs();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming'); // incoming vs active
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async () => {
    if (user?.id) {
      try {
        const res = await workerApi.getActiveJobs(user.id);
        setJobs(res);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 4000); // Polling status
    return () => clearInterval(interval);
  }, [user]);

  const handleAccept = async (id) => {
    try {
      await acceptBooking(id);
      fetchJobs();
      alert('Pemesanan diterima! Status diubah menjadi "Worker Accepted".');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectBooking(id);
      fetchJobs();
      alert('Pemesanan ditolak.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStart = async (id) => {
    try {
      await startJob(id);
      fetchJobs();
      alert('Pekerjaan dimulai! Status diubah menjadi "In Progress".');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFinish = async (id) => {
    try {
      await finishJob(id);
      fetchJobs();
      alert('Pekerjaan dilaporkan selesai. Menunggu konfirmasi Klien.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePanicClick = async (job) => {
    const nextState = !job.panicEnabled;
    try {
      await togglePanic(job.jobId, nextState);
      fetchJobs();
      alert(nextState ? 'DARURAT! Sinyal bahaya dikirim ke Admin KerjaIn.' : 'Sinyal bahaya dinonaktifkan.');
    } catch (err) {
      alert(err.message);
    }
  };

  const incomingJobs = jobs.filter(j => ['Booking', 'Escrow Paid'].includes(j.status));
  const activeWorkingJobs = jobs.filter(j => ['Worker Accepted', 'On The Way', 'In Progress', 'Waiting Confirmation'].includes(j.status));

  return (
    <MobileLayout title="Kelola Pekerjaan">
      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-100 sticky top-0 z-10 shrink-0">
        <button
          onClick={() => { setActiveTab('incoming'); setSelectedJob(null); }}
          className={`flex-1 py-3.5 text-xs font-bold text-center border-b-2 transition-all
            ${activeTab === 'incoming' 
              ? 'border-primary-600 text-primary-600 font-extrabold' 
              : 'border-transparent text-slate-400'}`}
        >
          Pesanan Masuk ({incomingJobs.length})
        </button>
        <button
          onClick={() => { setActiveTab('active'); setSelectedJob(null); }}
          className={`flex-1 py-3.5 text-xs font-bold text-center border-b-2 transition-all
            ${activeTab === 'active' 
              ? 'border-primary-600 text-primary-600 font-extrabold' 
              : 'border-transparent text-slate-400'}`}
        >
          Pekerjaan Aktif ({activeWorkingJobs.length})
        </button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (activeTab === 'incoming' ? incomingJobs : activeWorkingJobs).length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-bold text-slate-400">Tidak ada pekerjaan di tab ini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(activeTab === 'incoming' ? incomingJobs : activeWorkingJobs).map((job) => {
              const isSelected = selectedJob?.jobId === job.jobId;
              return (
                <Card 
                  key={job.jobId}
                  className={`border transition-all duration-200
                    ${isSelected ? 'border-primary-500 ring-2 ring-primary-500/10' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  {/* Card Header */}
                  <div 
                    className="flex justify-between items-start cursor-pointer pb-2 border-b border-slate-50"
                    onClick={() => setSelectedJob(isSelected ? null : job)}
                  >
                    <div>
                      <span className="bg-primary-50 text-primary-700 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        {job.service}
                      </span>
                      <h4 className="text-xs font-bold text-slate-700 mt-2">Klien: {job.clientName}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-800">Rp{job.price.toLocaleString('id-ID')}</span>
                      <p className="text-[9px] text-slate-400 mt-0.5 flex items-center justify-end gap-1">
                        <Calendar size={10} /> {job.date}
                      </p>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  <div className="pt-3 space-y-4">
                    <div className="text-xs text-slate-500 font-medium space-y-1.5">
                      <p className="flex items-start gap-1.5">
                        <MapPin size={14} className="text-primary-600 shrink-0 mt-0.5" />
                        <span>Alamat: {job.address}</span>
                      </p>
                      <p className="flex items-start gap-1.5">
                        <Calendar size={14} className="text-slate-400 shrink-0" />
                        <span>Jadwal: {job.schedule}</span>
                      </p>
                      {job.description && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] mt-2">
                          <span className="font-bold text-slate-600 block mb-1">Catatan Pekerjaan:</span>
                          {job.description}
                        </div>
                      )}
                    </div>

                    {/* Escrow Paid Alert banner */}
                    {job.status === 'Escrow Paid' && (
                      <div className="p-2.5 bg-success-50 text-success-700 text-[10px] font-bold rounded-xl border border-success-100 flex items-center gap-1.5">
                        <DollarSign size={14} /> Dana Klien telah aman tersimpan di Escrow KerjaIn.
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="text-slate-400 font-semibold">Status Pekerjaan:</span>
                      <span className={`font-black px-2 py-0.5 rounded-full uppercase
                        ${job.status === 'Finished' ? 'bg-success-100 text-success-700' : 'bg-primary-100 text-primary-700'}`}>
                        {job.status}
                      </span>
                    </div>

                    {/* Action Buttons depending on Job state */}
                    <div className="flex gap-2 pt-2 border-t border-slate-50">
                      {job.status === 'Booking' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 py-2 font-bold text-xs"
                            onClick={() => handleReject(job.jobId)}
                          >
                            <X size={12} className="mr-1" /> Tolak
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 py-2 font-bold text-xs"
                            onClick={() => handleAccept(job.jobId)}
                          >
                            <Check size={12} className="mr-1" /> Terima
                          </Button>
                        </>
                      )}

                      {job.status === 'Escrow Paid' && (
                        <Button 
                          size="sm" 
                          className="w-full py-2 font-bold text-xs"
                          onClick={() => handleAccept(job.jobId)}
                        >
                          <Play size={12} className="mr-1" /> Terima & Mulai
                        </Button>
                      )}

                      {job.status === 'Worker Accepted' && (
                        <Button 
                          size="sm" 
                          className="w-full py-2.5 font-bold text-xs"
                          onClick={() => handleStart(job.jobId)}
                        >
                          <Play size={12} className="mr-1" /> OTW & Mulai Kerja
                        </Button>
                      )}

                      {job.status === 'In Progress' && (
                        <Button 
                          variant="success"
                          size="sm" 
                          className="w-full py-2.5 font-bold text-xs"
                          onClick={() => handleFinish(job.jobId)}
                        >
                          <Flag size={12} className="mr-1" /> Laporkan Selesai
                        </Button>
                      )}

                      {job.status === 'Waiting Confirmation' && (
                        <div className="text-center w-full py-2 bg-slate-100 text-slate-500 font-bold text-[10px] rounded-xl border border-slate-200">
                          Menunggu Konfirmasi Penyelesaian dari Klien
                        </div>
                      )}

                      {/* Active Working Panic Alert */}
                      {['Worker Accepted', 'In Progress'].includes(job.status) && (
                        <button
                          onClick={() => handlePanicClick(job)}
                          className={`p-2 rounded-xl transition-all border shrink-0
                            ${job.panicEnabled 
                              ? 'bg-accent-600 border-accent-600 text-white animate-pulse' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-accent-600'}`}
                          title="Tombol Panik"
                        >
                          <ShieldAlert size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default WorkerActivity;
