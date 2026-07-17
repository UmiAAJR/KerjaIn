import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import Card from '../../components/ui/Card';
import { Star, Calendar, ChevronRight, Briefcase } from 'lucide-react';

const ClientHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientApi.getHistory()
      .then(res => {
        setHistory(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <MobileLayout title="Riwayat Pekerjaan">
      <div className="px-5 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-bold text-slate-400">Belum ada riwayat pekerjaan</p>
            <p className="text-xs text-slate-400">Lakukan pemesanan jasa hyperlocal pertama Anda!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((job) => (
              <Card
                key={job.jobId}
                hoverable
                onClick={() => navigate(`/client/tracking/${job.jobId}`)}
                className="border border-slate-100 hover:border-primary-100 space-y-3"
              >
                {/* Header: Date and Status */}
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold">{job.date}</span>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase
                    ${job.status === 'Finished' ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-600'}`}>
                    {job.status}
                  </span>
                </div>

                {/* Body: Worker and details */}
                <div className="flex items-center gap-3">
                  <img
                    src={job.workerPhoto}
                    alt={job.workerName}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="flex-grow min-w-0">
                    <h5 className="text-xs font-bold text-slate-800">{job.workerName}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                      <Briefcase size={10} /> {job.service}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-slate-800">Rp{job.price.toLocaleString('id-ID')}</span>
                    {job.rating > 0 && (
                      <div className="flex items-center justify-end gap-0.5 text-warning-500 mt-0.5">
                        <Star size={10} fill="currentColor" />
                        <span className="text-[10px] font-bold text-slate-700">{job.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer details button */}
                <div className="flex items-center justify-between text-[10px] text-primary-600 font-bold pt-1">
                  <span>Lihat Detail Lacak</span>
                  <ChevronRight size={12} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default ClientHistory;
