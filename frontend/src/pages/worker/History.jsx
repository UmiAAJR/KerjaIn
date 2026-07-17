import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workerApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import Card from '../../components/ui/Card';
import { Calendar, Briefcase, Star } from 'lucide-react';

const WorkerHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      workerApi.getHistory(user.id)
        .then(res => {
          setHistory(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <MobileLayout title="Riwayat Pekerjaan">
      <div className="px-5 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-bold text-slate-400">Belum ada riwayat selesai</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((job) => (
              <Card key={job.jobId} className="border border-slate-100 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Calendar size={10} /> {job.date}
                  </span>
                  <span className="bg-success-100 text-success-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    SELESAI
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Klien: {job.clientName}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                      <Briefcase size={10} /> {job.service}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800">Rp{job.price.toLocaleString('id-ID')}</span>
                    {job.rating > 0 && (
                      <div className="flex items-center justify-end gap-0.5 text-warning-500 mt-0.5">
                        <Star size={10} fill="currentColor" />
                        <span className="text-[10px] font-bold text-slate-700">{job.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {job.comment && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-500 italic">
                    "{job.comment}"
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default WorkerHistory;
